import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import "../../styles/academic.scss";

const Notes = () => {
  const [selectedYear, setSelectedYear] = useState("First Year");
  const [selectedType, setSelectedType] = useState("Notes");
  const [showRoutineImage, setShowRoutineImage] = useState(false);
  const containerRef = useRef(null);

  // Notes Paths (based on your structure)
  const notes = {
    "First Year": [
      { title: "Analytical and Vector Geometry", url: "/1st Year Notes/Analytical and Vector Geometry .pdf" },
      { title: "Calculus-1", url: "/1st Year Notes/Calculus-1.pdf" },
      { title: "Electricity", url: "/1st Year Notes/Electricity .pdf" },
      { title: "Mechanics and Properties of Matter", url: "/1st Year Notes/Mechanics and Properties of Matter.pdf" },
      { title: "NM Stat", url: "/1st Year Notes/NM Stat.pdf" },
      { title: "Thermal Physics", url: "/1st Year Notes/Thermal Physics.pdf" },
    ],
    "Second Year": [
      { title: "PHA 201 (OPTICS)", url: "/2nd Year Notes/EMON { PHA 201 (OPTICS) }_compressed.pdf" },
      { title: "PHA 202 (ELECTRONICS 1)", url: "/2nd Year Notes/EMON { PHA 202 (ELECTRONICS 1) }_compressed.pdf" },
      { title: "PHA 203 (MP)", url: "/2nd Year Notes/EMON { PHA 203 (MP) }_compressed.pdf" },
      { title: "PHA 204 (AMP)", url: "/2nd Year Notes/EMON { PHA 204 (AMP) }_compressed.pdf" },
      { title: "PHA 205 (WOAM)", url: "/2nd Year Notes/EMON {PHA 205 (WOAM) }_compressed.pdf" },
    ],
    "Third Year": [
      { title: "Astrophysics", url: "/3rd Year Notes/Astrophysics.PHA-308.pdf" },
      { title: "Classical Mechanics", url: "/3rd Year Notes/Classical Mechanics.PHA-301.pdf" },
      { title: "Electrodynamics", url: "/3rd Year Notes/Electrodynamics.PHA-305.pdf" },
      { title: "Lasers and Photonics", url: "/3rd Year Notes/Lasers and Photonics..pdf" },
      { title: "Nuclear Physics", url: "/3rd Year Notes/Nuclear Physics.PHA-304.pdf" },
      { title: "Quantum Mechanics", url: "/3rd Year Notes/Quantum Machanics.PHA-302.pdf" },
      { title: "Solid State Physics", url: "/3rd Year Notes/Solid State Physics.PH-303.pdf" },
    ],
    "Fourth Year": [
      { title: "Lecture 1: Advanced Physics", url: "#" },
      { title: "Lecture 2: Nuclear Physics", url: "#" },
    ],
  };

  const syllabus = {
    "First Year": [
      { title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st and 2nd Year.pdf" },
    ],
    "Second Year": [
      { title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st and 2nd Year.pdf" },
    ],
    "Third Year": [
      { title: "3rd Year Syllabus", url: "/Syllabus/3rd Year.pdf" },
    ],
    "Fourth Year": [
      { title: "4th Year Syllabus", url: "/Syllabus/4th Year.pdf" },
    ],
  };

  // ...[Three.js logic remains unchanged]...

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

    const group = new THREE.Object3D();
    scene.add(group);
    let cubes = [];

    const halfXRows = (cubeRow * -xRows) / 2;
    const halfZRows = (cubeRow * -zRows) / 2;

    for (let x = 0; x < xRows; x++) {
      cubes[x] = [];
      for (let z = 0; z < zRows; z++) {
        const cubeHeight = 10 + (Math.sin((x / xRows) * Math.PI) + Math.sin((z / zRows) * Math.PI) * 200 + Math.random() * 150);
        const geometry = new THREE.BoxGeometry(cubeSize, cubeHeight, cubeSize);
        const hue = ((x + z) / (xRows + zRows)) * 360;
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(`hsl(${hue}, 100%, 50%)`),
          specular: 0xffffff,
          shininess: 30,
          emissive: 0x111111,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = halfXRows + x * cubeRow;
        cube.position.y = cubeHeight / 2;
        cube.position.z = (cubeRow * -zRows) / 2 + z * cubeRow;
        cube.height = cubeHeight;
        group.add(cube);
        cubes[x][z] = cube;
      }
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(stageWidth, stageHeight);
    container.appendChild(renderer.domElement);

    const position = { x: 0, y: 0, z: 0 };
    const camPos = new THREE.Vector3(0, 0, 0);
    let t = 0;
    let animationFrameId;

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
          let scale = (cubes[x][z].position.z + group.position.z) / 1500;
          scale = scale < 1 ? 1 : Math.pow(scale, 1.2);
          cubes[x][z].scale.y = scale;
          cubes[x][z].position.y = (cubes[x][z].height * scale) / 2;
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
      camera.position.x = Math.sin(t * 0.0003) * 1000;
      camera.position.z = -4000;
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
  }, []);

  return (
    <div className="notes-container">
      <div ref={containerRef} className="three-background"></div>

      <button className="class-routine-button" onClick={() => setShowRoutineImage(!showRoutineImage)}>
        Class Routine
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

      <h1>Session-wise {selectedType}</h1>

      <div className="dropdown-container">
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="year-select">
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
          <option value="Third Year">Third Year</option>
          <option value="Fourth Year">Fourth Year</option>
        </select>

        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="type-select">
          <option value="Notes">Notes</option>
          <option value="Syllabus">Syllabus</option>
        </select>
      </div>

      <ul className="notes-list">
        {(selectedType === "Notes" ? notes[selectedYear] : syllabus[selectedYear]).map((item, index) => (
          <li key={index} className="note-item">
            <a href={item.url} className="note-link" target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
