/**
 * Samsara - Celestial Background Renderer
 * Procedurally generates an infinite cosmos with stars, nebulae, planets,
 * galaxies, comets, pulsars, star clusters, and cosmic dust.
 */

const TAU = Math.PI * 2;

// ─── Seeded PRNG ─────────────────────────────────────────────────
function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Star Field ──────────────────────────────────────────────────
export class StarField {
  constructor(seed = 42) {
    this.seed = seed;
    this.gridSize = 600;
    this.cache = new Map();
    this.cometCache = [];
    this._initComets();
  }

  _initComets() {
    // Spawn a handful of animated comets
    const rng = seededRandom(this.seed + 999);
    for (let i = 0; i < 8; i++) {
      this.cometCache.push({
        x: (rng() - 0.5) * 10000,
        y: (rng() - 0.5) * 10000,
        angle: rng() * TAU,
        speed: 40 + rng() * 80,
        length: 60 + rng() * 120,
        hue: rng() < 0.5 ? 200 : 30, // Blue or golden
        brightness: 0.4 + rng() * 0.4,
      });
    }
  }

  /**
   * Generate all objects in a grid cell
   */
  _generateCell(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const rng = seededRandom(this.seed + cx * 7919 + cy * 104729);
    const objects = [];
    const gs = this.gridSize;

    // ── Dense star field (80-120 stars per cell) ──
    const starCount = 80 + Math.floor(rng() * 40);
    for (let i = 0; i < starCount; i++) {
      const isColored = rng() < 0.15;
      objects.push({
        type: 'star',
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 0.2 + rng() * 1.8,
        brightness: 0.2 + rng() * 0.8,
        twinkleSpeed: 0.3 + rng() * 4,
        twinkleOffset: rng() * TAU,
        hue: isColored ? Math.floor(rng() * 360) : -1,
      });
    }

    // ── Bright prominent stars (2-5 per cell) ──
    const brightCount = 2 + Math.floor(rng() * 4);
    for (let i = 0; i < brightCount; i++) {
      objects.push({
        type: 'bright_star',
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 2 + rng() * 3,
        brightness: 0.6 + rng() * 0.4,
        twinkleSpeed: 0.5 + rng() * 2,
        twinkleOffset: rng() * TAU,
        hue: Math.floor(rng() * 360),
        hasRays: rng() < 0.4,
      });
    }

    // ── Star clusters (~10% of cells) ──
    if (rng() < 0.1) {
      const clusterX = cx * gs + rng() * gs;
      const clusterY = cy * gs + rng() * gs;
      const clusterSize = 40 + rng() * 60;
      const clusterCount = 30 + Math.floor(rng() * 40);
      const clusterHue = Math.floor(rng() * 360);

      for (let i = 0; i < clusterCount; i++) {
        const angle = rng() * TAU;
        const dist = rng() * rng() * clusterSize; // Concentrate toward center
        objects.push({
          type: 'star',
          x: clusterX + Math.cos(angle) * dist,
          y: clusterY + Math.sin(angle) * dist,
          r: 0.3 + rng() * 1.2,
          brightness: 0.4 + rng() * 0.6,
          twinkleSpeed: 1 + rng() * 3,
          twinkleOffset: rng() * TAU,
          hue: clusterHue + Math.floor(rng() * 40 - 20),
        });
      }
    }

    // ── Nebulae (~20% of cells, multiple layers) ──
    if (rng() < 0.2) {
      const nebulaCount = 1 + Math.floor(rng() * 3);
      for (let n = 0; n < nebulaCount; n++) {
        objects.push({
          type: 'nebula',
          x: cx * gs + rng() * gs,
          y: cy * gs + rng() * gs,
          r: 80 + rng() * 250,
          hue: Math.floor(rng() * 360),
          hue2: Math.floor(rng() * 360),
          alpha: 0.015 + rng() * 0.04,
          rotation: rng() * TAU,
          squash: 0.5 + rng() * 0.5, // Elliptical nebulae
        });
      }
    }

    // ── Planets (~8% of cells) ──
    if (rng() < 0.08) {
      const planetHue = Math.floor(rng() * 360);
      const hasRings = rng() < 0.35;
      const hasMoon = rng() < 0.3;
      objects.push({
        type: 'planet',
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 12 + rng() * 35,
        hue: planetHue,
        hasRings,
        ringTilt: 0.2 + rng() * 0.5,
        ringHue: planetHue + 20 + Math.floor(rng() * 40),
        hasMoon,
        moonDist: 0,
        moonAngleOffset: rng() * TAU,
        moonR: 3 + rng() * 5,
        surfaceDetail: rng(), // 0-1: rocky to gaseous
        lightAngle: rng() * TAU,
      });
    }

    // ── Spiral galaxies (~4% of cells) ──
    if (rng() < 0.04) {
      objects.push({
        type: 'galaxy',
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 50 + rng() * 100,
        hue: Math.floor(rng() * 360),
        arms: 2 + Math.floor(rng() * 3),
        rotation: rng() * TAU,
        tightness: 0.3 + rng() * 0.4,
        brightness: 0.15 + rng() * 0.2,
      });
    }

    // ── Pulsars (~3% of cells) ──
    if (rng() < 0.03) {
      objects.push({
        type: 'pulsar',
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 2 + rng() * 3,
        hue: rng() < 0.5 ? 200 : 280, // Blue or purple
        frequency: 2 + rng() * 8,
        beamLength: 30 + rng() * 60,
        beamAngle: rng() * TAU,
      });
    }

    // ── Binary stars (~5% of cells) ──
    if (rng() < 0.05) {
      const bx = cx * gs + rng() * gs;
      const by = cy * gs + rng() * gs;
      const sep = 6 + rng() * 12;
      objects.push({
        type: 'binary',
        x: bx,
        y: by,
        sep,
        hue1: Math.floor(rng() * 60), // Warm
        hue2: 180 + Math.floor(rng() * 60), // Cool
        r1: 1.5 + rng() * 2,
        r2: 1 + rng() * 1.5,
        orbitSpeed: 0.3 + rng() * 0.5,
        orbitOffset: rng() * TAU,
      });
    }

    // ── Cosmic dust lanes (~12% of cells) ──
    if (rng() < 0.12) {
      objects.push({
        type: 'dust',
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 100 + rng() * 200,
        angle: rng() * Math.PI,
        hue: Math.floor(rng() * 360),
        alpha: 0.008 + rng() * 0.015,
        width: 20 + rng() * 50,
      });
    }

    // ── Distant galaxy clusters (faint smudges, ~6% of cells) ──
    if (rng() < 0.06) {
      objects.push({
        type: 'distant_cluster',
        x: cx * gs + rng() * gs,
        y: cy * gs + rng() * gs,
        r: 15 + rng() * 30,
        count: 3 + Math.floor(rng() * 5),
        hue: Math.floor(rng() * 360),
        spread: 20 + rng() * 40,
      });
    }

    this.cache.set(key, objects);

    // Limit cache
    if (this.cache.size > 300) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return objects;
  }

  // ─── Main Draw ─────────────────────────────────────────────────
  draw(ctx, camera, canvasWidth, canvasHeight) {
    const time = performance.now() * 0.001;

    const halfW = (canvasWidth / 2) / camera.zoom;
    const halfH = (canvasHeight / 2) / camera.zoom;
    const margin = this.gridSize;

    const startCX = Math.floor((camera.x - halfW - margin) / this.gridSize);
    const endCX = Math.ceil((camera.x + halfW + margin) / this.gridSize);
    const startCY = Math.floor((camera.y - halfH - margin) / this.gridSize);
    const endCY = Math.ceil((camera.y + halfH + margin) / this.gridSize);

    // First pass: render background objects (nebulae, dust, galaxies)
    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cy = startCY; cy <= endCY; cy++) {
        const objects = this._generateCell(cx, cy);
        for (const obj of objects) {
          switch (obj.type) {
            case 'nebula': this._drawNebula(ctx, obj, time); break;
            case 'dust': this._drawDust(ctx, obj); break;
            case 'galaxy': this._drawGalaxy(ctx, obj, time); break;
            case 'distant_cluster': this._drawDistantCluster(ctx, obj); break;
          }
        }
      }
    }

    // Second pass: render foreground objects (stars, planets, pulsars, etc.)
    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cy = startCY; cy <= endCY; cy++) {
        const objects = this._generateCell(cx, cy);
        for (const obj of objects) {
          switch (obj.type) {
            case 'star': this._drawStar(ctx, obj, time); break;
            case 'bright_star': this._drawBrightStar(ctx, obj, time); break;
            case 'planet': this._drawPlanet(ctx, obj, time); break;
            case 'pulsar': this._drawPulsar(ctx, obj, time); break;
            case 'binary': this._drawBinary(ctx, obj, time); break;
          }
        }
      }
    }

    // Animated comets
    this._drawComets(ctx, camera, canvasWidth, canvasHeight, time);
  }

  // ─── Star ──────────────────────────────────────────────────────
  _drawStar(ctx, s, time) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
    const alpha = s.brightness * twinkle;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, TAU);
    ctx.fillStyle = s.hue >= 0
      ? `hsla(${s.hue}, 70%, 80%, ${alpha})`
      : `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }

  // ─── Bright Star with Glow ────────────────────────────────────
  _drawBrightStar(ctx, s, time) {
    const twinkle = 0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
    const alpha = s.brightness * twinkle;

    // Glow halo
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
    grad.addColorStop(0, `hsla(${s.hue}, 60%, 90%, ${alpha * 0.8})`);
    grad.addColorStop(0.2, `hsla(${s.hue}, 70%, 70%, ${alpha * 0.3})`);
    grad.addColorStop(1, `hsla(${s.hue}, 70%, 50%, 0)`);

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 5, 0, TAU);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, TAU);
    ctx.fillStyle = `hsla(${s.hue}, 30%, 95%, ${alpha})`;
    ctx.fill();

    // Cross-shaped diffraction spikes
    if (s.hasRays) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.4;
      ctx.strokeStyle = `hsla(${s.hue}, 50%, 85%, 1)`;
      ctx.lineWidth = 0.5;

      const rayLen = s.r * 8;
      ctx.beginPath();
      ctx.moveTo(s.x - rayLen, s.y);
      ctx.lineTo(s.x + rayLen, s.y);
      ctx.moveTo(s.x, s.y - rayLen);
      ctx.lineTo(s.x, s.y + rayLen);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ─── Nebula ────────────────────────────────────────────────────
  _drawNebula(ctx, n, time) {
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate(n.rotation);
    ctx.scale(1, n.squash);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.r);
    const pulse = 1 + 0.1 * Math.sin(time * 0.3 + n.hue);
    const a = n.alpha * pulse;

    grad.addColorStop(0, `hsla(${n.hue}, 70%, 60%, ${a * 1.5})`);
    grad.addColorStop(0.3, `hsla(${n.hue2}, 60%, 50%, ${a})`);
    grad.addColorStop(0.6, `hsla(${n.hue + 60}, 50%, 40%, ${a * 0.5})`);
    grad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(0, 0, n.r, 0, TAU);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }

  // ─── Planet ────────────────────────────────────────────────────
  _drawPlanet(ctx, p, time) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Planet shadow (creates crescent effect)
    const lightAngle = p.lightAngle;

    // Atmosphere glow
    const atmoGrad = ctx.createRadialGradient(0, 0, p.r * 0.8, 0, 0, p.r * 1.4);
    atmoGrad.addColorStop(0, 'transparent');
    atmoGrad.addColorStop(0.7, `hsla(${p.hue + 30}, 50%, 60%, 0.05)`);
    atmoGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 1.4, 0, TAU);
    ctx.fillStyle = atmoGrad;
    ctx.fill();

    // Planet body
    const bodyGrad = ctx.createRadialGradient(
      Math.cos(lightAngle) * p.r * 0.3,
      Math.sin(lightAngle) * p.r * 0.3,
      p.r * 0.1,
      0, 0, p.r
    );

    if (p.surfaceDetail < 0.4) {
      // Rocky planet
      bodyGrad.addColorStop(0, `hsla(${p.hue}, 30%, 55%, 0.9)`);
      bodyGrad.addColorStop(0.5, `hsla(${p.hue + 10}, 25%, 40%, 0.85)`);
      bodyGrad.addColorStop(1, `hsla(${p.hue + 20}, 20%, 15%, 0.8)`);
    } else {
      // Gas giant
      bodyGrad.addColorStop(0, `hsla(${p.hue}, 60%, 65%, 0.9)`);
      bodyGrad.addColorStop(0.4, `hsla(${p.hue + 15}, 50%, 50%, 0.85)`);
      bodyGrad.addColorStop(0.7, `hsla(${p.hue - 10}, 45%, 35%, 0.8)`);
      bodyGrad.addColorStop(1, `hsla(${p.hue + 30}, 30%, 20%, 0.75)`);
    }

    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, TAU);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Surface bands for gas giants
    if (p.surfaceDetail >= 0.4) {
      ctx.save();
      ctx.clip(); // Clip to planet circle
      ctx.globalAlpha = 0.15;
      for (let i = -3; i <= 3; i++) {
        const bandY = i * p.r * 0.25;
        ctx.beginPath();
        ctx.ellipse(0, bandY, p.r * 1.1, p.r * 0.06, 0, 0, TAU);
        ctx.fillStyle = `hsla(${p.hue + i * 15}, 40%, ${40 + i * 5}%, 1)`;
        ctx.fill();
      }
      ctx.restore();
    }

    // Rings
    if (p.hasRings) {
      ctx.save();
      ctx.scale(1, p.ringTilt);

      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 2.2, p.r * 2.2, 0, 0, TAU);
      ctx.strokeStyle = `hsla(${p.ringHue}, 40%, 60%, 0.25)`;
      ctx.lineWidth = p.r * 0.15;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.8, p.r * 1.8, 0, 0, TAU);
      ctx.strokeStyle = `hsla(${p.ringHue + 10}, 35%, 55%, 0.18)`;
      ctx.lineWidth = p.r * 0.08;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 2.5, p.r * 2.5, 0, 0, TAU);
      ctx.strokeStyle = `hsla(${p.ringHue - 10}, 30%, 50%, 0.1)`;
      ctx.lineWidth = p.r * 0.05;
      ctx.stroke();

      ctx.restore();
    }

    // Moon
    if (p.hasMoon) {
      const moonDist = p.r * 2.5;
      const moonAngle = time * 0.2 + p.moonAngleOffset;
      const mx = Math.cos(moonAngle) * moonDist;
      const my = Math.sin(moonAngle) * moonDist * 0.4; // Perspective tilt

      const moonGrad = ctx.createRadialGradient(mx - 1, my - 1, 0, mx, my, p.moonR);
      moonGrad.addColorStop(0, 'rgba(200, 200, 210, 0.8)');
      moonGrad.addColorStop(1, 'rgba(100, 100, 120, 0.4)');

      ctx.beginPath();
      ctx.arc(mx, my, p.moonR, 0, TAU);
      ctx.fillStyle = moonGrad;
      ctx.fill();
    }

    ctx.restore();
  }

  // ─── Spiral Galaxy ────────────────────────────────────────────
  _drawGalaxy(ctx, g, time) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rotation + time * 0.01); // Very slow rotation

    // Core glow
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.r * 0.3);
    coreGrad.addColorStop(0, `hsla(${g.hue + 40}, 40%, 80%, ${g.brightness * 1.5})`);
    coreGrad.addColorStop(0.5, `hsla(${g.hue + 20}, 50%, 60%, ${g.brightness * 0.5})`);
    coreGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(0, 0, g.r * 0.3, 0, TAU);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Spiral arms
    for (let arm = 0; arm < g.arms; arm++) {
      const armOffset = (arm / g.arms) * TAU;
      ctx.beginPath();

      for (let t = 0; t < 1; t += 0.008) {
        const angle = armOffset + t * TAU * 1.5 * g.tightness;
        const dist = t * g.r;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist * 0.6; // Tilt perspective

        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `hsla(${g.hue}, 50%, 70%, ${g.brightness * 0.4})`;
      ctx.lineWidth = g.r * 0.08;
      ctx.stroke();

      // Arm glow
      ctx.strokeStyle = `hsla(${g.hue + 20}, 40%, 60%, ${g.brightness * 0.1})`;
      ctx.lineWidth = g.r * 0.2;
      ctx.stroke();
    }

    // Scattered arm stars
    const rng = seededRandom(this.seed + Math.floor(g.x) + Math.floor(g.y) * 1000);
    for (let i = 0; i < 40; i++) {
      const t = rng() * 0.9;
      const armIdx = Math.floor(rng() * g.arms);
      const armOffset = (armIdx / g.arms) * TAU;
      const angle = armOffset + t * TAU * 1.5 * g.tightness + (rng() - 0.5) * 0.5;
      const dist = t * g.r + (rng() - 0.5) * g.r * 0.15;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist * 0.6;

      ctx.beginPath();
      ctx.arc(sx, sy, 0.3 + rng() * 0.8, 0, TAU);
      ctx.fillStyle = `hsla(${g.hue + rng() * 40}, 50%, 80%, ${0.3 + rng() * 0.4})`;
      ctx.fill();
    }

    ctx.restore();
  }

  // ─── Pulsar ────────────────────────────────────────────────────
  _drawPulsar(ctx, p, time) {
    const phase = (time * p.frequency) % TAU;
    const beamAlpha = Math.max(0, Math.cos(phase)) * 0.6;

    // Beam
    if (beamAlpha > 0.05) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.beamAngle + time * 0.5);

      const beamGrad = ctx.createLinearGradient(0, 0, p.beamLength, 0);
      beamGrad.addColorStop(0, `hsla(${p.hue}, 80%, 80%, ${beamAlpha})`);
      beamGrad.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);

      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(p.beamLength, -0.5);
      ctx.lineTo(p.beamLength, 0.5);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();

      // Opposite beam
      ctx.rotate(Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(p.beamLength, -0.5);
      ctx.lineTo(p.beamLength, 0.5);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();

      ctx.restore();
    }

    // Core
    const corePulse = 0.7 + 0.3 * Math.cos(phase);
    const coreGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
    coreGrad.addColorStop(0, `hsla(${p.hue}, 80%, 90%, ${corePulse})`);
    coreGrad.addColorStop(0.3, `hsla(${p.hue}, 70%, 70%, ${corePulse * 0.4})`);
    coreGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 4, 0, TAU);
    ctx.fillStyle = coreGrad;
    ctx.fill();
  }

  // ─── Binary Star System ───────────────────────────────────────
  _drawBinary(ctx, b, time) {
    const angle = time * b.orbitSpeed + b.orbitOffset;
    const halfSep = b.sep / 2;

    const x1 = b.x + Math.cos(angle) * halfSep;
    const y1 = b.y + Math.sin(angle) * halfSep;
    const x2 = b.x - Math.cos(angle) * halfSep;
    const y2 = b.y - Math.sin(angle) * halfSep;

    // Connection glow
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = `hsla(${(b.hue1 + b.hue2) / 2}, 50%, 60%, 1)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();

    // Star 1
    const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, b.r1 * 4);
    g1.addColorStop(0, `hsla(${b.hue1}, 60%, 90%, 0.9)`);
    g1.addColorStop(0.3, `hsla(${b.hue1}, 70%, 70%, 0.3)`);
    g1.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x1, y1, b.r1 * 4, 0, TAU);
    ctx.fillStyle = g1;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x1, y1, b.r1, 0, TAU);
    ctx.fillStyle = `hsla(${b.hue1}, 40%, 92%, 0.95)`;
    ctx.fill();

    // Star 2
    const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, b.r2 * 4);
    g2.addColorStop(0, `hsla(${b.hue2}, 60%, 90%, 0.9)`);
    g2.addColorStop(0.3, `hsla(${b.hue2}, 70%, 70%, 0.3)`);
    g2.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x2, y2, b.r2 * 4, 0, TAU);
    ctx.fillStyle = g2;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y2, b.r2, 0, TAU);
    ctx.fillStyle = `hsla(${b.hue2}, 40%, 92%, 0.95)`;
    ctx.fill();
  }

  // ─── Cosmic Dust Lane ─────────────────────────────────────────
  _drawDust(ctx, d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.angle);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, d.r);
    grad.addColorStop(0, `hsla(${d.hue}, 40%, 50%, ${d.alpha * 2})`);
    grad.addColorStop(0.5, `hsla(${d.hue + 20}, 30%, 40%, ${d.alpha})`);
    grad.addColorStop(1, 'transparent');

    ctx.scale(2.5, 0.3); // Stretch into a lane
    ctx.beginPath();
    ctx.arc(0, 0, d.r, 0, TAU);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }

  // ─── Distant Galaxy Cluster ───────────────────────────────────
  _drawDistantCluster(ctx, c) {
    const rng = seededRandom(this.seed + Math.floor(c.x * 100) + Math.floor(c.y));
    for (let i = 0; i < c.count; i++) {
      const ox = (rng() - 0.5) * c.spread;
      const oy = (rng() - 0.5) * c.spread;
      const r = 3 + rng() * c.r * 0.3;

      const grad = ctx.createRadialGradient(c.x + ox, c.y + oy, 0, c.x + ox, c.y + oy, r);
      grad.addColorStop(0, `hsla(${c.hue + rng() * 30}, 40%, 65%, 0.15)`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(c.x + ox, c.y + oy, r, 0, TAU);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // ─── Animated Comets ──────────────────────────────────────────
  _drawComets(ctx, camera, canvasWidth, canvasHeight, time) {
    for (const comet of this.cometCache) {
      // Move comet over time (wraps around a large area)
      const cx = comet.x + Math.cos(comet.angle) * comet.speed * time;
      const cy = comet.y + Math.sin(comet.angle) * comet.speed * time;

      // Wrap position into view-relative coordinates
      const period = 5000;
      const wx = ((cx % period) + period) % period - period / 2 + camera.x;
      const wy = ((cy % period) + period) % period - period / 2 + camera.y;

      // Tail
      const tailX = wx - Math.cos(comet.angle) * comet.length;
      const tailY = wy - Math.sin(comet.angle) * comet.length;

      const grad = ctx.createLinearGradient(wx, wy, tailX, tailY);
      grad.addColorStop(0, `hsla(${comet.hue}, 70%, 90%, ${comet.brightness})`);
      grad.addColorStop(0.2, `hsla(${comet.hue}, 60%, 70%, ${comet.brightness * 0.5})`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Head glow
      const headGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, 6);
      headGrad.addColorStop(0, `hsla(${comet.hue}, 50%, 95%, ${comet.brightness})`);
      headGrad.addColorStop(0.5, `hsla(${comet.hue}, 60%, 70%, ${comet.brightness * 0.3})`);
      headGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(wx, wy, 6, 0, TAU);
      ctx.fillStyle = headGrad;
      ctx.fill();
    }
  }
}

// ─── Orientation Grid ────────────────────────────────────────────
export function drawGrid(ctx, camera, canvasWidth, canvasHeight) {
  const gridSize = 200;
  const halfW = (canvasWidth / 2) / camera.zoom;
  const halfH = (canvasHeight / 2) / camera.zoom;

  const startX = Math.floor((camera.x - halfW) / gridSize) * gridSize;
  const endX = Math.ceil((camera.x + halfW) / gridSize) * gridSize;
  const startY = Math.floor((camera.y - halfH) / gridSize) * gridSize;
  const endY = Math.ceil((camera.y + halfH) / gridSize) * gridSize;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.lineWidth = 0.5;

  ctx.beginPath();
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();
}
