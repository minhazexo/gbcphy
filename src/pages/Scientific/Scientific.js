import React from "react";
import folderStructure from "../../utils/folderStructure";
import "../../styles/scientific.scss";

const knowledgeCards = [
  {
    title: "Quantum Mechanics",
    content: "The study of particles at atomic and subatomic scales. Uncertainty and superposition are key principles.",
    icon: "⚛️",
  },
  {
    title: "Thermodynamics",
    content: "Deals with heat, energy, and work. Laws govern energy conservation, entropy, and efficiency.",
    icon: "🔥",
  },
  {
    title: "Electromagnetism",
    content: "Study of electric and magnetic fields. Maxwell’s equations unify electricity, magnetism, and light.",
    icon: "⚡",
  },
  {
    title: "Fractals & Chaos",
    content: "Infinite patterns that are self-similar. Used to model complex systems like coastlines, clouds, and galaxies.",
    icon: "🌌",
  },
];

const Scientific = () => {
  const openFractalExplorer = () => {
  window.open(
    `${process.env.PUBLIC_URL}/Scientific/fractal-explorer-themes/index.html`,
    "_blank",
    "noopener,noreferrer"
  );
};


  return (
    <div className="sci-hub-page">
      <div className="sci-header">
        <h1 className="sci-title">Welcome to Scientific Hub 🔬</h1>
        <p className="sci-subtitle">Explore physics, math & fractals in one place</p>
      </div>

      <div className="sci-fractal-section">
        <button className="sci-fractal-btn" onClick={openFractalExplorer}>
          🌌 Explore Fractals
        </button>
      </div>

      <div className="sci-cards-section">
        {knowledgeCards.map((card, index) => (
          <div key={index} className="sci-knowledge-card">
            <div className="sci-card-icon">{card.icon}</div>
            <h3 className="sci-card-title">{card.title}</h3>
            <p className="sci-card-content">{card.content}</p>
          </div>
        ))}
      </div>

      <div className="sci-structure-section">
        <h2 className="sci-structure-title">Folder & File Structure</h2>
        <div className="sci-structure-container">
          <pre className="sci-folder-structure">{folderStructure}</pre>
        </div>
      </div>
    </div>
  );
};

export default Scientific;
