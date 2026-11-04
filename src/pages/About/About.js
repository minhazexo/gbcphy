import React from "react";
import "./about.scss";

const STACKS = [
  {
    label: "Frontend",
    items: ["React 18", "Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Drizzle ORM", "Neon Postgres", "JWT Auth", "Resend"],
  },
  {
    label: "Tooling",
    items: ["Vercel", "Git & GitHub", "Playwright", "Vitest", "Bun"],
  },
  {
    label: "Principles",
    items: ["SSR / SSG", "A11y", "SEO", "Responsive", "Clean Architecture"],
  },
];

const SERVICES = [
  {
    icon: "frontend",
    title: "Frontend Engineering",
    desc: "Cinematic, accessible UIs with React & Next.js 14 — animations, glassmorphism, and perfect responsiveness across every device.",
  },
  {
    icon: "fullstack",
    title: "Full-Stack & APIs",
    desc: "Node.js, Neon PostgreSQL + Drizzle ORM, JWT auth, and Resend email — secure, scalable backends that are a joy to maintain.",
  },
  {
    icon: "performance",
    title: "Performance & Growth",
    desc: "WebP, lazy-loading, bundle analysis, and SEO baked in from day one. Your site stays fast as you scale — and ranks.",
  },
];

const LINKS = [
  {
    name: "Portfolio",
    desc: "Live work & case studies",
    url: "https://minhazexo.vercel.app/",
    color: "from-blue-600 to-indigo-600",
    label: "Visit portfolio",
  },
  {
    name: "GitHub",
    desc: "30+ repositories",
    url: "https://github.com/minhazexo/",
    color: "from-gray-700 to-gray-900",
    label: "View code",
  },
  {
    name: "LinkedIn",
    desc: "Professional network",
    url: "https://www.linkedin.com/in/minhazexo",
    color: "from-blue-500 to-blue-700",
    label: "Connect",
  },
  {
    name: "Facebook",
    desc: "Updates & community",
    url: "https://www.facebook.com/61590831477985/",
    color: "from-blue-500 to-blue-600",
    label: "Follow",
  },
];

function ServiceIcon({ type }) {
  if (type === "frontend") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    );
  }
  if (type === "fullstack") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LinkIcon({ name }) {
  if (name === "GitHub") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.82 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3Z" />
      </svg>
    );
  }
  if (name === "LinkedIn") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.55V14.9c0-1.32-.47-2.22-1.66-2.22-.91 0-1.45.61-1.69 1.2-.09.21-.11.51-.11.81v5.76H9.9s.05-9.35 0-10.32h3.55v1.46c.47-.73 1.32-1.77 3.22-1.77 2.35 0 4.11 1.54 4.11 4.84v5.79zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V10.13h3.56v10.32z" />
      </svg>
    );
  }
  if (name === "Facebook") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 17.6 4.06 22.37 9.36 23.23v-8.42H6.55V12.07h2.81V9.98c0-2.77 1.65-4.3 4.17-4.3 1.21 0 2.47.22 2.47.22v2.72h-1.39c-1.37 0-1.8.85-1.8 1.72v2.06h3.06l-.49 2.74h-2.57v8.42C19.94 22.37 24 17.6 24 12.07z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const About = () => {
  return (
    <div className="creator-page">
      <div className="container-page">
        {/* Hero */}
        <div className="hero">
          <div className="hero-text">
            <span className="status-badge">
              <span className="pulse-dot" aria-hidden="true" />
              Available for new projects
            </span>

            <h1>
              I build fast, premium
              <br />
              <span className="gradient-text">web experiences</span> that convert.
            </h1>

            <p className="intro">
              I&apos;m <strong className="text-foreground">MD Mehrab Hossain</strong> — a Full-Stack Web Developer focused on React, Next.js, and Node.js. I craft cinematic, high-performance websites with clean code, thoughtful UX, and obsessive attention to detail. From idea → deployment, I ship products that look amazing and work flawlessly.
            </p>

            <div className="cta-group">
              <a
                href="https://minhazexo.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                View Portfolio
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <a
                href="https://github.com/minhazexo/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.82 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3Z" />
                </svg>
                GitHub
              </a>
            </div>

            <div className="tag-group">
              <span className="tag">React • Next.js • Node.js</span>
              <span className="tag">Performance &amp; SEO Focused</span>
              <span className="tag">Clean, Maintainable Code</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="profile-card">
            <div className="card-gradient" aria-hidden="true" />
            <div className="profile-header">
              <div className="avatar">MH</div>
              <div className="profile-info">
                <div className="name">MD Mehrab Hossain</div>
                <div className="title">Full-Stack Developer</div>
                <div className="location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Bangladesh • Remote Worldwide
                </div>
              </div>
            </div>

            <p className="bio">
              I help founders and teams turn ideas into lightning-fast, beautiful web products. 30+ repositories, production-grade Next.js 14 apps, Neon + Drizzle, and a design system that scales. If you need a site that <em>feels premium and loads instantly</em> — let&apos;s talk.
            </p>

            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">30+</span>
                <span className="stat-label">Repos</span>
              </div>
              <div className="stat">
                <span className="stat-value">100%</span>
                <span className="stat-label">Responsive</span>
              </div>
              <div className="stat">
                <span className="stat-value">⚡</span>
                <span className="stat-label">Fast &amp; SEO</span>
              </div>
            </div>

            <div className="contact-grid">
              <a
                href="mailto:mehrabhossain7102@gmail.com"
                className="contact-link email"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                Email Me
              </a>
              <a
                href="https://minhazexo.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link portfolio"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Portfolio
              </a>
            </div>
          </div>
        </div>

        {/* What I Do */}
        <section className="mt-12">
          <h2 className="section-title">What I do</h2>
          <p className="section-subtitle">
            End-to-end web development — from concept to deployment and beyond.
          </p>
          <div className="services-section">
            {SERVICES.map((s) => (
              <div key={s.title} className="service-card">
                <div className="service-icon">
                  <ServiceIcon type={s.icon} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mt-12">
          <div className="stack-section">
            <div className="stack-header">
              <h2>Tech Stack</h2>
              <span className="stack-note">built for speed • built to last</span>
            </div>
            <div className="stack-grid">
              {STACKS.map((group) => (
                <div key={group.label} className="stack-group">
                  <h4>{group.label}</h4>
                  <div className="stack-tags">
                    {group.items.map((item) => (
                      <span key={item} className="stack-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connect */}
        <section className="mt-12">
          <h2 className="section-title">Connect with me</h2>
          <p className="section-subtitle">
            Follow my work, see the code, or just say hello — I&apos;d love to hear from you.
          </p>
          <div className="connect-section">
            {LINKS.map((link) => {
              let gradientClass = "";
              if (link.name === "Portfolio") gradientClass = "bg-gradient-to-br from-blue-600 to-indigo-600";
              if (link.name === "GitHub") gradientClass = "bg-gradient-to-br from-gray-700 to-gray-900";
              if (link.name === "LinkedIn") gradientClass = "bg-gradient-to-br from-blue-500 to-blue-700";
              if (link.name === "Facebook") gradientClass = "bg-gradient-to-br from-blue-500 to-blue-600";

              return (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <div className="link-header">
                    <div className={`link-icon-wrap ${gradientClass}`}>
                      <LinkIcon name={link.name} />
                    </div>
                    <div className="link-info">
                      <span className="link-name">{link.name}</span>
                      <span className="link-desc">{link.desc}</span>
                    </div>
                  </div>
                  <div className="link-url">{link.url.replace("https://", "")}</div>
                  <span className="link-action">
                    {link.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Values */}
        <section className="mt-12">
          <div className="values-section">
            <div className="value-card">
              <div className="value-icon cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a7 7 0 0 0 7-7c0-5.2-7-13-7-13S5 9.8 5 15a7 7 0 0 0 7 7z" />
                  <circle cx="12" cy="15" r="3" />
                </svg>
              </div>
              <h3>How I work</h3>
              <p>Clear communication, fast iterations, and honest timelines. No surprises — just progress you can see.</p>
            </div>
            <div className="value-card">
              <div className="value-icon primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h3>Why clients choose me</h3>
              <p>Production-ready code, SEO-first builds, and a design eye. I care about the polish that turns visitors into customers.</p>
            </div>
            <div className="quote-card">
              <span className="quote-mark" aria-hidden="true">&ldquo;</span>
              <p className="quote-text">
                &ldquo;I don&apos;t just write code — I craft digital experiences that feel effortless to use and impossible to forget. If your project deserves to look as good as it performs, let&apos;s build it right.&rdquo;
              </p>
              <div className="quote-author">
                <div className="author-avatar">MH</div>
                <div className="author-info">
                  <span className="author-name">MD Mehrab Hossain</span>
                  <span className="author-role">Web Developer • minhazexo.vercel.app</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12">
          <div className="cta-section">
            <div className="cta-content">
              <div className="cta-text">
                <h3>Have an idea? Let&apos;s make it real.</h3>
                <p>Whether it&apos;s a portfolio, SaaS, or e-commerce — I&apos;ll help you ship something you&apos;re proud of.</p>
              </div>
              <div className="cta-links">
                <a
                  href="mailto:mehrabhossain7102@gmail.com"
                  className="cta-link email"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                  mehrabhossain7102@gmail.com
                </a>
                <a
                  href="https://minhazexo.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-link portfolio"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Explore Portfolio
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
