/**
 * Céu preto com grid sutil de pixels, estrelas multicoloridas piscantes em pixel art
 * e estrelas cadentes em pixel caindo diagonalmente.
 */

export class PixelStarsBackground {
  constructor(canvasId = 'pixel-stars-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.animationFrameId = null;
    this.isRunning = false;

    // Configurações
    this.gridSpacing = 16; // Espaçamento entre os pontos do grid de pixels
    this.starColors = [
      '#ffffff', 
      '#e2e8f0', 
      '#38bdf8', 
      '#f472b6', 
      '#fbcfe8', 
      '#c084fc',
      '#fde047',
      '#86efac', 
      '#fb7185'
    ];

    this.stars = [];
    this.shootingStars = [];
    this.nextShootingStarTime = Date.now() + 2000;

    this.handleResize = this.handleResize.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    this.handleResize();
    this.createStars();

    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.start();
  }

  handleResize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = false;

    // Recria estrelas proporcionais à área da tela
    this.createStars();
  }

  createStars() {
    this.stars = [];
    // Densidade de estrelas equilibrada e suave
    const area = this.width * this.height;
    const starCount = Math.max(45, Math.min(140, Math.floor(area / 9000)));

    for (let i = 0; i < starCount; i++) {
      const color = this.starColors[Math.floor(Math.random() * this.starColors.length)];
    
      const shapeType = Math.random() < 0.65 ? 0 : Math.random() < 0.88 ? 1 : 2;

      this.stars.push({
        x: Math.floor(Math.random() * this.width),
        y: Math.floor(Math.random() * this.height),
        size: shapeType === 0 ? 2 : shapeType === 1 ? 3 : 4,
        shapeType,
        color,
        baseAlpha: 0.15 + Math.random() * 0.25,
        maxAlpha: 0.75 + Math.random() * 0.25,
        twinkleSpeed: 0.0015 + Math.random() * 0.003,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  spawnShootingStar() {
    const startX = Math.floor(Math.random() * (this.width * 0.85));
    const startY = Math.floor(Math.random() * (this.height * 0.45));
    const angle = 35 + Math.random() * 20; // Ângulo diagonal de descida
    const rad = (angle * Math.PI) / 180;
    const speed = 7 + Math.random() * 5;

    const colors = ['#ffffff', '#f472b6', '#38bdf8', '#fde047', '#e2e8f0'];
    const headColor = colors[Math.floor(Math.random() * colors.length)];

    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed,
      trail: [],
      maxTrailLength: 14 + Math.floor(Math.random() * 8),
      headColor,
      life: 1.0,
      decay: 0.016 + Math.random() * 0.01
    });

    // Próxima estrela cadente em 3.5s a 7s
    this.nextShootingStarTime = Date.now() + 3500 + Math.random() * 3500;
  }

  drawGrid() {

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.038)';
    const dotSize = 1;
    for (let x = 0; x < this.width; x += this.gridSpacing) {
      for (let y = 0; y < this.height; y += this.gridSpacing) {
        this.ctx.fillRect(x, y, dotSize, dotSize);
      }
    }
  }

  drawStar(star, now) {
    const sinVal = Math.sin(now * star.twinkleSpeed + star.twinklePhase);
    const alpha = star.baseAlpha + (star.maxAlpha - star.baseAlpha) * (0.5 + 0.5 * sinVal);

    this.ctx.fillStyle = star.color;
    this.ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));

    const px = Math.floor(star.x);
    const py = Math.floor(star.y);

    if (star.shapeType === 0) {
      this.ctx.fillRect(px, py, 2, 2);
    } else if (star.shapeType === 1) {
      this.ctx.fillRect(px, py, 3, 3);
    } else {
      this.ctx.fillRect(px - 1, py, 4, 2);
      this.ctx.fillRect(px, py - 1, 2, 4);
    }
  }

  updateAndDrawShootingStars() {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];

      
      s.trail.unshift({ x: Math.floor(s.x), y: Math.floor(s.y) });
      if (s.trail.length > s.maxTrailLength) {
        s.trail.pop();
      }

      
      for (let t = 0; t < s.trail.length; t++) {
        const point = s.trail[t];
        const trailAlpha = (1 - t / s.trail.length) * s.life * 0.85;
        if (trailAlpha <= 0.02) continue;

        this.ctx.globalAlpha = trailAlpha;
        this.ctx.fillStyle = t === 0 ? s.headColor : '#cbd5e1';
        const pSize = t < 3 ? 3 : 2;
        this.ctx.fillRect(point.x, point.y, pSize, pSize);
      }

      
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      
      if (s.life <= 0 || s.x > this.width + 50 || s.y > this.height + 50) {
        this.shootingStars.splice(i, 1);
      }
    }
  }

  loop() {
    if (!this.isRunning) return;

    const now = Date.now();

    // Fundo 
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Grid de pixels
    this.drawGrid();

    // Estrelas piscantes
    for (let i = 0; i < this.stars.length; i++) {
      this.drawStar(this.stars[i], now);
    }

    // Spawn e desenho de estrelas cadentes
    if (now >= this.nextShootingStarTime) {
      this.spawnShootingStar();
    }
    this.updateAndDrawShootingStars();

    this.ctx.globalAlpha = 1.0;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

let pixelStarsInstance = null;

export function initPixelStars() {
  if (!pixelStarsInstance) {
    pixelStarsInstance = new PixelStarsBackground('pixel-stars-canvas');
  }
  return pixelStarsInstance;
}
