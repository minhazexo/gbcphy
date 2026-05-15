import React, { useRef, useEffect, useCallback } from 'react';
import './ParticleBackground.scss';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  const getColorPalette = useCallback(() => {
    const palettes = [
      { hue: 180, sat: 80, light: 60 }, // Cyan
      { hue: 220, sat: 75, light: 55 }, // Blue
      { hue: 260, sat: 70, light: 65 }, // Purple
      { hue: 300, sat: 65, light: 60 }, // Pink
      { hue: 150, sat: 85, light: 50 }, // Teal
    ];
    return palettes[Math.floor(Math.random() * palettes.length)];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let mouseX = null;
    let mouseY = null;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseSize = Math.random() * 2.5 + 1;
        this.size = this.baseSize;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        const color = getColorPalette();
        this.hue = color.hue + (Math.random() - 0.5) * 20;
        this.sat = color.sat;
        this.light = color.light;
        this.alpha = Math.random() * 0.4 + 0.3;
        this.baseAlpha = this.alpha;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.glowSize = this.baseSize * 2;
      }

      update(time) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        this.speedX += (Math.random() - 0.5) * 0.015;
        this.speedY += (Math.random() - 0.5) * 0.015;

        const maxSpeed = 0.6;
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        if (speed > maxSpeed) {
          this.speedX = (this.speedX / speed) * maxSpeed;
          this.speedY = (this.speedY / speed) * maxSpeed;
        }

        this.alpha = this.baseAlpha + Math.sin(time * 0.002 + this.pulseOffset) * 0.15;
        this.size = this.baseSize + Math.sin(time * 0.003 + this.pulseOffset) * 0.5;

        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            this.speedX -= (dx / dist) * force * 0.02;
            this.speedY -= (dy / dist) * force * 0.02;
            this.size = this.baseSize + force * 2;
            this.alpha = Math.min(1, this.baseAlpha + force * 0.5);
          }
        }
      }

      draw() {
        ctx.save();
        
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.glowSize
        );
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.alpha})`);
        gradient.addColorStop(0.4, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light + 10}%, ${this.alpha + 0.2})`;
        ctx.fill();

        ctx.restore();
      }
    }

    const initParticles = () => {
      particlesRef.current = [];
      const baseCount = Math.floor((canvas.width * canvas.height) / 9000);
      const particleCount = Math.min(120, Math.max(60, baseCount));

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    };

    const connectParticles = () => {
      const particles = particlesRef.current;
      const maxDistance = 120;
      const farDistance = 200;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const alpha = 0.25 * (1 - distance / maxDistance);
            ctx.beginPath();
            ctx.strokeStyle = `hsla(210, 70%, 60%, ${alpha})`;
            ctx.lineWidth = 0.8 * (1 - distance / maxDistance);
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          } else if (distance < farDistance) {
            const alpha = 0.08 * (1 - (distance - maxDistance) / (farDistance - maxDistance));
            ctx.beginPath();
            ctx.strokeStyle = `hsla(210, 60%, 50%, ${alpha})`;
            ctx.lineWidth = 0.3 * (1 - (distance - maxDistance) / (farDistance - maxDistance));
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(11, 18, 32, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      connectParticles();

      particlesRef.current.forEach(particle => {
        particle.update(time);
        particle.draw();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = null;
      mouseY = null;
    };

    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [getColorPalette]);

  return (
    <canvas 
      ref={canvasRef} 
      className="sci-particle-canvas"
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;