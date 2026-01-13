import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on canvas itself
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const dpr = window.devicePixelRatio || 1;
    // Limit DPR to 2 for performance on high-res screens
    const scale = Math.min(dpr, 2); 
    
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // --- Stars Configuration ---
    // Pre-calculate stars to avoid doing it in render loop
    const stars: { x: number; y: number; r: number; phase: number; speed: number }[] = [];
    const createStars = () => {
      stars.length = 0;
      const starCount = width < 768 ? 100 : 250; // Reduced count for performance
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.5 + 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.005
        });
      }
    };
    createStars();

    // --- Big Dipper Centered Coordinates ---
    // Centered around X=0.5. Y remains in upper portion.
    const bigDipperPoints = [
      { x: 0.65, y: 0.15 },  // Dubhe (Top Right of bowl)
      { x: 0.58, y: 0.18 },  // Merak (Bottom Right of bowl)
      { x: 0.54, y: 0.25 },  // Phecda (Bottom Left of bowl)
      { x: 0.48, y: 0.23 },  // Megrez (Top Left of bowl / start of handle)
      { x: 0.42, y: 0.28 },  // Alioth
      { x: 0.36, y: 0.26 },  // Mizar
      { x: 0.28, y: 0.20 },  // Alkaid (End of handle)
    ];
    
    // Calculate actual screen coordinates once per resize to save calc in loop
    let screenDipper: {x: number, y: number}[] = [];
    const updateDipper = () => {
        // Shift slightly right on mobile to account for portrait width
        const xOffset = width < 768 ? 0.1 : 0; 
        screenDipper = bigDipperPoints.map(p => ({
            x: (p.x + xOffset) * width,
            y: p.y * height
        }));
    };
    updateDipper();

    const meteors: { x: number; y: number; vx: number; vy: number; len: number; a: number; thickness: number }[] = [];

    // --- Animation Loop ---
    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      
      // Efficient clear
      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, width, height);
      
      // We can use a simpler gradient drawing method or cached gradient
      // for performance, just simple fill is fastest, but let's keep a subtle gradient
      // by drawing a large rect with gradient only once if possible, but canvas clears every frame.
      // Optimizing: Create gradient once
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617'); 
      gradient.addColorStop(1, '#1e1b4b'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const alpha = 0.5 + 0.5 * Math.sin(tick * star.speed + star.phase);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2. Draw Big Dipper
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const swayX = Math.sin(tick * 0.005) * 5;
      const swayY = Math.cos(tick * 0.005) * 2;

      for (let i = 0; i < screenDipper.length; i++) {
        const x = screenDipper[i].x + swayX;
        const y = screenDipper[i].y + swayY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Dipper Stars
      for (let i = 0; i < screenDipper.length; i++) {
        const x = screenDipper[i].x + swayX;
        const y = screenDipper[i].y + swayY;
        const blink = 0.6 + 0.4 * Math.sin(tick * 0.05 + i);

        // Glow
        ctx.fillStyle = `rgba(255, 215, 0, ${blink * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255, 255, 240, ${blink})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Meteors
      // Limit meteor spawn rate
      if (meteors.length < 3 && Math.random() < 0.01) {
          const startX = Math.random() * width;
          meteors.push({
            x: startX,
            y: -50,
            vx: -3 - Math.random() * 3,
            vy: 3 + Math.random() * 3,
            len: Math.random() * 100 + 50,
            a: 1,
            thickness: Math.random() * 1.5 + 0.5
          });
      }
      
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.a -= 0.02;

        if (m.y > height + 200 || m.x < -200 || m.a <= 0) {
          meteors.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 5, m.y - m.vy * 5);
        grad.addColorStop(0, `rgba(255,255,255,${m.a})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * (m.len / 10), m.y - m.vy * (m.len / 10));
        ctx.stroke();
      }

      // 4. Draw Fireworks
      for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
        const fw = fireworksRef.current[i];
        fw.update();
        fw.draw(ctx);
        if (fw.done) fireworksRef.current.splice(i, 1);
      }

      if (Math.random() < 0.01) { 
        launchFirework(Math.random() * width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(scale, scale);
      createStars();
      updateDipper();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const launchFirework = (x: number, y: number) => {
    const targetY = y * (0.2 + Math.random() * 0.3); 
    const color = `hsl(${Math.random() * 50 + 20}, 100%, 70%)`; 
    fireworksRef.current.push(new Firework(x, y, x, targetY, color));
  };

  const handleClick = (e: React.MouseEvent) => {
    launchFirework(e.clientX, window.innerHeight);
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0 }} 
      onClick={handleClick}
    />
  );
};

class Firework {
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  particles: any[] = [];
  exploded: boolean = false;
  done: boolean = false;

  constructor(x: number, y: number, tx: number, ty: number, color: string) {
    this.x = x;
    this.y = y;
    this.tx = tx;
    this.ty = ty;
    this.color = color;
  }

  update() {
    if (!this.exploded) {
      const dy = this.ty - this.y;
      this.y += dy * 0.1; // Faster rise
      this.x += (this.tx - this.x) * 0.1;
      if (Math.abs(dy) < 10) this.explode();
    } else {
      for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          p.alpha -= 0.02; // Faster fade
      }
      this.particles = this.particles.filter(p => p.alpha > 0);
      if (this.particles.length === 0) this.done = true;
    }
  }

  explode() {
    this.exploded = true;
    for (let i = 0; i < 40; i++) { // Fewer particles for performance
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: this.color
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.exploded) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
}

export default StarryBackground;
