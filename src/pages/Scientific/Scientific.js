import React, { useState } from "react";
import folderStructure from "../../utils/folderStructure.js";

import "../../styles/scientific.scss";

/* ---------------- YOUR ORIGINAL CARDS (UNCHANGED) ---------------- */
const knowledgeCards = [
  {
    title: "Quantum Mechanics",
    content:
      "The study of particles at atomic and subatomic scales. Uncertainty and superposition are key principles.",
    icon: "⚛️",
    color: "#60a5fa",
    details:
      "Wave-particle duality, Schrödinger's equation, quantum entanglement."
  },
  {
    title: "Thermodynamics",
    content:
      "Deals with heat, energy, and work. Laws govern energy conservation, entropy, and efficiency.",
    icon: "🔥",
    color: "#f87171",
    details:
      "First law: energy conservation, Second law: entropy increase, Third law: absolute zero."
  },
  {
    title: "Electromagnetism",
    content:
      "Study of electric and magnetic fields. Maxwell's equations unify electricity, magnetism, and light.",
    icon: "⚡",
    color: "#a78bfa",
    details:
      "Gauss's law, Faraday's law, Ampère's law, electromagnetic waves."
  },
  {
    title: "Fractals & Chaos",
    content:
      "Infinite patterns that are self-similar. Used to model complex systems like coastlines, clouds, and galaxies.",
    icon: "🌌",
    color: "#6ee7b7",
    details:
      "Mandelbrot set, Julia sets, fractal dimension, chaotic systems."
  },
  {
    title: "Relativity",
    content:
      "Einstein's theories of special and general relativity describing space, time, and gravity.",
    icon: "🌠",
    color: "#fbbf24",
    details:
      "Time dilation, length contraction, spacetime curvature, gravitational waves."
  },
  {
    title: "Quantum Computing",
    content:
      "Leverages quantum bits (qubits) to perform computations exponentially faster for certain problems.",
    icon: "💻",
    color: "#34d399",
    details:
      "Superposition, entanglement, quantum gates, Shor's algorithm."
  },
  {
    title: "Neuroscience",
    content:
      "Study of the nervous system, brain function, and neural networks.",
    icon: "🧠",
    color: "#c084fc",
    details:
      "Neurons, synapses, brain plasticity, cognitive functions."
  },
  {
    title: "Astrophysics",
    content:
      "Physics applied to astronomical phenomena: stars, galaxies, black holes, and cosmology.",
    icon: "🪐",
    color: "#60a5fa",
    details:
      "Stellar evolution, dark matter, cosmic microwave background."
  }
];

/* ---------------- SIMULATIONS (ONLY EXPANDED, NO UI CHANGE) ---------------- */
const simulations = {
  pendulum:
    "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html",
  waves:
    "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html",
  gravity:
    "https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_en.html",
  quantum:
    "https://phet.colorado.edu/sims/html/quantum-tunneling/latest/quantum-tunneling_en.html",

  /* ➕ NEW PHET SIMS ADDED */
  projectile:
    "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html",
  friction:
    "https://phet.colorado.edu/sims/html/friction/latest/friction_en.html",
  circuits:
    "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
  charges:
    "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_en.html",
  interference:
    "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html"
};

/* ---------------- COMPONENT ---------------- */
const Scientific = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const openFractalExplorer = () => {
    window.open(
      `${process.env.PUBLIC_URL}/Scientific/fractal-explorer-themes/index.html`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const toggleCardExpansion = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  /* SAFE SIM FUNCTION */
  const openSimulation = (type) => {
    const url = simulations[type];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="sci-hub-page">


      {/* HEADER (UNCHANGED) */}
      <div className="sci-header">
        <h1 className="sci-title">Welcome to Scientific Hub 🔬</h1>
        <p className="sci-subtitle">
          Explore physics, math & fractals in one place
        </p>

        <div className="sci-stats">
          <span className="sci-stat">12 Scientific Fields</span>
          <span className="sci-stat">Interactive Visualizations</span>
          <span className="sci-stat">Live Simulations</span>
        </div>
      </div>

      {/* FRACTAL (UNCHANGED) */}
      <div className="sci-fractal-section">
        <button className="sci-fractal-btn" onClick={openFractalExplorer}>
          🌌 Explore Fractals
        </button>
        <p className="sci-fractal-desc">
          Interactive Mandelbrot & Julia set explorer
        </p>
      </div>

      {/* SIMULATIONS SECTION (ONLY ADDED BUTTONS) */}
      <div className="sci-simulations-section">
        <h2 className="sci-section-title">Interactive Simulations</h2>

        <div className="sci-simulations-grid">
          {/* ORIGINAL */}
          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("pendulum")}
          >
            <span className="sci-sim-icon">🔄</span>
            <span className="sci-sim-title">Pendulum Lab</span>
            <span className="sci-sim-desc">Explore harmonic motion</span>
          </button>

          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("waves")}
          >
            <span className="sci-sim-icon">🌊</span>
            <span className="sci-sim-title">Wave Simulator</span>
            <span className="sci-sim-desc">Study wave properties</span>
          </button>

          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("gravity")}
          >
            <span className="sci-sim-icon">🌍</span>
            <span className="sci-sim-title">Gravity Force</span>
            <span className="sci-sim-desc">Newton's law</span>
          </button>

          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("quantum")}
          >
            <span className="sci-sim-icon">⚛️</span>
            <span className="sci-sim-title">Quantum Tunneling</span>
            <span className="sci-sim-desc">Quantum physics</span>
          </button>

          {/* ➕ NEW ADDED (NO STYLE CHANGE) */}
          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("projectile")}
          >
            <span className="sci-sim-icon">🚀</span>
            <span className="sci-sim-title">Projectile Motion</span>
            <span className="sci-sim-desc">Trajectory physics</span>
          </button>

          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("friction")}
          >
            <span className="sci-sim-icon">🧱</span>
            <span className="sci-sim-title">Friction</span>
            <span className="sci-sim-desc">Surface forces</span>
          </button>

          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("circuits")}
          >
            <span className="sci-sim-icon">🔌</span>
            <span className="sci-sim-title">Circuits</span>
            <span className="sci-sim-desc">Electric flow</span>
          </button>

          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("charges")}
          >
            <span className="sci-sim-icon">⚡</span>
            <span className="sci-sim-title">Charges</span>
            <span className="sci-sim-desc">Electric fields</span>
          </button>

          <button
            className="sci-simulation-btn"
            onClick={() => openSimulation("interference")}
          >
            <span className="sci-sim-icon">🌊</span>
            <span className="sci-sim-title">Interference</span>
            <span className="sci-sim-desc">Wave overlap</span>
          </button>
        </div>
      </div>

      {/* CARDS (UNCHANGED DESIGN FULLY PRESERVED) */}
      <div className="sci-cards-section">
        <h2 className="sci-section-title">Scientific Fields</h2>

        <div className="sci-cards-grid">
          {knowledgeCards.map((card, index) => (
            <div
              key={index}
              className={`sci-knowledge-card ${
                expandedCard === index ? "expanded" : ""
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => toggleCardExpansion(index)}
              style={{ "--card-color": card.color }}
            >
              <div
                className="sci-card-icon"
                style={{
                  background: `linear-gradient(135deg, ${card.color}, #000)`
                }}
              >
                {card.icon}
              </div>

              <h3 className="sci-card-title">{card.title}</h3>
              <p className="sci-card-content">{card.content}</p>

              {expandedCard === index && (
                <div className="sci-card-details">
                  <p className="sci-card-details-text">{card.details}</p>

                  <div className="sci-card-actions">
                    <button className="sci-card-learn-btn">Learn More</button>
                    <button
                      className="sci-card-close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(null);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {hoveredCard === index && expandedCard !== index && (
                <div className="sci-card-hover-indicator">
                  Click to expand
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STRUCTURE */}
      <div className="sci-structure-section">
        <h2 className="sci-section-title">Project Structure</h2>
        <div className="sci-structure-container">
          <pre className="sci-folder-structure">{folderStructure}</pre>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sci-footer">
        <p className="sci-footer-text">
          Scientific Hub • Built with React & Canvas
        </p>
      </div>
    </div>
  );
};

export default Scientific;