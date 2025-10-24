import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import "../../styles/academic.scss";

const Notes = () => {
  const [selectedYear, setSelectedYear] = useState("First Year");
  const [selectedType, setSelectedType] = useState("Notes");
  const [showRoutineImage, setShowRoutineImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadCounts, setDownloadCounts] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedDownloads = localStorage.getItem('downloadCounts');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedDownloads) {
      setDownloadCounts(JSON.parse(savedDownloads));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('downloadCounts', JSON.stringify(downloadCounts));
  }, [downloadCounts]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Updated Notes Paths with complete Third Year data
  const notes = {
    "First Year": [
      { title: "Analytical and Vector Geometry", url: "/1st Year Notes/Analytical and Vector Geometry .pdf", type: "pdf", size: "2.3 MB" },
      { title: "Calculus-1", url: "/1st Year Notes/Calculus-1.pdf", type: "pdf", size: "1.8 MB" },
      { title: "Electricity", url: "/1st Year Notes/Electricity .pdf", type: "pdf", size: "3.1 MB" },
      { title: "Mechanics and Properties of Matter", url: "/1st Year Notes/Mechanics and Properties of Matter.pdf", type: "pdf", size: "2.7 MB" },
      { title: "NM Stat", url: "/1st Year Notes/NM Stat.pdf", type: "pdf", size: "1.5 MB" },
      { title: "Thermal Physics", url: "/1st Year Notes/Thermal Physics.pdf", type: "pdf", size: "2.9 MB" },
    ],
    "Second Year": [
      { title: "PHA 201 (OPTICS)", url: "/2nd Year Notes/EMON { PHA 201 (OPTICS) }_compressed.pdf", type: "pdf", size: "4.2 MB" },
      { title: "PHA 202 (ELECTRONICS 1)", url: "/2nd Year Notes/EMON { PHA 202 (ELECTRONICS 1) }_compressed.pdf", type: "pdf", size: "3.8 MB" },
      { title: "PHA 203 (MP)", url: "/2nd Year Notes/EMON { PHA 203 (MP) }_compressed.pdf", type: "pdf", size: "3.5 MB" },
      { title: "PHA 204 (AMP)", url: "/2nd Year Notes/EMON { PHA 204 (AMP) }_compressed.pdf", type: "pdf", size: "4.1 MB" },
      { title: "PHA 205 (WOAM)", url: "/2nd Year Notes/EMON {PHA 205 (WOAM) }_compressed.pdf", type: "pdf", size: "3.9 MB" },
    ],
    "Third Year": [
      // Original Notes
      { title: "Astrophysics", url: "/3rd Year Notes/Astrophysics.PHA-308.pdf", type: "pdf", size: "5.1 MB" },
      { title: "Classical Mechanics", url: "/3rd Year Notes/Classical Mechanics.PHA-301.pdf", type: "pdf", size: "4.8 MB" },
      { title: "Electrodynamics", url: "/3rd Year Notes/Electrodynamics.PHA-305.pdf", type: "pdf", size: "5.3 MB" },
      { title: "Lasers and Photonics", url: "/3rd Year Notes/Lasers and Photonics..pdf", type: "pdf", size: "4.6 MB" },
      { title: "Nuclear Physics", url: "/3rd Year Notes/Nuclear Physics.PHA-304.pdf", type: "pdf", size: "5.2 MB" },
      { title: "Quantum Mechanics", url: "/3rd Year Notes/Quantum Machanics.PHA-302.pdf", type: "pdf", size: "5.5 MB" },
      { title: "Solid State Physics", url: "/3rd Year Notes/Solid State Physics.PH-303.pdf", type: "pdf", size: "4.9 MB" },
      
      // Roy Notes (20-21)
      { title: "Astrophysics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Astrophysics (ROY).pdf", type: "pdf", size: "4.7 MB" },
      { title: "Classical Mechanics and Relativity Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Classical mechanics and relativity (ROY).pdf", type: "pdf", size: "5.2 MB" },
      { title: "Electrodynamics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Electrodynamics (ROY).pdf", type: "pdf", size: "4.9 MB" },
      { title: "Lasers and Photonics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Lasers(ROY).pdf", type: "pdf", size: "4.3 MB" },
      { title: "Nuclear Physics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Nuclear (ROY).pdf", type: "pdf", size: "5.1 MB" },
      { title: "Quantum Mechanics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Quantum (ROY).pdf", type: "pdf", size: "5.6 MB" },
      { title: "Solid State Physics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Solid(ROY).pdf", type: "pdf", size: "4.8 MB" },
    ],
    "Fourth Year": [
      { title: "Advanced Physics I", url: "#", type: "pdf", size: "Coming Soon" },
      { title: "Nuclear Physics II", url: "#", type: "pdf", size: "Coming Soon" },
    ],
  };

  const syllabus = {
    "First Year": [
      { title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st and 2nd Year.pdf", type: "pdf", size: "1.2 MB" },
    ],
    "Second Year": [
      { title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st and 2nd Year.pdf", type: "pdf", size: "1.2 MB" },
    ],
    "Third Year": [
      { title: "3rd Year Syllabus", url: "/Syllabus/3rd Year.pdf", type: "pdf", size: "0.9 MB" },
    ],
    "Fourth Year": [
      { title: "4th Year Syllabus", url: "/Syllabus/4th Year.pdf", type: "pdf", size: "1.1 MB" },
    ],
  };

  // Enhanced Three.js with interactivity
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stageWidth = container.clientWidth;
    const stageHeight = container.clientHeight;
    const xRows = 25;
    const zRows = 25;
    const cubeSize = 600;
    const cubeGap = 200;
    const cubeRow = cubeSize + cubeGap;

    const camera = new THREE.PerspectiveCamera(55, stageWidth / stageHeight, 1, 20000);
    camera.position.y = 5000;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5000, 10000);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    ambientLight.intensity = 2;

    // Add directional light for better 3D effect
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const group = new THREE.Object3D();
    scene.add(group);
    let cubes = [];

    const halfXRows = (cubeRow * -xRows) / 2;
    const halfZRows = (cubeRow * -zRows) / 2;

    // Color schemes for different years
    const colorSchemes = {
      "First Year": { hueStart: 180, hueEnd: 240 }, // Blues
      "Second Year": { hueStart: 240, hueEnd: 300 }, // Purples
      "Third Year": { hueStart: 300, hueEnd: 360 }, // Pinks/Reds
      "Fourth Year": { hueStart: 60, hueEnd: 120 }, // Greens
    };

    const createCubes = () => {
      // Remove existing cubes
      while(group.children.length > 0) { 
        group.remove(group.children[0]); 
      }

      cubes = [];
      const scheme = colorSchemes[selectedYear] || colorSchemes["First Year"];

      for (let x = 0; x < xRows; x++) {
        cubes[x] = [];
        for (let z = 0; z < zRows; z++) {
          const cubeHeight = 10 + (Math.sin((x / xRows) * Math.PI) + Math.sin((z / zRows) * Math.PI) * 200 + Math.random() * 150);
          const geometry = new THREE.BoxGeometry(cubeSize, cubeHeight, cubeSize);
          
          // Dynamic color based on selected year
          const hueProgress = ((x + z) / (xRows + zRows));
          const hue = scheme.hueStart + (scheme.hueEnd - scheme.hueStart) * hueProgress;
          
          const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(`hsl(${hue}, 80%, 60%)`),
            specular: 0xffffff,
            shininess: 50,
            emissive: new THREE.Color(`hsl(${hue}, 60%, 10%)`),
            transparent: true,
            opacity: 0.9,
          });
          
          const cube = new THREE.Mesh(geometry, material);
          cube.position.x = halfXRows + x * cubeRow;
          cube.position.y = cubeHeight / 2;
          cube.position.z = (cubeRow * -zRows) / 2 + z * cubeRow;
          cube.height = cubeHeight;
          cube.originalY = cube.position.y;
          group.add(cube);
          cubes[x][z] = cube;
        }
      }
    };

    createCubes();

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(stageWidth, stageHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const position = { x: 0, y: 0, z: 0 };
    const camPos = new THREE.Vector3(0, 0, 0);
    let t = 0;
    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;

    // Mouse move interaction
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / stageWidth) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / stageHeight) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    const checkRow = () => {
      const xIndex = position.x / cubeRow;
      const xLoops = Math.floor(xIndex / xRows);
      const zIndex = position.z / cubeRow;
      const zLoops = Math.floor(zIndex / zRows);

      for (let x = 0; x < xRows; x++) {
        for (let z = 0; z < zRows; z++) {
          let dx = x >= xIndex - xLoops * xRows ? xRows * (1 - xLoops) : xRows * (0 - xLoops);
          let dz = z >= zIndex - zLoops * zRows ? zRows * (1 - zLoops) : zRows * (0 - zLoops);
          cubes[x][z].position.x = (x - dx) * cubeRow - halfXRows;
          cubes[x][z].position.z = (z - dz) * cubeRow - halfZRows;
          
          // Mouse interaction - cubes rise when mouse is near
          const distanceToMouse = Math.sqrt(
            Math.pow(cubes[x][z].position.x + position.x + mouseX * 2000, 2) +
            Math.pow(cubes[x][z].position.z + position.z + mouseY * 2000, 2)
          );
          
          const mouseInfluence = Math.max(0, 1 - distanceToMouse / 3000);
          let scale = (cubes[x][z].position.z + group.position.z) / 1500;
          scale = scale < 1 ? 1 : Math.pow(scale, 1.2);
          scale += mouseInfluence * 0.5;
          
          cubes[x][z].scale.y = scale;
          cubes[x][z].position.y = (cubes[x][z].height * scale) / 2;
          
          // Pulsing effect based on mouse influence
          cubes[x][z].material.emissiveIntensity = 0.1 + mouseInfluence * 0.4;
        }
      }
    };

    const animate = () => {
      t += 16;
      position.x += Math.sin(t * 0.001) * 20;
      position.z += (Math.cos(t * 0.0008) + 5) * 20;
      group.position.x = -position.x;
      group.position.z = -position.z;
      checkRow();
      
      camera.position.x = Math.sin(t * 0.0003) * 1000 + mouseX * 500;
      camera.position.z = -4000 + mouseY * 300;
      camera.position.y = (Math.cos(t * 0.0004) + 1.3) * 3000;
      camera.lookAt(camPos);
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      scene.traverse((object) => {
        if (object.isMesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((m) => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [selectedYear]); // Re-run when selectedYear changes

  // Handler functions
  const handleDownload = (item) => {
    setLoading(true);
    
    // Simulate download delay
    setTimeout(() => {
      setDownloadCounts(prev => ({
        ...prev,
        [item.title]: (prev[item.title] || 0) + 1
      }));
      
      // Track in localStorage
      const downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
      downloadStats[item.title] = (downloadStats[item.title] || 0) + 1;
      localStorage.setItem('downloadStats', JSON.stringify(downloadStats));
      
      setLoading(false);
      
      // Trigger actual download
      if (item.url !== "#") {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.title;
        link.click();
      }
    }, 800);
  };

  const toggleFavorite = (item) => {
    const itemKey = `${selectedYear}-${selectedType}-${item.title}`;
    setFavorites(prev => 
      prev.includes(itemKey)
        ? prev.filter(fav => fav !== itemKey)
        : [...prev, itemKey]
    );
  };

  const isFavorite = (item) => {
    const itemKey = `${selectedYear}-${selectedType}-${item.title}`;
    return favorites.includes(itemKey);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'zip': return '📦';
      default: return '📁';
    }
  };

  // Filter items based on search term
  const currentItems = selectedType === "Notes" ? notes[selectedYear] : syllabus[selectedYear];
  const filteredItems = currentItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteItems = filteredItems.filter(item => 
    isFavorite(item)
  );

  const regularItems = filteredItems.filter(item => 
    !isFavorite(item)
  );

  return (
    <div className="notes-container">
      <div ref={containerRef} className="three-background"></div>

      <button 
        className="class-routine-button" 
        onClick={() => setShowRoutineImage(!showRoutineImage)}
      >
        📅 Class Routine
      </button>

      {showRoutineImage && (
        <div className="routine-image-container">
          <img src="/Class Routine/routine.jpg" alt="Class Routine" className="routine-image" />
          <button className="close-button" onClick={() => setShowRoutineImage(false)}>
            Close
          </button>
        </div>
      )}

      <div className="ocean">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
      </div>

      <h1>
        <span className="academic-title">
          {selectedYear} {selectedType}
        </span>
      </h1>

      <div className="controls-container">
        <div className="dropdown-container">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)} 
            className="year-select"
          >
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Fourth Year">Fourth Year</option>
          </select>

          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)} 
            className="type-select"
          >
            <option value="Notes">Notes</option>
            <option value="Syllabus">Syllabus</option>
          </select>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder={`Search ${selectedType.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Preparing your download...</p>
        </div>
      )}

      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-number">{filteredItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {Object.values(downloadCounts).reduce((a, b) => a + b, 0)}
          </span>
          <span className="stat-label">Total Downloads</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{favoriteItems.length}</span>
          <span className="stat-label">Favorites</span>
        </div>
      </div>

      <div className="notes-content">
        {favoriteItems.length > 0 && (
          <div className="favorites-section">
            <h2 className="section-title">⭐ Favorites</h2>
            <div className="notes-grid">
              {favoriteItems.map((item, index) => (
                <div key={index} className="note-card favorite">
                  <div className="note-header">
                    <span className="file-icon">{getFileIcon(item.type)}</span>
                    <h3 className="note-title">{item.title}</h3>
                    <button
                      className={`favorite-btn ${isFavorite(item) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(item)}
                      title={isFavorite(item) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFavorite(item) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="note-meta">
                    <span className="file-type">{item.type.toUpperCase()}</span>
                    <span className="file-size">{item.size}</span>
                    <span className="download-count">
                      📥 {downloadCounts[item.title] || 0}
                    </span>
                  </div>
                  <div className="note-actions">
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(item)}
                      disabled={item.url === "#"}
                    >
                      {item.url === "#" ? "Coming Soon" : "Download"}
                    </button>
                    {item.url !== "#" && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-btn"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="regular-section">
          {favoriteItems.length > 0 && <h2 className="section-title">All {selectedType}</h2>}
          <div className="notes-grid">
            {regularItems.map((item, index) => (
              <div key={index} className="note-card">
                <div className="note-header">
                  <span className="file-icon">{getFileIcon(item.type)}</span>
                  <h3 className="note-title">{item.title}</h3>
                  <button
                    className={`favorite-btn ${isFavorite(item) ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(item)}
                    title={isFavorite(item) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(item) ? '★' : '☆'}
                  </button>
                </div>
                <div className="note-meta">
                  <span className="file-type">{item.type.toUpperCase()}</span>
                  <span className="file-size">{item.size}</span>
                  <span className="download-count">
                    📥 {downloadCounts[item.title] || 0}
                  </span>
                </div>
                <div className="note-actions">
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(item)}
                    disabled={item.url === "#"}
                  >
                    {item.url === "#" ? "Coming Soon" : "Download"}
                  </button>
                  {item.url !== "#" && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-btn"
                    >
                      Preview
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="no-results">
            <p>No {selectedType.toLowerCase()} found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;