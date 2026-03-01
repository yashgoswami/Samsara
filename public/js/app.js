/**
 * Samsara - Main Application Module
 * Orchestrates all systems: rendering, networking, input, camera
 */

import { Connection } from './connection.js';
import { Camera } from './camera.js';
import { Input } from './input.js';
import { Avatar } from './avatar.js';
import { StarField, drawGrid } from './starfield.js';

// ─── State ───────────────────────────────────────────────────────
const canvas = document.getElementById('cosmos');
const ctx = canvas.getContext('2d');

const connection = new Connection();
const camera = new Camera();
const input = new Input(canvas);
const starField = new StarField();

let localPlayer = null;
const remotePlayers = new Map();

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

    // Network sync
    sendPositionUpdate();
  }

  // World-space rendering
  camera.applyTransform(ctx, w, h);

  starField.draw(ctx, camera, w, h);
  drawGrid(ctx, camera, w, h);

  remotePlayers.forEach(p => p.draw(ctx));
  if (localPlayer) localPlayer.draw(ctx);

  camera.restoreTransform(ctx);

  // Screen-space overlays
  drawCursor(ctx);
  if (localPlayer) updateHUD();
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

// ─── HUD ─────────────────────────────────────────────────────────
function updateHUD() {
  if (!localPlayer) return;

  const coordEl = document.getElementById('coordinates');
  if (coordEl) {
    coordEl.textContent = `${Math.round(localPlayer.x)}, ${Math.round(localPlayer.y)}`;
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
