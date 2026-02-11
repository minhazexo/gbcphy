import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import "../../styles/academic.scss";
import Notes from "../Academic/Notes/Notes";

// Three.js Background Component - defined first
const ThreeBackground = ({ containerRef, selectedYear }) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

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
          if (cubes[x][z].material.emissive) {
            cubes[x][z].material.emissiveIntensity = 0.1 + mouseInfluence * 0.4;
          }
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
  }, [selectedYear, containerRef]);

  return <div ref={containerRef} className="three-background"></div>;
};

// Main Academic Component
const Academic = () => {
  const [selectedYear, setSelectedYear] = useState("First Year");
  const [selectedType, setSelectedType] = useState("Notes");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadCounts, setDownloadCounts] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showRoutineImage, setShowRoutineImage] = useState(false);
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

  return (
    <div className="notes-container">
      {/* Three.js Background Component */}
      <ThreeBackground 
        containerRef={containerRef} 
        selectedYear={selectedYear} 
      />

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

      {/* Notes Component with all props */}
      <Notes
        selectedYear={selectedYear}
        selectedType={selectedType}
        searchTerm={searchTerm}
        downloadCounts={downloadCounts}
        setDownloadCounts={setDownloadCounts}
        favorites={favorites}
        setFavorites={setFavorites}
      />
    </div>
  );
};

export default Academic;