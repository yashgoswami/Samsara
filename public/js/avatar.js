/**
 * Avatar rendering - sleek spaceships with engine trails
 */

const TAU = Math.PI * 2;

/**
 * Rounded rectangle polyfill for older browsers
 */
function roundedRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export class Avatar {
  constructor(data) {
    this.id = data.id;
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.targetX = data.x || 0;
    this.targetY = data.y || 0;
    this.angle = data.angle || 0;
    this.targetAngle = data.angle || 0;
    this.hue = data.hue || 0;
    this.name = data.name || '';
    this.speed = data.speed || 0;
    this.isLocal = false;

    // Animation state
    this.tailWag = 0;
    this.glowPulse = 0;
    this.trail = [];
    this.maxTrailLength = 35;
    this.birthTime = performance.now();

    // Chat bubble
    this.chatMessage = '';
    this.chatTimer = 0;

    // Interpolation for remote players
    this.interpSpeed = 0.12;
  }

  setTarget(x, y, angle, speed) {
    this.targetX = x;
    this.targetY = y;
    this.targetAngle = angle;
    this.speed = speed;
  }

  update(dt) {
    // Interpolate position for remote players
    if (!this.isLocal) {
      this.x += (this.targetX - this.x) * this.interpSpeed;
      this.y += (this.targetY - this.y) * this.interpSpeed;

      let angleDiff = this.targetAngle - this.angle;
      while (angleDiff > Math.PI) angleDiff -= TAU;
      while (angleDiff < -Math.PI) angleDiff += TAU;
      this.angle += angleDiff * this.interpSpeed;
    }

    // Animation timers
    const time = performance.now() * 0.001;
    this.tailWag = Math.sin(time * 6 + this.hue) * 0.3;
    this.glowPulse = 0.7 + Math.sin(time * 2 + this.hue * 0.1) * 0.3;

    // Update trail
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }

    // Chat timer
    if (this.chatTimer > 0) {
      this.chatTimer -= dt;
      if (this.chatTimer <= 0) {
        this.chatMessage = '';
      }
    }
  }

  showChat(message) {
    this.chatMessage = message;
    this.chatTimer = 5000;
  }

  draw(ctx) {
    const size = 22;
    const hue = this.hue;
    const glow = this.glowPulse;
    const age = (performance.now() - this.birthTime) * 0.001;
    const time = performance.now() * 0.001;

    // Spawn animation: scale up in first 0.5s
    const spawnScale = Math.min(1, age * 2);

    // --- Engine exhaust trail (world-space) ---
    this._drawEngineTrail(ctx, size, hue, glow);

    ctx.save();
    ctx.translate(this.x, this.y);

    if (spawnScale < 1) {
      ctx.scale(spawnScale, spawnScale);
    }

    ctx.rotate(this.angle);

    // --- Engine glow at the back ---
    this._drawEngineGlow(ctx, size, hue, glow, time);

    // --- Shield / aura ---
    this._drawShield(ctx, size, hue, glow);

    // --- Ship body ---
    this._drawShipBody(ctx, size, hue, glow);

    // --- Cockpit window ---
    this._drawCockpit(ctx, size, hue);

    // --- Wing detail lines ---
    this._drawWingDetails(ctx, size, hue);

    ctx.restore();

    // Name & chat bubble (world-space, not rotated)
    this._drawLabel(ctx, size, spawnScale);
  }

  _drawEngineTrail(ctx, size, hue, glow) {
    if (this.trail.length < 2 || this.speed < 0.3) return;

    ctx.save();

    const trailLen = Math.min(this.trail.length, Math.floor(10 + this.speed * 6));

    for (let i = 1; i < trailLen; i++) {
      const t = i / trailLen;
      const alpha = (1 - t) * 0.45 * glow * Math.min(this.speed / 2, 1);
      const r = size * (1 - t) * 0.25;
      const p = this.trail[i];

      // Double trail for two engines
      const perpX = Math.cos(this.angle + Math.PI / 2);
      const perpY = Math.sin(this.angle + Math.PI / 2);
      const spread = size * 0.3;

      // Left engine trail
      ctx.beginPath();
      ctx.arc(p.x + perpX * spread, p.y + perpY * spread, Math.max(r, 0.3), 0, TAU);
      ctx.fillStyle = `hsla(${hue + 20}, 90%, 75%, ${alpha})`;
      ctx.fill();

      // Right engine trail
      ctx.beginPath();
      ctx.arc(p.x - perpX * spread, p.y - perpY * spread, Math.max(r, 0.3), 0, TAU);
      ctx.fillStyle = `hsla(${hue + 20}, 90%, 75%, ${alpha})`;
      ctx.fill();

      // Center hot trail
      if (i < trailLen * 0.4) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(r * 0.5, 0.2), 0, TAU);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _drawEngineGlow(ctx, size, hue, glow, time) {
    const flicker = 0.7 + 0.3 * Math.sin(time * 15 + this.hue);
    const intensity = Math.min(this.speed / 2, 1) * glow * flicker;

    if (intensity < 0.05) return;

    const engineSpread = size * 0.3;

    // Left engine flame
    const leftGrad = ctx.createRadialGradient(-size * 0.7, -engineSpread, 0, -size * 0.7, -engineSpread, size * 0.8);
    leftGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.8})`);
    leftGrad.addColorStop(0.2, `hsla(${hue + 30}, 100%, 75%, ${intensity * 0.6})`);
    leftGrad.addColorStop(0.5, `hsla(${hue + 15}, 90%, 60%, ${intensity * 0.3})`);
    leftGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(-size * 0.7, -engineSpread, size * 0.8, 0, TAU);
    ctx.fillStyle = leftGrad;
    ctx.fill();

    // Right engine flame
    const rightGrad = ctx.createRadialGradient(-size * 0.7, engineSpread, 0, -size * 0.7, engineSpread, size * 0.8);
    rightGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.8})`);
    rightGrad.addColorStop(0.2, `hsla(${hue + 30}, 100%, 75%, ${intensity * 0.6})`);
    rightGrad.addColorStop(0.5, `hsla(${hue + 15}, 90%, 60%, ${intensity * 0.3})`);
    rightGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(-size * 0.7, engineSpread, size * 0.8, 0, TAU);
    ctx.fillStyle = rightGrad;
    ctx.fill();
  }

  _drawShield(ctx, size, hue, glow) {
    // Subtle shield aura (more visible for local player)
    const shieldAlpha = this.isLocal ? 0.08 * glow : 0.04 * glow;

    const shieldGrad = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 2.5);
    shieldGrad.addColorStop(0, `hsla(${hue}, 70%, 70%, ${shieldAlpha})`);
    shieldGrad.addColorStop(0.6, `hsla(${hue}, 60%, 60%, ${shieldAlpha * 0.4})`);
    shieldGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(0, 0, size * 2.5, 0, TAU);
    ctx.fillStyle = shieldGrad;
    ctx.fill();

    // Local player ring
    if (this.isLocal) {
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.4, 0, TAU);
      ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.12 * glow})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  _drawShipBody(ctx, size, hue, glow) {
    // Ship is oriented pointing RIGHT (angle=0 means pointing right)
    // Main hull shape: sleek arrow/dart
    ctx.beginPath();
    // Nose
    ctx.moveTo(size * 1.2, 0);
    // Upper hull curve to wing
    ctx.quadraticCurveTo(size * 0.6, -size * 0.15, size * 0.1, -size * 0.25);
    // Upper wing
    ctx.lineTo(-size * 0.5, -size * 0.7);
    // Wing tip to body
    ctx.lineTo(-size * 0.7, -size * 0.5);
    // Back of ship upper
    ctx.lineTo(-size * 0.6, -size * 0.2);
    // Engine notch
    ctx.lineTo(-size * 0.8, -size * 0.15);
    ctx.lineTo(-size * 0.8, size * 0.15);
    ctx.lineTo(-size * 0.6, size * 0.2);
    // Back of ship lower
    ctx.lineTo(-size * 0.7, size * 0.5);
    // Lower wing
    ctx.lineTo(-size * 0.5, size * 0.7);
    // Lower hull curve
    ctx.lineTo(size * 0.1, size * 0.25);
    ctx.quadraticCurveTo(size * 0.6, size * 0.15, size * 1.2, 0);
    ctx.closePath();

    // Hull gradient
    const hullGrad = ctx.createLinearGradient(0, -size * 0.7, 0, size * 0.7);
    hullGrad.addColorStop(0, `hsla(${hue}, 40%, 75%, 0.95)`);
    hullGrad.addColorStop(0.35, `hsla(${hue}, 55%, 55%, 0.95)`);
    hullGrad.addColorStop(0.5, `hsla(${hue}, 60%, 45%, 0.9)`);
    hullGrad.addColorStop(0.65, `hsla(${hue}, 55%, 55%, 0.95)`);
    hullGrad.addColorStop(1, `hsla(${hue}, 40%, 75%, 0.95)`);

    ctx.fillStyle = hullGrad;
    ctx.fill();

    // Hull edge highlight
    ctx.strokeStyle = `hsla(${hue}, 50%, 80%, 0.5)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Top specular shine along the center ridge
    ctx.beginPath();
    ctx.moveTo(size * 1.1, 0);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.08, -size * 0.5, 0);
    ctx.quadraticCurveTo(size * 0.3, size * 0.02, size * 1.1, 0);
    ctx.closePath();

    const shineGrad = ctx.createLinearGradient(0, -size * 0.1, 0, size * 0.05);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGrad;
    ctx.fill();
  }

  _drawCockpit(ctx, size, hue) {
    // Cockpit window — a rounded elongated shape near the nose
    ctx.beginPath();
    ctx.ellipse(size * 0.45, 0, size * 0.3, size * 0.12, 0, 0, TAU);

    const cockpitGrad = ctx.createRadialGradient(
      size * 0.4, -size * 0.03, 0,
      size * 0.45, 0, size * 0.3
    );
    cockpitGrad.addColorStop(0, 'rgba(180, 220, 255, 0.9)');
    cockpitGrad.addColorStop(0.5, `hsla(${hue + 180}, 60%, 55%, 0.7)`);
    cockpitGrad.addColorStop(1, `hsla(${hue + 200}, 50%, 30%, 0.5)`);

    ctx.fillStyle = cockpitGrad;
    ctx.fill();

    // Cockpit rim
    ctx.strokeStyle = `hsla(${hue}, 30%, 80%, 0.4)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  _drawWingDetails(ctx, size, hue) {
    ctx.save();
    ctx.strokeStyle = `hsla(${hue}, 40%, 70%, 0.25)`;
    ctx.lineWidth = 0.5;

    // Wing stripes - upper
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.28);
    ctx.lineTo(-size * 0.55, -size * 0.62);
    ctx.stroke();

    // Wing stripes - lower
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, size * 0.28);
    ctx.lineTo(-size * 0.55, size * 0.62);
    ctx.stroke();

    // Engine ports (small circles)
    const engineY = size * 0.3;
    ctx.fillStyle = `hsla(${hue + 20}, 60%, 50%, 0.5)`;

    ctx.beginPath();
    ctx.arc(-size * 0.75, -engineY, size * 0.08, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-size * 0.75, engineY, size * 0.08, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  _drawLabel(ctx, size, scale) {
    if (scale < 0.5) return; // Don't draw labels during spawn animation

    // Name
    if (this.name) {
      ctx.save();
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = `hsla(${this.hue}, 60%, 80%, 0.8)`;
      ctx.fillText(this.name, this.x, this.y - size - 18);
      ctx.restore();
    }

    // Chat bubble
    if (this.chatMessage) {
      ctx.save();
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';

      const metrics = ctx.measureText(this.chatMessage);
      const padding = 10;
      const bw = metrics.width + padding * 2;
      const bh = 24;
      const bx = this.x - bw / 2;
      const by = this.y - size - 45;

      // Bubble background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      roundedRect(ctx, bx, by, bw, bh, 6);
      ctx.fill();

      // Bubble border
      ctx.strokeStyle = `hsla(${this.hue}, 50%, 60%, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Bubble text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.chatMessage, this.x, by + bh / 2);
      ctx.restore();
    }
  }
}
