/**
 * Samsara – Karma Hazards
 *
 * Dark-energy projectiles that spawn around the player and drift toward
 * them. The player must dodge to avoid negative karma. Hazards come in
 * three menacing flavors and spawn more aggressively as karma goes lower.
 *
 * Types:
 *   - Shadow Orb     — slow, homing, drains -5 karma
 *   - Void Shard     — fast in a straight line, drains -8 karma
 *   - Wrath Seeker   — fast, homing, drains -12 karma, rarer
 */

const TAU = Math.PI * 2;

// ── Hazard type definitions ──────────────────────────────────────
const HAZARD_TYPES = [
  {
    name: 'Shadow Orb',
    karma: -5,
    speed: 55,
    homing: 0.6,       // turn rate toward player (radians/s)
    radius: 12,
    hue: 270,
    weight: 5,          // spawn weight (higher = more common)
    lifetime: 12000,     // ms before it fizzles out
  },
  {
    name: 'Void Shard',
    karma: -8,
    speed: 120,
    homing: 0,           // flies straight
    radius: 9,
    hue: 200,
    weight: 3,
    lifetime: 8000,
  },
  {
    name: 'Wrath Seeker',
    karma: -12,
    speed: 85,
    homing: 1.2,
    radius: 15,
    hue: 0,
    weight: 1,
    lifetime: 14000,
  },
];

const TOTAL_WEIGHT = HAZARD_TYPES.reduce((s, t) => s + t.weight, 0);

function pickType() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const t of HAZARD_TYPES) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return HAZARD_TYPES[0];
}

// ── Individual Hazard ────────────────────────────────────────────
class Hazard {
  constructor(x, y, angle, type) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * type.speed;
    this.vy = Math.sin(angle) * type.speed;
    this.type = type;
    this.radius = type.radius;
    this.age = 0;
    this.lifetime = type.lifetime;
    this.phase = Math.random() * TAU;
    this.dead = false;
  }

  update(dt, playerX, playerY) {
    this.age += dt;
    if (this.age >= this.lifetime) {
      this.dead = true;
      return;
    }

    // Homing behavior: gradually steer toward player
    if (this.type.homing > 0) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const desired = Math.atan2(dy, dx);
      const current = Math.atan2(this.vy, this.vx);

      // Shortest-angle difference
      let diff = desired - current;
      while (diff > Math.PI) diff -= TAU;
      while (diff < -Math.PI) diff += TAU;

      const steer = Math.sign(diff) * Math.min(Math.abs(diff), this.type.homing * (dt / 1000));
      const newAngle = current + steer;
      this.vx = Math.cos(newAngle) * this.type.speed;
      this.vy = Math.sin(newAngle) * this.type.speed;
    }

    this.x += this.vx * (dt / 1000);
    this.y += this.vy * (dt / 1000);
  }

  draw(ctx, time) {
    const { x, y, radius: r, type, phase, age, lifetime } = this;
    const pulse = 0.75 + 0.25 * Math.sin(time * 3 + phase);
    const fadeIn = Math.min(1, age / 400);
    const fadeOut = Math.min(1, (lifetime - age) / 600);
    const alpha = fadeIn * fadeOut;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    const hue = type.hue;

    // Outer menacing glow
    const glow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 3);
    glow.addColorStop(0, `hsla(${hue}, 80%, 40%, ${0.25 * pulse})`);
    glow.addColorStop(0.4, `hsla(${hue}, 70%, 25%, ${0.08 * pulse})`);
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 3, 0, TAU);
    ctx.fillStyle = glow;
    ctx.fill();

    if (type.name === 'Shadow Orb') {
      // Swirling dark sphere
      const rot = time * 1.5 + phase;
      for (let i = 0; i < 4; i++) {
        const a = rot + (i / 4) * TAU;
        const ox = Math.cos(a) * r * 0.3;
        const oy = Math.sin(a) * r * 0.3;
        const ring = ctx.createRadialGradient(ox, oy, 0, 0, 0, r);
        ring.addColorStop(0, `hsla(${hue}, 70%, 50%, ${0.2 * pulse})`);
        ring.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fillStyle = ring;
        ctx.fill();
      }
      // Dark core
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.7);
      core.addColorStop(0, `rgba(0, 0, 0, ${0.9 * pulse})`);
      core.addColorStop(0.6, `hsla(${hue}, 80%, 15%, ${0.6 * pulse})`);
      core.addColorStop(1, `hsla(${hue}, 60%, 25%, ${0.1 * pulse})`);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, 0, TAU);
      ctx.fillStyle = core;
      ctx.fill();

    } else if (type.name === 'Void Shard') {
      // Sharp crystalline shard
      const angle = Math.atan2(this.vy, this.vx);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(r * 1.2, 0);
      ctx.lineTo(r * 0.2, -r * 0.5);
      ctx.lineTo(-r * 0.8, -r * 0.2);
      ctx.lineTo(-r * 0.8, r * 0.2);
      ctx.lineTo(r * 0.2, r * 0.5);
      ctx.closePath();
      const shardGrad = ctx.createLinearGradient(-r, 0, r, 0);
      shardGrad.addColorStop(0, `hsla(${hue}, 80%, 20%, ${0.7 * pulse})`);
      shardGrad.addColorStop(0.5, `hsla(${hue}, 90%, 45%, ${0.9 * pulse})`);
      shardGrad.addColorStop(1, `hsla(${hue}, 70%, 30%, ${0.5 * pulse})`);
      ctx.fillStyle = shardGrad;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.4 * pulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Trailing particles
      for (let i = 1; i <= 3; i++) {
        const tx = -r * 0.8 - i * r * 0.5;
        ctx.beginPath();
        ctx.arc(tx, 0, 2 - i * 0.4, 0, TAU);
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${(0.4 - i * 0.1) * pulse})`;
        ctx.fill();
      }

    } else if (type.name === 'Wrath Seeker') {
      // Flaming red/orange orb with angry eye
      const rot = time * 2 + phase;

      // Fire ring
      ctx.beginPath();
      const flames = 12;
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const a = t * TAU;
        const flameR = r * (0.6 + 0.4 * Math.abs(Math.sin(a * flames / 2 + rot)));
        const px = Math.cos(a) * flameR;
        const py = Math.sin(a) * flameR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const fireGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      fireGrad.addColorStop(0, `hsla(30, 100%, 60%, ${0.9 * pulse})`);
      fireGrad.addColorStop(0.4, `hsla(10, 90%, 45%, ${0.7 * pulse})`);
      fireGrad.addColorStop(0.8, `hsla(0, 80%, 25%, ${0.5 * pulse})`);
      fireGrad.addColorStop(1, `hsla(350, 70%, 15%, ${0.2 * pulse})`);
      ctx.fillStyle = fireGrad;
      ctx.fill();

      // Angry eye
      ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * pulse})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.25, r * 0.12, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `hsla(0, 100%, 50%, ${0.9 * pulse})`;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.08, 0, TAU);
      ctx.fill();
    }

    // Danger ring (pulsing)
    const ringAlpha = 0.15 + 0.15 * Math.sin(time * 5 + phase);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, TAU);
    ctx.strokeStyle = `hsla(0, 80%, 55%, ${ringAlpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }
}

// ── Hazard Manager ───────────────────────────────────────────────
export class HazardManager {
  constructor() {
    this.hazards = [];
    this.spawnTimer = 0;
    this.baseInterval = 3000;  // ms between spawns at karma 0
    this.minInterval = 800;    // fastest spawn rate
    this.spawnDistance = 600;   // spawn radius from player
  }

  /**
   * Calculate spawn interval based on karma. Lower karma = more frequent.
   */
  _getSpawnInterval(karma) {
    // At karma 0 → 3s, at karma -30 → 0.8s
    const t = Math.min(1, Math.max(0, -karma / 40));
    return this.baseInterval - t * (this.baseInterval - this.minInterval);
  }

  /**
   * Update all hazards, spawn new ones, check player collision.
   * @returns {Hazard[]} hazards that hit the player this frame
   */
  update(dt, playerX, playerY, playerRadius, karma) {
    const hits = [];

    // Spawn timer
    this.spawnTimer += dt;
    const interval = this._getSpawnInterval(karma);

    if (this.spawnTimer >= interval) {
      this.spawnTimer -= interval;
      this._spawn(playerX, playerY);
    }

    // Update existing hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.update(dt, playerX, playerY);

      if (h.dead) {
        this.hazards.splice(i, 1);
        continue;
      }

      // Collision check
      const dx = playerX - h.x;
      const dy = playerY - h.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < playerRadius + h.radius) {
        hits.push(h);
        h.dead = true;
        this.hazards.splice(i, 1);
      }
    }

    // Cap max hazards to prevent performance issues
    while (this.hazards.length > 30) {
      this.hazards.shift();
    }

    return hits;
  }

  _spawn(px, py) {
    const type = pickType();
    // Spawn at random angle around the player
    const angle = Math.random() * TAU;
    const dist = this.spawnDistance + Math.random() * 200;
    const sx = px + Math.cos(angle) * dist;
    const sy = py + Math.sin(angle) * dist;

    // Initial direction toward player
    const toPlayer = Math.atan2(py - sy, px - sx);
    this.hazards.push(new Hazard(sx, sy, toPlayer, type));
  }

  /**
   * Draw all active hazards.
   */
  draw(ctx) {
    const time = performance.now() * 0.001;
    for (const h of this.hazards) {
      h.draw(ctx, time);
    }
  }

  /**
   * Clear all hazards (e.g. on player death/respawn).
   */
  clear() {
    this.hazards.length = 0;
    this.spawnTimer = 0;
  }
}
