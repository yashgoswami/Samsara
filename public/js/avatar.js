/**
 * Avatar rendering - cosmic soul-like creatures with glowing trails
 * Inspired by Rumpetroll's tadpoles, but with a spiritual/ethereal aesthetic
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
    const size = 20; // Slightly larger for visibility
    const hue = this.hue;
    const glow = this.glowPulse;
    const age = (performance.now() - this.birthTime) * 0.001;

    // Spawn animation: scale up in first 0.5s
    const spawnScale = Math.min(1, age * 2);

    ctx.save();
    ctx.translate(this.x, this.y);

    // Apply spawn scale
    if (spawnScale < 1) {
      ctx.scale(spawnScale, spawnScale);
    }

    ctx.rotate(this.angle);

    // Draw tail/trail
    this._drawTail(ctx, size, hue, glow);

    // Draw body
    this._drawBody(ctx, size, hue, glow);

    // Draw eyes
    this._drawEyes(ctx, size);

    ctx.restore();

    // Draw name & chat bubble (not rotated, in world space)
    this._drawLabel(ctx, size, spawnScale);
  }

  _drawTail(ctx, size, hue, glow) {
    if (this.trail.length < 2) return;

    ctx.save();
    // Undo rotation and translation so trail renders in world-space
    ctx.rotate(-this.angle);
    ctx.translate(-this.x, -this.y);

    for (let i = 1; i < this.trail.length; i++) {
      const t = i / this.trail.length;
      const alpha = (1 - t) * 0.5 * glow;
      const r = size * (1 - t) * 0.55;
      const p = this.trail[i];

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(r, 0.5), 0, TAU);
      ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
      ctx.fill();
    }

    ctx.restore();
  }

  _drawBody(ctx, size, hue, glow) {
    // Large outer aura glow
    const auraGrad = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 3);
    auraGrad.addColorStop(0, `hsla(${hue}, 80%, 75%, ${0.4 * glow})`);
    auraGrad.addColorStop(0.3, `hsla(${hue}, 70%, 60%, ${0.15 * glow})`);
    auraGrad.addColorStop(0.7, `hsla(${hue}, 60%, 50%, ${0.03 * glow})`);
    auraGrad.addColorStop(1, `hsla(${hue}, 60%, 50%, 0)`);

    ctx.beginPath();
    ctx.arc(0, 0, size * 3, 0, TAU);
    ctx.fillStyle = auraGrad;
    ctx.fill();

    // Main body sphere
    const bodyGrad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.05, 0, 0, size);
    bodyGrad.addColorStop(0, `hsla(${hue}, 50%, 95%, 1)`);
    bodyGrad.addColorStop(0.3, `hsla(${hue}, 70%, 75%, 0.95)`);
    bodyGrad.addColorStop(0.7, `hsla(${hue}, 80%, 55%, 0.9)`);
    bodyGrad.addColorStop(1, `hsla(${hue}, 85%, 40%, 0.7)`);

    ctx.beginPath();
    ctx.arc(0, 0, size, 0, TAU);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Specular highlight
    const shineGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.35, 0, -size * 0.15, -size * 0.15, size * 0.55);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, size, 0, TAU);
    ctx.fillStyle = shineGrad;
    ctx.fill();

    // Subtle ring around local player for easier identification
    if (this.isLocal) {
      ctx.beginPath();
      ctx.arc(0, 0, size + 4, 0, TAU);
      ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.25 * glow})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  _drawEyes(ctx, size) {
    const eyeSpread = size * 0.35;
    const eyeForward = size * 0.3;
    const eyeSize = size * 0.24;
    const pupilSize = size * 0.13;

    // Left eye
    ctx.beginPath();
    ctx.arc(eyeForward, -eyeSpread, eyeSize, 0, TAU);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeForward + pupilSize * 0.35, -eyeSpread, pupilSize, 0, TAU);
    ctx.fillStyle = 'rgba(15, 15, 35, 0.95)';
    ctx.fill();

    // Tiny eye highlight
    ctx.beginPath();
    ctx.arc(eyeForward + pupilSize * 0.1, -eyeSpread - pupilSize * 0.3, pupilSize * 0.3, 0, TAU);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(eyeForward, eyeSpread, eyeSize, 0, TAU);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeForward + pupilSize * 0.35, eyeSpread, pupilSize, 0, TAU);
    ctx.fillStyle = 'rgba(15, 15, 35, 0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeForward + pupilSize * 0.1, eyeSpread - pupilSize * 0.3, pupilSize * 0.3, 0, TAU);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
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
      ctx.fillText(this.name, this.x, this.y - size - 12);
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
