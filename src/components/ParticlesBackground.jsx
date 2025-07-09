// src/components/ParticlesBackground.jsx
import React, { useRef, useEffect } from "react";
import p5 from "p5";

const ParticlesBackground = () => {
  const containerRef = useRef();

  useEffect(() => {
    // Utility functions
    const deg = (a) => (Math.PI / 180) * a;
    const rand = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));

    // p5 sketch function
    const sketch = (p) => {
      const opt = {
        particles: window.innerWidth > 500 ? 1000 : 500,
        noiseScale: 0.009,
        angle: deg(-90),
        h1: rand(0, 360),
        h2: rand(0, 360),
        s1: rand(20, 90),
        s2: rand(20, 90),
        l1: rand(30, 80),
        l2: rand(30, 80),
        strokeWeight: 1.2,
        tail: 82,
      };

      const Particles = [];
      let time = 0;

      class Particle {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.lx = x;
          this.ly = y;
          this.vx = 0;
          this.vy = 0;
          this.ax = 0;
          this.ay = 0;
          this.randomize();
        }

        randomize() {
          const hueSeed = Math.random();
          this.hue = hueSeed > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
          this.sat = hueSeed > 0.5 ? opt.s1 : opt.s2;
          this.light = hueSeed > 0.5 ? opt.l1 : opt.l2;
          this.maxSpeed = hueSeed > 0.5 ? 3 : 2;
        }

        follow() {
          const angle =
            p.noise(this.x * opt.noiseScale, this.y * opt.noiseScale, time * opt.noiseScale) *
              Math.PI *
              0.5 +
            opt.angle;
          this.ax += Math.cos(angle);
          this.ay += Math.sin(angle);
        }

        update() {
          this.follow();

          this.vx += this.ax;
          this.vy += this.ay;

          const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
          const angle = Math.atan2(this.vy, this.vx);
          const m = Math.min(this.maxSpeed, speed);
          this.vx = Math.cos(angle) * m;
          this.vy = Math.sin(angle) * m;

          this.x += this.vx;
          this.y += this.vy;

          this.ax = 0;
          this.ay = 0;

          this.edges();
        }

        edges() {
          if (this.x < 0) {
            this.x = p.width;
            this.updatePrev();
          }
          if (this.x > p.width) {
            this.x = 0;
            this.updatePrev();
          }
          if (this.y < 0) {
            this.y = p.height;
            this.updatePrev();
          }
          if (this.y > p.height) {
            this.y = 0;
            this.updatePrev();
          }
        }

        updatePrev() {
          this.lx = this.x;
          this.ly = this.y;
        }

        render() {
          p.stroke(`hsla(${this.hue}, ${this.sat}%, ${this.light}%, 0.5)`);
          p.line(this.x, this.y, this.lx, this.ly);
          this.updatePrev();
        }
      }

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        for (let i = 0; i < opt.particles; i++) {
          Particles.push(new Particle(p.random(p.width), p.random(p.height)));
        }
        p.strokeWeight(opt.strokeWeight);
      };

      p.draw = () => {
        time++;
        p.background(0, 100 - opt.tail);
        for (const particle of Particles) {
          particle.update();
          particle.render();
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      // Re-randomize colors on click
      p.mouseClicked = () => {
        opt.h1 = rand(0, 360);
        opt.h2 = rand(0, 360);
        opt.s1 = rand(20, 90);
        opt.s2 = rand(20, 90);
        opt.l1 = rand(30, 80);
        opt.l2 = rand(30, 80);
        opt.angle += deg(60) * (Math.random() > 0.5 ? 1 : -1);
        for (const p of Particles) {
          p.randomize();
        }
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);
    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div className="particle-canvas" ref={containerRef}></div>;
};

export default ParticlesBackground;
