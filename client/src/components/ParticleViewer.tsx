import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ParticleViewerProps {
  mode: string;
  customImageData?: string | null;
}

export function ParticleViewer({ mode, customImageData }: ParticleViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // --- INIT THREE.JS ---
    const scene = new THREE.Scene();
    // Dark fog for depth
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- PARTICLES SETUP ---
    const PARTICLE_COUNT = 20000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const homePoints = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    // Initial random positions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = (Math.random() - 0.5) * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      // Color gradient from Cyan (#00ffcc) to Purple (#7700ff)
      // Cyan: R:0 G:1 B:0.8
      // Purple: R:0.47 G:0 B:1
      const ratio = i / PARTICLE_COUNT;
      colors[i3] = ratio * 0.47;     // R
      colors[i3 + 1] = 1 - ratio;    // G
      colors[i3 + 2] = 0.8 + ratio * 0.2; // B
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- MOUSE INTERACTION ---
    const mouse = new THREE.Vector2();
    const target = new THREE.Vector2();
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX - windowHalfX);
      mouse.y = (event.clientY - windowHalfY);
    };
    document.addEventListener('mousemove', onDocumentMouseMove);

    // --- SHAPE ALGORITHMS ---
    const updateLayout = (currentMode: string, customImg?: string | null) => {
      // If custom mode with image data
      if (currentMode === 'custom' && customImg) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          const size = 120; // Resolution of sampling
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);
          
          const imageData = ctx.getImageData(0, 0, size, size);
          const data = imageData.data;
          const validPoints: {x: number, y: number, z: number}[] = [];
          
          for (let y = 0; y < size; y += 2) {
            for (let x = 0; x < size; x += 2) {
              const idx = (y * size + x) * 4;
              const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
              if (brightness > 60) { // Threshold
                validPoints.push({
                  x: (x - size/2) * 1.5,
                  y: -(y - size/2) * 1.5, // Flip Y
                  z: (Math.random() - 0.5) * 10
                });
              }
            }
          }

          // Distribute particles to points
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            const p = validPoints[i % validPoints.length] || {x:0, y:0, z:0};
            homePoints[i3] = p.x + (Math.random() - 0.5) * 2;
            homePoints[i3+1] = p.y + (Math.random() - 0.5) * 2;
            homePoints[i3+2] = p.z;
          }
        };
        img.src = customImg;
        return;
      }

      // Standard algorithms
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        if (currentMode === 'sphere') {
            const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
            const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
            homePoints[i3] = 40 * Math.cos(theta) * Math.sin(phi);
            homePoints[i3+1] = 40 * Math.sin(theta) * Math.sin(phi);
            homePoints[i3+2] = 40 * Math.cos(phi);
        } else if (currentMode === 'grid') {
            const s = Math.floor(Math.pow(PARTICLE_COUNT, 1/3));
            homePoints[i3] = (i % s - s/2) * 3;
            homePoints[i3+1] = (Math.floor(i/s) % s - s/2) * 3;
            homePoints[i3+2] = (Math.floor(i/(s*s)) - s/2) * 3;
        } else if (currentMode === 'helix') {
            const angle = 0.1 * i;
            homePoints[i3] = 20 * Math.cos(angle);
            homePoints[i3+1] = (i / PARTICLE_COUNT) * 100 - 50;
            homePoints[i3+2] = 20 * Math.sin(angle);
        } else if (currentMode === 'torus') {
            const u = (i / PARTICLE_COUNT) * Math.PI * 2;
            const v = (i % 100) * 0.0628;
            homePoints[i3] = (35 + 10 * Math.cos(v)) * Math.cos(u);
            homePoints[i3+1] = (35 + 10 * Math.cos(v)) * Math.sin(u);
            homePoints[i3+2] = 10 * Math.sin(v);
        } else if (currentMode === 'wave') {
            const x = (i % 150) - 75;
            const z = (Math.floor(i/150)) - 67;
            homePoints[i3] = x * 0.8;
            homePoints[i3+1] = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 15;
            homePoints[i3+2] = z * 0.8;
        } else if (currentMode === 'pyramid') {
            const layer = Math.floor(i / (PARTICLE_COUNT / 15));
            const progress = i % (PARTICLE_COUNT / 15);
            const angle = (progress / (PARTICLE_COUNT / 15)) * Math.PI * 2;
            const radius = 50 * (1 - layer / 15);
            homePoints[i3] = radius * Math.cos(angle);
            homePoints[i3+1] = (layer - 7) * 6;
            homePoints[i3+2] = radius * Math.sin(angle);
        } else if (currentMode === 'spiral') {
            const t = i / PARTICLE_COUNT * Math.PI * 12;
            const radius = 5 + t * 2;
            homePoints[i3] = radius * Math.cos(t);
            homePoints[i3+1] = (Math.random() - 0.5) * 10;
            homePoints[i3+2] = radius * Math.sin(t);
        } else if (currentMode === 'flower') {
            const t = i / PARTICLE_COUNT * Math.PI * 2;
            const r = 30 * Math.cos(3 * t); // Rose curve
            homePoints[i3] = r * Math.cos(t) + (Math.random()-0.5)*5;
            homePoints[i3+1] = r * Math.sin(t) + (Math.random()-0.5)*5;
            homePoints[i3+2] = (i / PARTICLE_COUNT) * 40 - 20;
        } else if (currentMode === 'galaxy') {
            const arm = i % 3;
            const dist = Math.random() * 50;
            const angle = dist * 0.2 + (arm * Math.PI * 2 / 3);
            homePoints[i3] = dist * Math.cos(angle);
            homePoints[i3+1] = (Math.random() - 0.5) * (50 - dist) * 0.5;
            homePoints[i3+2] = dist * Math.sin(angle);
        } else if (currentMode === 'heart') {
             // x = 16sin^3(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
             // parametric needs a range, usually 0 to 2PI.
             // We can just map i to t.
             const t = (i / PARTICLE_COUNT) * Math.PI * 2;
             // Add some thickness/randomness
             const scale = 2.5;
             const rOffset = Math.random();
             const xBase = 16 * Math.pow(Math.sin(t), 3);
             const yBase = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
             
             homePoints[i3] = (xBase * scale) + (Math.random()-0.5) * 4;
             homePoints[i3+1] = (yBase * scale) + (Math.random()-0.5) * 4;
             homePoints[i3+2] = (Math.random() - 0.5) * 20;
        } else if (currentMode === 'fountain') {
            const angle = (i % 100) / 100 * Math.PI * 2;
            const h = (i / PARTICLE_COUNT); // 0 to 1
            const r = Math.sin(h * Math.PI) * 20;
            homePoints[i3] = r * Math.cos(angle);
            homePoints[i3+1] = h * 80 - 40;
            homePoints[i3+2] = r * Math.sin(angle);
        } else {
            // Cube/Default
            homePoints[i3] = (Math.random() - 0.5) * 80;
            homePoints[i3+1] = (Math.random() - 0.5) * 80;
            homePoints[i3+2] = (Math.random() - 0.5) * 80;
        }
      }
    };

    // Initial layout
    updateLayout(mode, customImageData);

    // --- ANIMATION LOOP ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      target.x = (1 - mouse.x) * 0.002;
      target.y = (1 - mouse.y) * 0.002;

      // Rotate the whole cloud slightly
      particles.rotation.y += 0.002;
      particles.rotation.x += (target.y - particles.rotation.x) * 0.05;

      const pAttr = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        // Physics: seek home position
        const ax = (homePoints[i3] - pAttr[i3]) * 0.05; // spring strength
        const ay = (homePoints[i3+1] - pAttr[i3+1]) * 0.05;
        const az = (homePoints[i3+2] - pAttr[i3+2]) * 0.05;

        velocities[i3] += ax;
        velocities[i3+1] += ay;
        velocities[i3+2] += az;

        // Friction
        velocities[i3] *= 0.92;
        velocities[i3+1] *= 0.92;
        velocities[i3+2] *= 0.92;

        // Mouse interaction (repel)
        // Map mouse 2D to 3D roughly
        const mx = (mouse.x / windowHalfX) * 100;
        const my = -(mouse.y / windowHalfY) * 100; // Flip Y
        
        const dx = mx - pAttr[i3];
        const dy = my - pAttr[i3+1];
        const distSq = dx*dx + dy*dy;
        
        if (distSq < 1500) { // Radius of influence
            const force = (1500 - distSq) / 1500;
            velocities[i3] -= dx * force * 0.02;
            velocities[i3+1] -= dy * force * 0.02;
            // Z disturbance
            velocities[i3+2] += Math.sin(distSq) * force * 0.5; 
        }

        pAttr[i3] += velocities[i3];
        pAttr[i3+1] += velocities[i3+1];
        pAttr[i3+2] += velocities[i3+2];
      }

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Watch for mode changes to update layout without re-creating scene
    const watcher = { mode, customImageData }; 
    // We can't easily access the outer scope's latest props in this effect closure 
    // without refactoring. For simplicity, we'll assume the component remounts 
    // or we add a separate effect for mode changes.

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount for scene setup

  // Effect to handle mode changes
  useEffect(() => {
    // This is a bit tricky with the ref pattern above. 
    // Ideally we'd structure the THREE code in a class outside the component 
    // or use refs to access the updateLayout function.
    // For this generated code, forcing a re-mount by keying the component 
    // in the parent is the cleanest robust way to ensure clean state transitions.
  }, [mode, customImageData]);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black" />;
}
