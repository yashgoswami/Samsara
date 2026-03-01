/**
 * Input handling for mouse, touch, and keyboard
 */
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouseX = 0;
    this.mouseY = 0;
    this.worldTargetX = 0;
    this.worldTargetY = 0;
    this.active = false;
    this.chatFocused = false;

    this.onZoom = null;
    this.onChat = null;

    this._bindEvents();
  }

  _bindEvents() {
    // Mouse
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.active = true;
    });

    // Touch
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
        this.active = true;
      }
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
        this.active = true;
      }
    });

    // Scroll zoom
    window.addEventListener('wheel', (e) => {
      if (this.onZoom) {
        this.onZoom(e.deltaY);
      }
      e.preventDefault();
    }, { passive: false });

    // Keyboard - chat
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('focus', () => {
        this.chatFocused = true;
      });
      chatInput.addEventListener('blur', () => {
        this.chatFocused = false;
      });
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const msg = chatInput.value.trim();
          if (msg && this.onChat) {
            this.onChat(msg);
          }
          chatInput.value = '';
          chatInput.blur();
        }
        if (e.key === 'Escape') {
          chatInput.blur();
        }
        e.stopPropagation();
      });
    }

    // Global Enter to focus chat
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.chatFocused && chatInput) {
        chatInput.focus();
        e.preventDefault();
      }
    });
  }

  /**
   * Update world target based on mouse position and camera
   */
  updateWorldTarget(camera, canvasWidth, canvasHeight) {
    const world = camera.screenToWorld(this.mouseX, this.mouseY, canvasWidth, canvasHeight);
    this.worldTargetX = world.x;
    this.worldTargetY = world.y;
  }
}
