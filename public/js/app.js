/**
 * Samsara - Main Application Module
 * Orchestrates all systems: rendering, networking, input, camera
 */

import { Connection } from './connection.js';
import { Camera } from './camera.js';
import { Input } from './input.js';
import { Avatar, Explosion } from './avatar.js';
import { StarField, drawGrid } from './starfield.js';
import { Collectibles, KarmaPopup } from './collectibles.js';

// ─── State ───────────────────────────────────────────────────────
const canvas = document.getElementById('cosmos');
const ctx = canvas.getContext('2d');

const connection = new Connection();
const camera = new Camera();
const input = new Input(canvas);
const starField = new StarField();
const collectibles = new Collectibles();

let localPlayer = null;
const remotePlayers = new Map();
const karmaPopups = [];
const explosions = [];
let localKarma = 0;
let respawning = false;
const KARMA_DEATH_THRESHOLD = -50;

let playerName = '';
let running = false;
let lastTime = 0;

// ─── Canvas Sizing ───────────────────────────────────────────────
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  // Use setTransform to guarantee correct DPR each frame
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const W = () => window.innerWidth;
const H = () => window.innerHeight;

// ─── Intro Flow ──────────────────────────────────────────────────
const introOverlay = document.getElementById('intro-overlay');
const enterBtn = document.getElementById('enter-btn');
const nameInput = document.getElementById('name-input');
const hud = document.getElementById('hud');
const chatContainer = document.getElementById('chat-container');

enterBtn.addEventListener('click', startGame);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});

function startGame() {
  playerName = nameInput.value.trim() || 'Soul';
  introOverlay.classList.add('fade-out');
  hud.classList.remove('hidden');
  chatContainer.classList.remove('hidden');
  document.body.style.cursor = 'none';

  // Create the local avatar IMMEDIATELY so it's visible right away
  // (doesn't wait for server connection)
  createLocalAvatar();

  // Start connection (server will update our ID later)
  connection.connect();
  running = true;
  lastTime = performance.now();
}

/**
 * Create the local player avatar immediately (doesn't wait for server)
 */
function createLocalAvatar() {
  const spawnX = (Math.random() - 0.5) * 2000;
  const spawnY = (Math.random() - 0.5) * 2000;
  const hue = Math.floor(Math.random() * 360);

  localPlayer = new Avatar({
    id: 'local_' + Date.now(),
    x: spawnX,
    y: spawnY,
    angle: 0,
    hue,
    name: playerName,
    speed: 0,
  });
  localPlayer.isLocal = true;

  // Snap camera to spawn position instantly
  camera.x = spawnX;
  camera.y = spawnY;
  camera.targetX = spawnX;
  camera.targetY = spawnY;
}

// ─── Networking ──────────────────────────────────────────────────
connection.on('init', (msg) => {
  // Update local player with server-assigned ID
  if (localPlayer) {
    localPlayer.id = msg.id;
    localPlayer.hue = msg.player.hue;
  } else {
    // Fallback: create from server data if somehow not created yet
    localPlayer = new Avatar(msg.player);
    localPlayer.isLocal = true;
    localPlayer.name = playerName;
    camera.x = localPlayer.x;
    camera.y = localPlayer.y;
    camera.targetX = localPlayer.x;
    camera.targetY = localPlayer.y;
  }

  if (msg.starSeed) {
    starField.seed = msg.starSeed;
    starField.cache.clear();
    collectibles.seed = msg.starSeed;
    collectibles.cache.clear();
  }

  // Let server know our name and position
  connection.send({ type: 'set_name', name: playerName });
  connection.send({
    type: 'update',
    x: localPlayer.x,
    y: localPlayer.y,
    angle: localPlayer.angle,
    speed: localPlayer.speed,
    name: playerName,
  });

  // Add existing players
  for (const p of msg.players) {
    const avatar = new Avatar(p);
    remotePlayers.set(p.id, avatar);
  }
  updatePlayerCount();
});

connection.on('player_join', (msg) => {
  const avatar = new Avatar(msg.player);
  remotePlayers.set(msg.player.id, avatar);
  updatePlayerCount();
});

connection.on('player_update', (msg) => {
  const avatar = remotePlayers.get(msg.id);
  if (avatar) {
    avatar.setTarget(msg.x, msg.y, msg.angle, msg.speed);
    if (msg.name) avatar.name = msg.name;
  }
});

connection.on('player_name', (msg) => {
  const avatar = remotePlayers.get(msg.id);
  if (avatar) avatar.name = msg.name;
});

connection.on('player_leave', (msg) => {
  remotePlayers.delete(msg.id);
  updatePlayerCount();
});

connection.on('chat', (msg) => {
  if (msg.id === localPlayer?.id) {
    localPlayer.showChat(msg.message);
  } else {
    const avatar = remotePlayers.get(msg.id);
    if (avatar) avatar.showChat(msg.message);
  }
  addChatMessage(msg.id, msg.message);
});

connection.on('collect', (msg) => {
  // Another player collected an object — remove it for us too
  collectibles.collect(msg.objectId);
});

connection.on('player_exploded', (msg) => {
  // Another player exploded — show their explosion
  const avatar = remotePlayers.get(msg.id);
  if (avatar) {
    explosions.push(new Explosion(avatar.x, avatar.y, avatar.hue));
    remotePlayers.delete(msg.id);
  }
});

connection.on('player_respawn', (msg) => {
  // Another player respawned — update or recreate their avatar
  let avatar = remotePlayers.get(msg.id);
  if (avatar) {
    avatar.x = msg.x;
    avatar.y = msg.y;
    avatar.targetX = msg.x;
    avatar.targetY = msg.y;
    avatar.hue = msg.hue;
    avatar.trail = [];
    avatar.birthTime = performance.now();
  } else {
    avatar = new Avatar({ id: msg.id, x: msg.x, y: msg.y, hue: msg.hue, name: '' });
    remotePlayers.set(msg.id, avatar);
  }
  updatePlayerCount();
});

// ─── Input Callbacks ─────────────────────────────────────────────
input.onZoom = (delta) => camera.zoomBy(delta);

input.onChat = (message) => {
  connection.send({ type: 'chat', message });
  if (localPlayer) localPlayer.showChat(message);
  addChatMessage(localPlayer?.id, message);
};

// ─── Network Update Throttle ─────────────────────────────────────
let lastNetworkUpdate = 0;
const NETWORK_RATE = 50;

function sendPositionUpdate() {
  const now = performance.now();
  if (now - lastNetworkUpdate < NETWORK_RATE) return;
  lastNetworkUpdate = now;

  if (localPlayer && connection.connected) {
    connection.send({
      type: 'update',
      x: localPlayer.x,
      y: localPlayer.y,
      angle: localPlayer.angle,
      speed: localPlayer.speed,
      name: localPlayer.name,
    });
  }
}

// ─── Game Loop ───────────────────────────────────────────────────
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);
  if (!running) return;

  const dt = Math.min(timestamp - lastTime, 100); // Cap delta to avoid huge jumps
  lastTime = timestamp;

  const w = W();
  const h = H();

  // Reset transform each frame for DPR consistency
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Clear with deep space
  ctx.fillStyle = '#030008';
  ctx.fillRect(0, 0, w, h);

  if (localPlayer) {
    // Update input
    input.updateWorldTarget(camera, w, h);
    updateLocalPlayer(dt);

    // Camera follows player
    camera.follow(localPlayer.x, localPlayer.y);
    camera.update();

    // Update avatars
    localPlayer.update(dt);
    remotePlayers.forEach(p => p.update(dt));

    // Collectible collision detection
    const hits = collectibles.checkCollisions(
      localPlayer.x, localPlayer.y, 18, camera, w, h
    );
    for (const obj of hits) {
      localKarma += obj.karma;
      karmaPopups.push(new KarmaPopup(obj.x, obj.y, obj.karma, obj.positive));
      connection.send({
        type: 'collect',
        objectId: obj.id,
        karma: obj.karma,
      });
    }

    // Check karma death threshold
    if (localKarma <= KARMA_DEATH_THRESHOLD && !respawning) {
      triggerKarmaDeath();
    }

    // Update karma popups
    for (let i = karmaPopups.length - 1; i >= 0; i--) {
      karmaPopups[i].update(dt);
      if (karmaPopups[i].isDead()) karmaPopups.splice(i, 1);
    }

    // Update explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].update(dt);
      if (explosions[i].isDead()) {
        explosions.splice(i, 1);
      }
    }

    // Network sync
    sendPositionUpdate();
  }

  // World-space rendering
  camera.applyTransform(ctx, w, h);

  starField.draw(ctx, camera, w, h);
  drawGrid(ctx, camera, w, h);

  // Collectible objects (between background and players)
  collectibles.draw(ctx, camera, w, h);

  remotePlayers.forEach(p => p.draw(ctx));
  if (localPlayer && !respawning) localPlayer.draw(ctx);

  // Karma popups (world-space)
  for (const popup of karmaPopups) popup.draw(ctx);

  // Explosions (world-space)
  for (const expl of explosions) expl.draw(ctx);

  camera.restoreTransform(ctx);

  // Screen-space overlays
  drawCursor(ctx);
  if (localPlayer) {
    drawNearestIndicator(ctx, w, h);
    updateHUD();
  }
}

function updateLocalPlayer(dt) {
  if (!localPlayer || !input.active) return;

  const dx = input.worldTargetX - localPlayer.x;
  const dy = input.worldTargetY - localPlayer.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const targetAngle = Math.atan2(dy, dx);

  let angleDiff = targetAngle - localPlayer.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  localPlayer.angle += angleDiff * 0.1;

  const maxSpeed = 4;
  const minDist = 20;
  const speed = dist > minDist ? Math.min(dist * 0.03, maxSpeed) : 0;
  localPlayer.speed = speed;

  if (speed > 0) {
    localPlayer.x += Math.cos(localPlayer.angle) * speed;
    localPlayer.y += Math.sin(localPlayer.angle) * speed;
  }
}

// ─── Karma Death & Respawn ───────────────────────────────────────
function triggerKarmaDeath() {
  if (!localPlayer || respawning) return;
  respawning = true;

  // Create explosion at current position
  explosions.push(new Explosion(localPlayer.x, localPlayer.y, localPlayer.hue));

  // Broadcast death to others
  connection.send({ type: 'karma_death' });

  // After explosion, respawn
  setTimeout(() => {
    respawnAvatar();
  }, 2000);
}

function respawnAvatar() {
  const spawnX = (Math.random() - 0.5) * 4000;
  const spawnY = (Math.random() - 0.5) * 4000;
  const newHue = Math.floor(Math.random() * 360);

  localPlayer.x = spawnX;
  localPlayer.y = spawnY;
  localPlayer.targetX = spawnX;
  localPlayer.targetY = spawnY;
  localPlayer.angle = 0;
  localPlayer.speed = 0;
  localPlayer.hue = newHue;
  localPlayer.trail = [];
  localPlayer.birthTime = performance.now();

  // Reset karma
  localKarma = 0;

  // Snap camera to new position
  camera.x = spawnX;
  camera.y = spawnY;
  camera.targetX = spawnX;
  camera.targetY = spawnY;

  // Notify server of respawn
  connection.send({
    type: 'respawn',
    x: spawnX,
    y: spawnY,
    hue: newHue,
  });

  respawning = false;
}

// ─── Rendering Helpers ───────────────────────────────────────────
function drawCursor(ctx) {
  if (!input.active) return;
  const mx = input.mouseX;
  const my = input.mouseY;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;

  const s = 8;
  ctx.beginPath();
  ctx.moveTo(mx - s, my);
  ctx.lineTo(mx + s, my);
  ctx.moveTo(mx, my - s);
  ctx.lineTo(mx, my + s);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(mx, my, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fill();
  ctx.restore();
}

// ─── Nearest Avatar Direction Indicator ──────────────────────────
function findNearestPlayer() {
  if (!localPlayer || remotePlayers.size === 0) return null;

  let nearest = null;
  let nearestDist = Infinity;

  remotePlayers.forEach(p => {
    const dx = p.x - localPlayer.x;
    const dy = p.y - localPlayer.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = p;
    }
  });

  return nearest ? { player: nearest, dist: nearestDist } : null;
}

function drawNearestIndicator(ctx, w, h) {
  const result = findNearestPlayer();
  if (!result) return;

  const { player, dist } = result;
  const dx = player.x - localPlayer.x;
  const dy = player.y - localPlayer.y;
  const angle = Math.atan2(dy, dx);

  // Check if the player is visible on screen
  const screen = camera.worldToScreen(player.x, player.y, w, h);
  const margin = 60;
  if (screen.x > margin && screen.x < w - margin &&
      screen.y > margin && screen.y < h - margin) {
    return; // Player is visible, no indicator needed
  }

  const cx = w / 2;
  const cy = h / 2;
  const edgePad = 50;

  // Place the indicator along the edge of the screen
  // Intersect the direction ray with the screen bounding box
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  let t = Infinity;
  if (cosA > 0) t = Math.min(t, (cx - edgePad) / cosA);
  if (cosA < 0) t = Math.min(t, -(cx - edgePad) / cosA);
  if (sinA > 0) t = Math.min(t, (cy - edgePad) / sinA);
  if (sinA < 0) t = Math.min(t, -(cy - edgePad) / sinA);

  const ix = cx + cosA * t;
  const iy = cy + sinA * t;

  const hue = player.hue;
  const time = performance.now() * 0.001;
  const pulse = 0.6 + 0.4 * Math.sin(time * 3);

  // Glow behind the arrow
  ctx.save();
  const glowGrad = ctx.createRadialGradient(ix, iy, 0, ix, iy, 30);
  glowGrad.addColorStop(0, `hsla(${hue}, 80%, 70%, ${0.15 * pulse})`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(ix, iy, 30, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();

  // Arrow triangle
  ctx.translate(ix, iy);
  ctx.rotate(angle);

  const arrowSize = 10 + 2 * pulse;
  ctx.beginPath();
  ctx.moveTo(arrowSize, 0);
  ctx.lineTo(-arrowSize * 0.6, -arrowSize * 0.6);
  ctx.lineTo(-arrowSize * 0.3, 0);
  ctx.lineTo(-arrowSize * 0.6, arrowSize * 0.6);
  ctx.closePath();

  ctx.fillStyle = `hsla(${hue}, 75%, 70%, ${0.7 * pulse})`;
  ctx.fill();
  ctx.strokeStyle = `hsla(${hue}, 60%, 85%, ${0.5 * pulse})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();

  // Distance label
  ctx.save();
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Format distance
  let label;
  if (dist < 100) {
    label = `${Math.round(dist)}`;
  } else if (dist < 1000) {
    label = `${Math.round(dist)}`;
  } else {
    label = `${(dist / 1000).toFixed(1)}k`;
  }

  // Name + distance
  const name = player.name || 'Soul';
  const text = `${name}  •  ${label}`;

  // Position label offset from arrow
  const labelOffX = ix - Math.cos(angle) * 22;
  const labelOffY = iy - Math.sin(angle) * 22;

  // Background pill
  const metrics = ctx.measureText(text);
  const pw = metrics.width + 14;
  const ph = 18;
  ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
  ctx.beginPath();
  ctx.ellipse(labelOffX, labelOffY, pw / 2, ph / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `hsla(${hue}, 60%, 80%, 0.9)`;
  ctx.fillText(text, labelOffX, labelOffY);
  ctx.restore();
}

// ─── HUD ─────────────────────────────────────────────────────────
function updateHUD() {
  if (!localPlayer) return;

  const coordEl = document.getElementById('coordinates');
  if (coordEl) {
    coordEl.textContent = `${Math.round(localPlayer.x)}, ${Math.round(localPlayer.y)}`;
  }

  const karmaEl = document.getElementById('karma-display');
  if (karmaEl) {
    const sign = localKarma >= 0 ? '+' : '';
    karmaEl.textContent = `Karma: ${sign}${localKarma}`;
    karmaEl.className = localKarma > 0 ? 'positive' : localKarma < 0 ? 'negative' : '';
  }

  drawMinimap();
}

function updatePlayerCount() {
  const el = document.getElementById('player-count');
  if (el) {
    const count = remotePlayers.size + (localPlayer ? 1 : 0);
    el.textContent = `Souls: ${count}`;
  }
}

function drawMinimap() {
  const mc = document.getElementById('minimap');
  if (!mc) return;
  const mctx = mc.getContext('2d');
  const mw = mc.width;
  const mh = mc.height;

  mctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  mctx.fillRect(0, 0, mw, mh);

  const scale = 0.02;
  const cx = mw / 2;
  const cy = mh / 2;

  remotePlayers.forEach(p => {
    const dx = (p.x - (localPlayer?.x || 0)) * scale;
    const dy = (p.y - (localPlayer?.y || 0)) * scale;
    if (Math.abs(dx) < mw / 2 && Math.abs(dy) < mh / 2) {
      mctx.beginPath();
      mctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2);
      mctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.8)`;
      mctx.fill();
    }
  });

  mctx.beginPath();
  mctx.arc(cx, cy, 3, 0, Math.PI * 2);
  mctx.fillStyle = localPlayer ? `hsla(${localPlayer.hue}, 80%, 70%, 1)` : '#fff';
  mctx.fill();

  mctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  mctx.lineWidth = 1;
  mctx.strokeRect(0, 0, mw, mh);
}

// ─── Chat ────────────────────────────────────────────────────────
function addChatMessage(senderId, message) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  let name = 'Unknown';
  let hue = 0;

  if (senderId === localPlayer?.id) {
    name = localPlayer.name || 'You';
    hue = localPlayer.hue;
  } else {
    const avatar = remotePlayers.get(senderId);
    if (avatar) {
      name = avatar.name || 'Soul';
      hue = avatar.hue;
    }
  }

  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.innerHTML = `<span class="chat-name" style="color: hsl(${hue}, 70%, 70%)">${escapeHtml(name)}:</span> ${escapeHtml(message)}`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  while (container.children.length > 50) {
    container.removeChild(container.firstChild);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Start ───────────────────────────────────────────────────────
requestAnimationFrame(gameLoop);
