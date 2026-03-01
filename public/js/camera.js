/**
 * Camera system for infinite space navigation
 */
export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.zoom = 1;
    this.targetZoom = 1;
    this.minZoom = 0.3;
    this.maxZoom = 3;
    this.smoothing = 0.08;
    this.zoomSmoothing = 0.1;
  }

  follow(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  zoomBy(delta) {
    this.targetZoom *= delta > 0 ? 0.9 : 1.1;
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom));
  }

  update() {
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
    this.zoom += (this.targetZoom - this.zoom) * this.zoomSmoothing;
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(wx, wy, canvasWidth, canvasHeight) {
    const sx = (wx - this.x) * this.zoom + canvasWidth / 2;
    const sy = (wy - this.y) * this.zoom + canvasHeight / 2;
    return { x: sx, y: sy };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(sx, sy, canvasWidth, canvasHeight) {
    const wx = (sx - canvasWidth / 2) / this.zoom + this.x;
    const wy = (sy - canvasHeight / 2) / this.zoom + this.y;
    return { x: wx, y: wy };
  }

  /**
   * Apply camera transform to canvas context
   */
  applyTransform(ctx, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  restoreTransform(ctx) {
    ctx.restore();
  }
}
