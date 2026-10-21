import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Activity,
  Layers,
  Leaf,
  Wind,
  Compass,
  Maximize2,
  TreePine,
  ShieldCheck,
} from 'lucide-react';

const SPECIMENS = {
  peepal: {
    name: 'Heritage Peepal Specimen',
    species: 'Ficus religiosa (Arasa Maram)',
    age: '65 Years',
    foliageColor: 0x10b981,
    foliageColor2: 0x059669,
    canopyScale: [1.3, 1.1, 1.3],
    trunkScale: [1.2, 1.0, 1.2],
    co2: '52.4 kg/yr',
    cooling: '-2.8°C',
    health: '98.5%',
  },
  banyan: {
    name: 'Great Adyar Banyan Landmark',
    species: 'Ficus benghalensis (Aala Maram)',
    age: '150 Years',
    foliageColor: 0x047857,
    foliageColor2: 0x065f46,
    canopyScale: [1.7, 0.9, 1.7],
    trunkScale: [1.6, 0.85, 1.6],
    co2: '84.2 kg/yr',
    cooling: '-3.6°C',
    health: '96.2%',
  },
  neem: {
    name: 'Ancient San Thome Neem',
    species: 'Azadirachta indica (Vembu)',
    age: '40 Years',
    foliageColor: 0x14b8a6,
    foliageColor2: 0x0f766e,
    canopyScale: [1.05, 1.3, 1.05],
    trunkScale: [0.9, 1.1, 0.9],
    co2: '38.6 kg/yr',
    cooling: '-2.1°C',
    health: '99.1%',
  },
  gulmohar: {
    name: 'Royal Flame Gulmohar',
    species: 'Delonix regia (Mayil-kondrai)',
    age: '18 Years',
    foliageColor: 0x15803d,
    foliageColor2: 0x166534,
    canopyScale: [1.4, 0.95, 1.4],
    trunkScale: [1.0, 1.05, 1.0],
    co2: '34.1 kg/yr',
    cooling: '-1.9°C',
    health: '97.0%',
  },
};

const ThreeTreeCanvas = ({ selectedTreeId = 'peepal', onSpecimenChange }) => {
  const containerRef = useRef(null);
  const [activeSpecimenKey, setActiveSpecimenKey] = useState('peepal');
  const [renderMode, setRenderMode] = useState('day'); // 'day', 'night', 'wireframe'
  const [autoRotate, setAutoRotate] = useState(true);
  const [windActive, setWindActive] = useState(true);

  // References for live animation loop updates
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const treeGroupRef = useRef(null);
  const foliageMeshesRef = useRef([]);
  const particlesRef = useRef(null);
  const dirLightRef = useRef(null);
  const hemiLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.004 });

  const activeSpecimen = SPECIMENS[activeSpecimenKey] || SPECIMENS.peepal;

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 1.6, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const hemiLight = new THREE.HemisphereLight(0xdcfce7, 0x052e16, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(6, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const ambientLight = new THREE.AmbientLight(0x064e3b, 0.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // 5. Main Tree Group
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);
    treeGroupRef.current = treeGroup;

    // 6. Island Platform Base
    const islandGroup = new THREE.Group();
    const terrainGeo = new THREE.CylinderGeometry(2.8, 2.2, 0.5, 32);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x06281e,
      roughness: 0.8,
      metalness: 0.1,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.y = -0.25;
    terrainMesh.receiveShadow = true;
    islandGroup.add(terrainMesh);

    // Glowing Grass Top Rim
    const grassGeo = new THREE.CylinderGeometry(2.82, 2.82, 0.08, 32);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.6,
      emissive: 0x064e3b,
      emissiveIntensity: 0.25,
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = 0.02;
    grassMesh.receiveShadow = true;
    islandGroup.add(grassMesh);

    // Holographic Telemetry Base Rings
    const ringGeo = new THREE.RingGeometry(2.95, 3.05, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.03;
    islandGroup.add(ringMesh);

    const ringOuterGeo = new THREE.RingGeometry(3.3, 3.34, 48);
    const ringOuterMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
    ringOuter.rotation.x = -Math.PI / 2;
    ringOuter.position.y = 0.03;
    islandGroup.add(ringOuter);

    treeGroup.add(islandGroup);

    // 7. Procedural Tree Model (Trunk & Organic Branches)
    const trunkGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.85,
      metalness: 0.05,
    });

    // Main Trunk with organic curve
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.08, 0.8, -0.05),
      new THREE.Vector3(-0.06, 1.6, 0.06),
      new THREE.Vector3(0.02, 2.4, 0),
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 0.26, 12, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    trunkGroup.add(trunkMesh);

    // Organic Root Flares
    for (let r = 0; r < 5; r++) {
      const angle = (r / 5) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const rootCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.25, 0),
        new THREE.Vector3(Math.cos(angle) * 0.5, 0.1, Math.sin(angle) * 0.5),
        new THREE.Vector3(Math.cos(angle) * 1.05, 0.01, Math.sin(angle) * 1.05),
      ]);
      const rootGeo = new THREE.TubeGeometry(rootCurve, 8, 0.11, 8, false);
      const rootMesh = new THREE.Mesh(rootGeo, trunkMat);
      rootMesh.castShadow = true;
      rootMesh.receiveShadow = true;
      trunkGroup.add(rootMesh);
    }

    // Secondary Branches
    const branchConfigs = [
      { start: [0.02, 2.1, 0], end: [-0.9, 2.9, 0.4], rad: 0.13 },
      { start: [0.02, 2.2, 0], end: [0.85, 3.0, -0.3], rad: 0.12 },
      { start: [-0.04, 1.8, 0.05], end: [0.1, 2.7, 0.9], rad: 0.11 },
      { start: [0.05, 1.9, -0.05], end: [-0.4, 2.6, -0.85], rad: 0.11 },
    ];

    branchConfigs.forEach((cfg) => {
      const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(...cfg.start),
        new THREE.Vector3(
          (cfg.start[0] + cfg.end[0]) * 0.5 + (Math.random() - 0.5) * 0.1,
          (cfg.start[1] + cfg.end[1]) * 0.5 + 0.1,
          (cfg.start[2] + cfg.end[2]) * 0.5
        ),
        new THREE.Vector3(...cfg.end),
      ]);
      const bGeo = new THREE.TubeGeometry(bCurve, 10, cfg.rad, 8, false);
      const bMesh = new THREE.Mesh(bGeo, trunkMat);
      bMesh.castShadow = true;
      trunkGroup.add(bMesh);
    });

    treeGroup.add(trunkGroup);

    // 8. Volumetric Lush Canopy Cloud Clusters
    const foliageMeshes = [];
    const canopyClusters = [
      { pos: [0, 3.4, 0], scale: 1.15, col: 0x10b981 },
      { pos: [-0.95, 3.1, 0.45], scale: 0.95, col: 0x059669 },
      { pos: [0.9, 3.2, -0.35], scale: 0.98, col: 0x10b981 },
      { pos: [0.15, 2.9, 0.95], scale: 0.85, col: 0x34d399 },
      { pos: [-0.45, 2.8, -0.9], scale: 0.9, col: 0x059669 },
      { pos: [0, 4.15, 0], scale: 0.9, col: 0x34d399 },
      { pos: [0.65, 3.75, 0.5], scale: 0.78, col: 0x10b981 },
      { pos: [-0.7, 3.65, -0.4], scale: 0.82, col: 0x059669 },
    ];

    canopyClusters.forEach((c) => {
      const fGeo = new THREE.DodecahedronGeometry(c.scale, 2);
      const fMat = new THREE.MeshStandardMaterial({
        color: c.col,
        roughness: 0.45,
        metalness: 0.05,
        flatShading: true,
      });
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.set(...c.pos);
      fMesh.castShadow = true;
      fMesh.receiveShadow = true;
      fMesh.userData = { initialY: c.pos[1], initialScale: c.scale, offset: Math.random() * Math.PI * 2 };
      treeGroup.add(fMesh);
      foliageMeshes.push(fMesh);
    });
    foliageMeshesRef.current = foliageMeshes;

    // 9. Floating Bioluminescent Pollen / Spore Particles
    const particleCount = 75;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pInitialAngles = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.random() * 2.6;
      const angle = Math.random() * Math.PI * 2;
      const y = 0.4 + Math.random() * 4.5;
      pPositions[i * 3] = Math.cos(angle) * radius;
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = Math.sin(angle) * radius;
      pInitialAngles.push({ radius, angle, speed: 0.003 + Math.random() * 0.008, ySpeed: 0.005 + Math.random() * 0.007 });
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    treeGroup.add(particles);
    particlesRef.current = { points: particles, initialAngles: pInitialAngles };

    // 10. Pointer Drag Rotation Handlers
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      treeGroup.rotation.y += deltaX * 0.008;
      camera.position.y = THREE.MathUtils.clamp(camera.position.y - deltaY * 0.008, 1.2, 5.5);
      camera.lookAt(0, 1.8, 0);

      rotationVelocityRef.current.y = deltaX * 0.003;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 11. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation with inertia
      if (!isDraggingRef.current) {
        if (autoRotate) {
          treeGroup.rotation.y += 0.0045;
        } else {
          treeGroup.rotation.y += rotationVelocityRef.current.y;
          rotationVelocityRef.current.y *= 0.94;
        }
      }

      // Wind Canopy Foliage Sway
      if (windActive && foliageMeshesRef.current.length > 0) {
        foliageMeshesRef.current.forEach((mesh, idx) => {
          const sway = Math.sin(elapsedTime * 1.8 + mesh.userData.offset) * 0.04;
          mesh.position.y = mesh.userData.initialY + sway;
          mesh.rotation.z = Math.sin(elapsedTime * 1.2 + idx) * 0.025;
        });
      }

      // Floating Spores rise and circle
      if (particlesRef.current) {
        const positions = particlesRef.current.points.geometry.attributes.position.array;
        const meta = particlesRef.current.initialAngles;
        for (let i = 0; i < particleCount; i++) {
          meta[i].angle += meta[i].speed;
          positions[i * 3] = Math.cos(meta[i].angle) * meta[i].radius;
          positions[i * 3 + 2] = Math.sin(meta[i].angle) * meta[i].radius;
          positions[i * 3 + 1] += meta[i].ySpeed;
          if (positions[i * 3 + 1] > 5.0) {
            positions[i * 3 + 1] = 0.4;
          }
        }
        particlesRef.current.points.geometry.attributes.position.needsUpdate = true;
      }

      // Pulse holographic telemetry ring
      ringMesh.rotation.z += 0.003;
      ringOuter.rotation.z -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Update Visual Mode (Daylight vs Bioluminescent Night vs LiDAR Wireframe)
  useEffect(() => {
    if (!foliageMeshesRef.current || !dirLightRef.current || !hemiLightRef.current) return;

    if (renderMode === 'day') {
      dirLightRef.current.intensity = 1.4;
      dirLightRef.current.color.setHex(0xfff7ed);
      hemiLightRef.current.intensity = 0.85;
      hemiLightRef.current.color.setHex(0xdcfce7);
      ambientLightRef.current.color.setHex(0x064e3b);
      ambientLightRef.current.intensity = 0.4;

      foliageMeshesRef.current.forEach((m, idx) => {
        m.material.wireframe = false;
        m.material.color.setHex(idx % 2 === 0 ? activeSpecimen.foliageColor : activeSpecimen.foliageColor2);
        m.material.emissive.setHex(0x022c22);
        m.material.emissiveIntensity = 0.15;
      });
      if (particlesRef.current) {
        particlesRef.current.points.material.color.setHex(0x34d399);
      }
    } else if (renderMode === 'night') {
      dirLightRef.current.intensity = 0.25;
      dirLightRef.current.color.setHex(0x38bdf8);
      hemiLightRef.current.intensity = 0.4;
      hemiLightRef.current.color.setHex(0x0284c7);
      ambientLightRef.current.color.setHex(0x0369a1);
      ambientLightRef.current.intensity = 0.6;

      foliageMeshesRef.current.forEach((m) => {
        m.material.wireframe = false;
        m.material.color.setHex(0x065f46);
        m.material.emissive.setHex(0x10b981);
        m.material.emissiveIntensity = 0.85; // Glow in the dark
      });
      if (particlesRef.current) {
        particlesRef.current.points.material.color.setHex(0x38bdf8);
      }
    } else if (renderMode === 'wireframe') {
      dirLightRef.current.intensity = 0.8;
      dirLightRef.current.color.setHex(0x22d3ee);
      hemiLightRef.current.intensity = 0.6;

      foliageMeshesRef.current.forEach((m) => {
        m.material.wireframe = true;
        m.material.color.setHex(0x22d3ee);
        m.material.emissive.setHex(0x0891b2);
        m.material.emissiveIntensity = 0.7;
      });
      if (particlesRef.current) {
        particlesRef.current.points.material.color.setHex(0x22d3ee);
      }
    }
  }, [renderMode, activeSpecimenKey]);

  // Handle Specimen Switch (morph scale & colors)
  const handleSelectSpecimen = (key) => {
    setActiveSpecimenKey(key);
    if (onSpecimenChange) {
      onSpecimenChange(key);
    }
    const spec = SPECIMENS[key];
    if (foliageMeshesRef.current && spec) {
      foliageMeshesRef.current.forEach((m, idx) => {
        m.scale.set(
          m.userData.initialScale * spec.canopyScale[0],
          m.userData.initialScale * spec.canopyScale[1],
          m.userData.initialScale * spec.canopyScale[2]
        );
        m.material.color.setHex(idx % 2 === 0 ? spec.foliageColor : spec.foliageColor2);
      });
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current && treeGroupRef.current) {
      cameraRef.current.position.set(0, 3.2, 7.5);
      cameraRef.current.lookAt(0, 1.6, 0);
      treeGroupRef.current.rotation.y = 0;
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel-glow border border-emerald-500/30 shadow-2xl">
      {/* Top Header & Specimen Title */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chennai 3D Urban Canopy Digital Twin &bull; Three.js Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading mt-0.5">
            {activeSpecimen.name}
          </h3>
          <p className="text-xs text-slate-400 italic font-mono">{activeSpecimen.species} &bull; {activeSpecimen.age}</p>
        </div>

        {/* Specimen Pills Selector */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-950/80 p-1.5 rounded-2xl border border-emerald-900/60 backdrop-blur-md">
          {Object.entries(SPECIMENS).map(([key, data]) => (
            <button
              key={key}
              onClick={() => handleSelectSpecimen(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSpecimenKey === key
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {key === 'peepal' ? '🌳 Peepal' : key === 'banyan' ? '🌿 Banyan' : key === 'neem' ? '🍃 Neem' : '🌸 Gulmohar'}
            </button>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-[400px] sm:h-[480px] cursor-grab active:cursor-grabbing relative select-none"
        title="Click and drag to rotate 3D specimen"
      />

      {/* Mouse Interaction Hint */}
      <div className="absolute bottom-20 left-6 pointer-events-none text-[11px] text-slate-400/80 flex items-center gap-2 bg-slate-950/70 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-sm">
        <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>Click & drag to rotate 3D specimen</span>
      </div>

      {/* Bottom Telemetry Overlay & Visualization Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-emerald-950/60">
        {/* Real-time Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center sm:text-left w-full sm:w-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-900/40">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">CO₂ Capture</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">{activeSpecimen.co2}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-900/40">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Cooling Impact</span>
            <span className="text-xs sm:text-sm font-extrabold text-cyan-400 font-mono">{activeSpecimen.cooling}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-900/40">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">LiDAR Health</span>
            <span className="text-xs sm:text-sm font-extrabold text-teal-400 font-mono">{activeSpecimen.health}</span>
          </div>
        </div>

        {/* Action Controls & Shaders */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950/90 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setRenderMode('day')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                renderMode === 'day' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Lush Daylight Mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRenderMode('night')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                renderMode === 'night' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Bioluminescent Night Mode"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRenderMode('wireframe')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                renderMode === 'wireframe' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="LiDAR Wireframe Structural Scan"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Wind Sway Toggle */}
          <button
            onClick={() => setWindActive(!windActive)}
            className={`p-2 rounded-xl text-xs transition-colors border cursor-pointer ${
              windActive
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title={windActive ? 'Wind sway active' : 'Wind sway paused'}
          >
            <Wind className="w-4 h-4" />
          </button>

          {/* Auto-rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs transition-colors border cursor-pointer ${
              autoRotate
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title={autoRotate ? 'Auto-rotation on' : 'Auto-rotation off'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Reset 3D camera"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreeTreeCanvas;
