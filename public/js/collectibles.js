/**
 * Samsara - Collectible Celestial Objects
 * Positive karma objects: Lotus flowers, Dharma wheels, Sacred crystals
 * Negative karma objects: Void rifts, Dark matter, Cursed flames
 *
 * Objects are procedurally generated per grid cell, deterministic via seed.
 * Each has a unique ID so the server can track which have been collected.
 */

const TAU = Math.PI * 2;

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Collectible types ───────────────────────────────────────────
const POSITIVE_TYPES = ['lotus', 'crystal', 'dharma'];
const NEGATIVE_TYPES = ['void', 'darkmatter', 'cursedflame'];

export class Collectibles {
  constructor(seed = 42) {
    this.seed = seed;
    this.gridSize = 800;
    this.cache = new Map();
    this.collected = new Set(); // IDs of collected objects
  }

  /**
   * Generate collectible objects for a grid cell
   */
  _generateCell(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const rng = seededRandom(this.seed * 3 + cx * 6271 + cy * 81239);
    const objects = [];
    const gs = this.gridSize;

    // 2-4 positive objects per cell
    const posCount = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < posCount; i++) {
      const typeIdx = Math.floor(rng() * POSITIVE_TYPES.length);
      objects.push({
        id: `p_${cx}_${cy}_${i}`,
        type: POSITIVE_TYPES[typeIdx],
        karma: 5 + Math.floor(rng() * 15), // +5 to +20
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 14 + rng() * 10,
        hue: typeIdx === 0 ? 300 : typeIdx === 1 ? 180 : 45, // Pink / Cyan / Gold
        phase: rng() * TAU,
        positive: true,
      });
    }

    // 1-2 negative objects per cell (rarer)
    const negCount = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < negCount; i++) {
      const typeIdx = Math.floor(rng() * NEGATIVE_TYPES.length);
      objects.push({
        id: `n_${cx}_${cy}_${i}`,
        type: NEGATIVE_TYPES[typeIdx],
        karma: -(3 + Math.floor(rng() * 10)), // -3 to -13
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 16 + rng() * 12,
        hue: typeIdx === 0 ? 270 : typeIdx === 1 ? 0 : 15,
        phase: rng() * TAU,
        positive: false,
      });
    }

    this.cache.set(key, objects);
    if (this.cache.size > 200) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    return objects;
  }

  /**
   * Mark an object as collected
   */
  collect(id) {
    this.collected.add(id);
  }

  /**
   * Check collision between player position and all visible collectibles.
   * Returns array of collected objects this frame.
   */
  checkCollisions(px, py, playerRadius, camera, canvasWidth, canvasHeight) {
    const hits = [];
    const halfW = (canvasWidth / 2) / camera.zoom;
    const halfH = (canvasHeight / 2) / camera.zoom;
    const margin = this.gridSize;

    const startCX = Math.floor((camera.x - halfW - margin) / this.gridSize);
    const endCX = Math.ceil((camera.x + halfW + margin) / this.gridSize);
    const startCY = Math.floor((camera.y - halfH - margin) / this.gridSize);
    const endCY = Math.ceil((camera.y + halfH + margin) / this.gridSize);

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cy = startCY; cy <= endCY; cy++) {
        const objects = this._generateCell(cx, cy);
        for (const obj of objects) {
          if (this.collected.has(obj.id)) continue;
          const dx = px - obj.x;
          const dy = py - obj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < playerRadius + obj.r) {
            hits.push(obj);
            this.collected.add(obj.id);
          }
        }
      }
    }
    return hits;
  }

  /**
   * Draw all visible collectibles
   */
  draw(ctx, camera, canvasWidth, canvasHeight) {
    const time = performance.now() * 0.001;
    const halfW = (canvasWidth / 2) / camera.zoom;
    const halfH = (canvasHeight / 2) / camera.zoom;
    const margin = this.gridSize;

    const startCX = Math.floor((camera.x - halfW - margin) / this.gridSize);
    const endCX = Math.ceil((camera.x + halfW + margin) / this.gridSize);
    const startCY = Math.floor((camera.y - halfH - margin) / this.gridSize);
    const endCY = Math.ceil((camera.y + halfH + margin) / this.gridSize);

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cy = startCY; cy <= endCY; cy++) {
        const objects = this._generateCell(cx, cy);
        for (const obj of objects) {
          if (this.collected.has(obj.id)) continue;
          if (obj.positive) {
            this._drawPositive(ctx, obj, time);
          } else {
            this._drawNegative(ctx, obj, time);
          }
        }
      }
    }
  }

  // ─── Positive Object Renderers ─────────────────────────────────

  _drawPositive(ctx, obj, time) {
    switch (obj.type) {
      case 'lotus': this._drawLotus(ctx, obj, time); break;
      case 'crystal': this._drawCrystal(ctx, obj, time); break;
      case 'dharma': this._drawDharma(ctx, obj, time); break;
    }
  }

  _drawLotus(ctx, obj, time) {
    const { x, y, r, phase } = obj;
    const pulse = 0.85 + 0.15 * Math.sin(time * 2 + phase);
    const rot = time * 0.3 + phase;

    ctx.save();
    ctx.translate(x, y);

    // Outer glow
    const glow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.5);
    glow.addColorStop(0, `hsla(300, 70%, 75%, ${0.2 * pulse})`);
    glow.addColorStop(0.5, `hsla(320, 60%, 65%, ${0.06 * pulse})`);
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.5, 0, TAU);
    ctx.fillStyle = glow;
    ctx.fill();

    // Petals (6 petals)
    const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
      const angle = rot + (i / petalCount) * TAU;
      ctx.save();
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.ellipse(r * 0.5, 0, r * 0.55, r * 0.22, 0, 0, TAU);

      const petalGrad = ctx.createRadialGradient(r * 0.3, 0, 0, r * 0.5, 0, r * 0.5);
      petalGrad.addColorStop(0, `hsla(310, 70%, 85%, ${0.85 * pulse})`);
      petalGrad.addColorStop(0.6, `hsla(295, 65%, 70%, ${0.7 * pulse})`);
      petalGrad.addColorStop(1, `hsla(280, 60%, 55%, ${0.3 * pulse})`);

      ctx.fillStyle = petalGrad;
      ctx.fill();
      ctx.restore();
    }

    // Inner petals (smaller layer)
    for (let i = 0; i < petalCount; i++) {
      const angle = rot + ((i + 0.5) / petalCount) * TAU;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(r * 0.3, 0, r * 0.35, r * 0.15, 0, 0, TAU);
      ctx.fillStyle = `hsla(320, 75%, 80%, ${0.6 * pulse})`;
      ctx.fill();
      ctx.restore();
    }

    // Center gem
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.2);
    centerGrad.addColorStop(0, `rgba(255, 255, 200, ${0.9 * pulse})`);
    centerGrad.addColorStop(1, `hsla(45, 80%, 60%, ${0.5 * pulse})`);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fillStyle = centerGrad;
    ctx.fill();

    ctx.restore();
  }

  _drawCrystal(ctx, obj, time) {
    const { x, y, r, phase } = obj;
    const pulse = 0.8 + 0.2 * Math.sin(time * 3 + phase);
    const bob = Math.sin(time * 1.5 + phase) * 3;

    ctx.save();
    ctx.translate(x, y + bob);

    // Glow
    const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2);
    glow.addColorStop(0, `hsla(180, 80%, 75%, ${0.25 * pulse})`);
    glow.addColorStop(0.5, `hsla(190, 70%, 65%, ${0.08 * pulse})`);
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, TAU);
    ctx.fillStyle = glow;
    ctx.fill();

    // Crystal shape (hexagonal prism)
    const hw = r * 0.5;
    const hh = r;

    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(hw, -hh * 0.4);
    ctx.lineTo(hw, hh * 0.4);
    ctx.lineTo(0, hh);
    ctx.lineTo(-hw, hh * 0.4);
    ctx.lineTo(-hw, -hh * 0.4);
    ctx.closePath();

    const crystalGrad = ctx.createLinearGradient(-hw, 0, hw, 0);
    crystalGrad.addColorStop(0, `hsla(170, 60%, 50%, ${0.7 * pulse})`);
    crystalGrad.addColorStop(0.3, `hsla(180, 70%, 80%, ${0.9 * pulse})`);
    crystalGrad.addColorStop(0.5, `hsla(190, 80%, 90%, ${0.95 * pulse})`);
    crystalGrad.addColorStop(0.7, `hsla(180, 70%, 75%, ${0.85 * pulse})`);
    crystalGrad.addColorStop(1, `hsla(195, 60%, 45%, ${0.6 * pulse})`);

    ctx.fillStyle = crystalGrad;
    ctx.fill();
    ctx.strokeStyle = `hsla(180, 60%, 85%, ${0.5 * pulse})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Light refraction lines
    ctx.beginPath();
    ctx.moveTo(-hw * 0.2, -hh * 0.8);
    ctx.lineTo(hw * 0.1, hh * 0.6);
    ctx.moveTo(hw * 0.3, -hh * 0.6);
    ctx.lineTo(-hw * 0.1, hh * 0.4);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * pulse})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Sparkle at top
    const sparkle = 0.5 + 0.5 * Math.sin(time * 5 + phase);
    ctx.beginPath();
    ctx.arc(0, -hh, 2, 0, TAU);
    ctx.fillStyle = `rgba(255, 255, 255, ${sparkle * pulse})`;
    ctx.fill();

    ctx.restore();
  }

  _drawDharma(ctx, obj, time) {
    const { x, y, r, phase } = obj;
    const pulse = 0.85 + 0.15 * Math.sin(time * 2 + phase);
    const rot = time * 0.5 + phase;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Glow
    const glow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2);
    glow.addColorStop(0, `hsla(45, 80%, 70%, ${0.2 * pulse})`);
    glow.addColorStop(0.5, `hsla(40, 70%, 60%, ${0.06 * pulse})`);
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, TAU);
    ctx.fillStyle = glow;
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, TAU);
    ctx.strokeStyle = `hsla(45, 70%, 65%, ${0.8 * pulse})`;
    ctx.lineWidth = r * 0.12;
    ctx.stroke();

    // 8 spokes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r * 0.85, Math.sin(angle) * r * 0.85);
      ctx.strokeStyle = `hsla(45, 65%, 60%, ${0.7 * pulse})`;
      ctx.lineWidth = r * 0.06;
      ctx.stroke();

      // Spoke crescent at rim
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * r * 0.85,
        Math.sin(angle) * r * 0.85,
        r * 0.1, angle - Math.PI * 0.7, angle + Math.PI * 0.7
      );
      ctx.strokeStyle = `hsla(50, 70%, 70%, ${0.6 * pulse})`;
      ctx.lineWidth = r * 0.05;
      ctx.stroke();
    }

    // Center hub
    const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.2);
    hubGrad.addColorStop(0, `hsla(50, 80%, 85%, ${pulse})`);
    hubGrad.addColorStop(1, `hsla(40, 70%, 55%, ${0.6 * pulse})`);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.restore();
  }

  // ─── Negative Object Renderers ─────────────────────────────────

  _drawNegative(ctx, obj, time) {
    switch (obj.type) {
      case 'void': this._drawVoid(ctx, obj, time); break;
      case 'darkmatter': this._drawDarkMatter(ctx, obj, time); break;
      case 'cursedflame': this._drawCursedFlame(ctx, obj, time); break;
    }
  }

  _drawVoid(ctx, obj, time) {
    const { x, y, r, phase } = obj;
    const pulse = 0.8 + 0.2 * Math.sin(time * 1.5 + phase);
    const rot = time * -0.4 + phase;

    ctx.save();
    ctx.translate(x, y);

    // Swirling dark aura
    const aura = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2.5);
    aura.addColorStop(0, `rgba(0, 0, 0, ${0.8 * pulse})`);
    aura.addColorStop(0.3, `hsla(270, 80%, 15%, ${0.4 * pulse})`);
    aura.addColorStop(0.6, `hsla(280, 60%, 20%, ${0.1 * pulse})`);
    aura.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.5, 0, TAU);
    ctx.fillStyle = aura;
    ctx.fill();

    // Distortion rings
    for (let i = 0; i < 3; i++) {
      const ringR = r * (0.5 + i * 0.25);
      const ringAlpha = (1 - i * 0.3) * 0.3 * pulse;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, TAU);
      ctx.strokeStyle = `hsla(270, 70%, 35%, ${ringAlpha})`;
      ctx.lineWidth = 1.5 - i * 0.3;
      ctx.stroke();
    }

    // Black hole center
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.5);
    coreGrad.addColorStop(0, `rgba(0, 0, 0, ${0.95 * pulse})`);
    coreGrad.addColorStop(0.7, `hsla(280, 100%, 10%, ${0.7 * pulse})`);
    coreGrad.addColorStop(1, `hsla(270, 80%, 20%, ${0.2 * pulse})`);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, TAU);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Swirl particles
    for (let i = 0; i < 6; i++) {
      const sAngle = rot + (i / 6) * TAU;
      const sDist = r * (0.5 + 0.3 * Math.sin(time * 2 + i));
      const sx = Math.cos(sAngle) * sDist;
      const sy = Math.sin(sAngle) * sDist;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, TAU);
      ctx.fillStyle = `hsla(270, 70%, 50%, ${0.4 * pulse})`;
      ctx.fill();
    }

    // Warning border flash
    const flash = 0.3 + 0.3 * Math.sin(time * 4 + phase);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.strokeStyle = `hsla(0, 80%, 50%, ${flash * pulse})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  _drawDarkMatter(ctx, obj, time) {
    const { x, y, r, phase } = obj;
    const pulse = 0.8 + 0.2 * Math.sin(time * 2 + phase);

    ctx.save();
    ctx.translate(x, y);

    // Dark haze
    const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    haze.addColorStop(0, `hsla(0, 60%, 15%, ${0.5 * pulse})`);
    haze.addColorStop(0.4, `hsla(350, 50%, 12%, ${0.25 * pulse})`);
    haze.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, TAU);
    ctx.fillStyle = haze;
    ctx.fill();

    // Jagged spiky shape
    const points = 8;
    ctx.beginPath();
    for (let i = 0; i <= points * 2; i++) {
      const angle = (i / (points * 2)) * TAU + time * 0.3;
      const spikeR = i % 2 === 0
        ? r * (0.7 + 0.15 * Math.sin(time * 3 + i + phase))
        : r * 0.35;
      const px = Math.cos(angle) * spikeR;
      const py = Math.sin(angle) * spikeR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const spikeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    spikeGrad.addColorStop(0, `hsla(0, 70%, 25%, ${0.8 * pulse})`);
    spikeGrad.addColorStop(0.5, `hsla(350, 60%, 18%, ${0.6 * pulse})`);
    spikeGrad.addColorStop(1, `hsla(340, 50%, 10%, ${0.3 * pulse})`);
    ctx.fillStyle = spikeGrad;
    ctx.fill();

    ctx.strokeStyle = `hsla(0, 80%, 40%, ${0.4 * pulse})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Glowing red eye in center
    const eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.2);
    eyeGrad.addColorStop(0, `hsla(0, 100%, 60%, ${0.9 * pulse})`);
    eyeGrad.addColorStop(0.5, `hsla(0, 80%, 40%, ${0.5 * pulse})`);
    eyeGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fillStyle = eyeGrad;
    ctx.fill();

    ctx.restore();
  }

  _drawCursedFlame(ctx, obj, time) {
    const { x, y, r, phase } = obj;
    const pulse = 0.8 + 0.2 * Math.sin(time * 2.5 + phase);
    const flicker = 0.85 + 0.15 * Math.sin(time * 8 + phase);

    ctx.save();
    ctx.translate(x, y);

    // Dark aura
    const aura = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2);
    aura.addColorStop(0, `hsla(15, 80%, 20%, ${0.3 * pulse})`);
    aura.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, TAU);
    ctx.fillStyle = aura;
    ctx.fill();

    // Flame tongues (3 layers)
    for (let layer = 2; layer >= 0; layer--) {
      const layerScale = 1 - layer * 0.2;
      const hueShift = layer * 15;
      const tongues = 5;

      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const angle = t * TAU;
        const tonguePhase = Math.sin(angle * tongues + time * 4 + phase + layer);
        const flameR = r * layerScale * (0.5 + 0.4 * Math.max(0, tonguePhase)) * flicker;
        const px = Math.cos(angle) * flameR;
        const py = Math.sin(angle) * flameR - r * 0.15 * layerScale; // Drift up slightly

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const flameGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * layerScale);
      flameGrad.addColorStop(0, `hsla(${15 + hueShift}, 100%, ${50 + layer * 15}%, ${(0.7 - layer * 0.15) * pulse})`);
      flameGrad.addColorStop(0.5, `hsla(${10 + hueShift}, 90%, ${35 + layer * 10}%, ${(0.5 - layer * 0.1) * pulse})`);
      flameGrad.addColorStop(1, `hsla(${5 + hueShift}, 80%, 15%, ${0.1 * pulse})`);
      ctx.fillStyle = flameGrad;
      ctx.fill();
    }

    // Skull-like face hint in center (two dots + curve)
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * pulse})`;
    ctx.beginPath();
    ctx.arc(-r * 0.12, -r * 0.05, r * 0.06, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.12, -r * 0.05, r * 0.06, 0, TAU);
    ctx.fill();

    // Ominous smile
    ctx.beginPath();
    ctx.arc(0, r * 0.08, r * 0.12, 0, Math.PI);
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.4 * pulse})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Floating karma change notification
 */
export class KarmaPopup {
  constructor(x, y, amount, positive) {
    this.x = x;
    this.y = y;
    this.amount = amount;
    this.positive = positive;
    this.life = 1500; // ms
    this.age = 0;
  }

  update(dt) {
    this.age += dt;
    this.y -= 0.5; // Float upward
  }

  isDead() {
    return this.age >= this.life;
  }

  draw(ctx) {
    const t = this.age / this.life;
    const alpha = 1 - t;
    const scale = 1 + t * 0.5;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = this.positive
      ? `+${this.amount}`
      : `${this.amount}`;
    const color = this.positive
      ? `rgba(100, 255, 150, ${alpha})`
      : `rgba(255, 80, 80, ${alpha})`;

    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
    ctx.fillText(text, 1, 1);

    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }
}
