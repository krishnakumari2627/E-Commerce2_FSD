import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createLiquidChromeWave,
  createLiquidChromeSculpture,
  createRefractiveGem,
  createLiquidChromeOrb,
  createHolographicHaloRing,
  createStardustField,
} from './FloatingObjects';

/**
 * ThreeBackground
 * Apple/Stripe-Style Liquid Chrome & Iridescent Silk 3D Experience
 * Features:
 * - Hypnotic undulating liquid chrome wave with real-time cursor ripple physics
 * - Morphing liquid metal ribbon sculpture with high specular reflections
 * - Refractive glass crystal gems and floating liquid mercury spheres
 * - Interactive mouse-following cursor light with spring physics
 * - Minimalist holographic neon halo rings
 * - Sparkling stardust particles
 */
export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    let animationFrameId = null;
    const disposables = [];

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    let renderer;
    let scene;
    let camera;

    try {
      // 1. Scene
      scene = new THREE.Scene();

      // 2. Camera with expansive perspective
      const width = container.clientWidth || window.innerWidth || 1200;
      const height = container.clientHeight || window.innerHeight || 700;
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 11);

      // 3. WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        powerPreference: 'high-performance',
        antialias: !isMobile,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      // 4. Studio Cinematic Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
      dirLight.position.set(6, 12, 8);
      scene.add(dirLight);

      // Deep Indigo Studio Fill
      const pointLightIndigo = new THREE.PointLight(0x6366f1, 4.0, 30);
      pointLightIndigo.position.set(0, 5, 4);
      scene.add(pointLightIndigo);

      // Vivid Magenta Rim Light
      const pointLightMagenta = new THREE.PointLight(0xec4899, 3.5, 25);
      pointLightMagenta.position.set(-6, -2, 5);
      scene.add(pointLightMagenta);

      // Electric Cyan Accent Light
      const pointLightCyan = new THREE.PointLight(0x06b6d4, 3.8, 25);
      pointLightCyan.position.set(6, 2, 4);
      scene.add(pointLightCyan);

      // Dynamic Interactive Cursor Light (follows mouse with spring physics)
      const cursorLight = new THREE.PointLight(0x38bdf8, 4.5, 14);
      cursorLight.position.set(0, 0, 3);
      scene.add(cursorLight);

      // 5. 3D Elements Assembly

      // A. Hypnotic Liquid Chrome / Silk Wave Floor
      const wave = createLiquidChromeWave({
        width: isMobile ? 28 : 40,
        height: isMobile ? 18 : 25,
        segW: isMobile ? 50 : 85,
        segH: isMobile ? 40 : 65,
      });
      scene.add(wave.mesh);
      disposables.push(wave);

      // B. Morphing Liquid Chrome Ribbon Sculpture (Right horizon anchor)
      const sculpture = createLiquidChromeSculpture({ radius: isMobile ? 1.1 : 1.55, tube: isMobile ? 0.35 : 0.42 });
      sculpture.mesh.position.set(isMobile ? 1.5 : 3.8, isMobile ? 0.2 : 0.6, -0.6);
      scene.add(sculpture.mesh);
      disposables.push(sculpture);

      // C. Refractive Glass Crystals (Refracting scene lights)
      const gem1 = createRefractiveGem({ radius: isMobile ? 0.55 : 0.85, color: 0x818cf8 });
      gem1.mesh.position.set(isMobile ? -1.6 : -4.2, isMobile ? 0.8 : 1.8, -1.2);
      scene.add(gem1.mesh);
      disposables.push(gem1);

      let gem2;
      if (!isMobile) {
        gem2 = createRefractiveGem({ radius: 0.65, color: 0xf472b6 });
        gem2.mesh.position.set(4.6, -1.6, -1.5);
        scene.add(gem2.mesh);
        disposables.push(gem2);
      }

      // D. Floating Liquid Mercury / Chrome Spheres
      const orb1 = createLiquidChromeOrb({ radius: isMobile ? 0.3 : 0.48 });
      orb1.mesh.position.set(isMobile ? 1.2 : 2.0, isMobile ? -1.4 : -1.8, 0.5);
      scene.add(orb1.mesh);
      disposables.push(orb1);

      let orb2;
      let orb3;
      if (!isMobile) {
        orb2 = createLiquidChromeOrb({ radius: 0.32 });
        orb2.mesh.position.set(-2.8, -1.5, 0.2);
        scene.add(orb2.mesh);
        disposables.push(orb2);

        orb3 = createLiquidChromeOrb({ radius: 0.25 });
        orb3.mesh.position.set(-4.5, -0.4, -0.8);
        scene.add(orb3.mesh);
        disposables.push(orb3);
      }

      // E. Minimalist Holographic Halo Rings
      const ring1 = createHolographicHaloRing({ radius: isMobile ? 1.8 : 2.6, color: 0x06b6d4 });
      ring1.mesh.position.set(isMobile ? 1.5 : 3.8, isMobile ? 0.2 : 0.6, -0.6);
      ring1.mesh.rotation.x = Math.PI / 3;
      scene.add(ring1.mesh);
      disposables.push(ring1);

      // F. Stardust Particles Field
      const particles = createStardustField({ count: isMobile ? 180 : isTablet ? 300 : 450, range: 24 });
      scene.add(particles.points);
      disposables.push(particles);

      // Floating items animation array
      const floatingItems = [
        {
          mesh: sculpture.mesh,
          basePos: sculpture.mesh.position.clone(),
          speed: 0.9,
          amp: 0.16,
          parallax: 0.45,
          phase: 0,
        },
        {
          mesh: gem1.mesh,
          basePos: gem1.mesh.position.clone(),
          speed: 1.15,
          amp: 0.22,
          parallax: 0.55,
          phase: 1.5,
          rotX: 0.007,
          rotY: 0.012,
          rotZ: 0.005,
        },
        {
          mesh: orb1.mesh,
          basePos: orb1.mesh.position.clone(),
          speed: 1.3,
          amp: 0.18,
          parallax: 0.4,
          phase: 2.8,
        },
      ];

      if (gem2) {
        floatingItems.push({
          mesh: gem2.mesh,
          basePos: gem2.mesh.position.clone(),
          speed: 1.0,
          amp: 0.18,
          parallax: 0.5,
          phase: 3.2,
          rotX: 0.008,
          rotY: 0.01,
          rotZ: 0.006,
        });
      }

      if (orb2) {
        floatingItems.push({
          mesh: orb2.mesh,
          basePos: orb2.mesh.position.clone(),
          speed: 1.4,
          amp: 0.15,
          parallax: 0.35,
          phase: 4.1,
        });
      }

      if (orb3) {
        floatingItems.push({
          mesh: orb3.mesh,
          basePos: orb3.mesh.position.clone(),
          speed: 0.85,
          amp: 0.14,
          parallax: 0.3,
          phase: 0.8,
        });
      }

      // 6. Interactive Cursor Tracking (Spring Physics)
      let mouseX = 0;
      let mouseY = 0;
      let targetMouseX = 0;
      let targetMouseY = 0;

      const handleMouseMove = (event) => {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const clientX = event.clientX - rect.left;
        const clientY = event.clientY - rect.top;
        targetMouseX = (clientX / rect.width) * 2 - 1;
        targetMouseY = -(clientY / rect.height) * 2 + 1;
      };

      if (!isMobile && !prefersReducedMotion) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
      }

      // 7. Responsive Resizing
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newWidth = container.clientWidth || window.innerWidth || 1200;
        const newHeight = container.clientHeight || window.innerHeight || 700;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      };

      window.addEventListener('resize', handleResize);

      // 8. Animation Loop
      const startTime = performance.now();

      const animate = () => {
        if (isDisposed) return;
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = (performance.now() - startTime) * 0.001;
        const motionMultiplier = prefersReducedMotion ? 0.25 : 1.0;

        // Smooth mouse spring interpolation
        mouseX += (targetMouseX - mouseX) * 0.045;
        mouseY += (targetMouseY - mouseY) * 0.045;

        // Camera parallax
        if (!isMobile && !prefersReducedMotion) {
          camera.position.x = mouseX * 0.75;
          camera.position.y = mouseY * 0.45;
          camera.lookAt(0, 0, 0);
        }

        // Dynamic Cursor Light following mouse in 3D world
        cursorLight.position.x = mouseX * 8;
        cursorLight.position.y = mouseY * 5;
        cursorLight.position.z = 2.5 + Math.sin(elapsedTime * 2.0) * 0.5;

        // Update liquid chrome wave
        if (wave.update) {
          wave.update(elapsedTime * motionMultiplier, mouseX, mouseY);
        }

        // Update morphing sculpture
        if (sculpture.update) {
          sculpture.update(elapsedTime * motionMultiplier);
        }

        // Animate halo ring rotation
        ring1.mesh.rotation.z = elapsedTime * 0.4 * motionMultiplier;
        ring1.mesh.rotation.y = Math.sin(elapsedTime * 0.3) * 0.3;

        // Floating objects bobbing & rotating
        for (let i = 0; i < floatingItems.length; i++) {
          const item = floatingItems[i];
          const floatY = Math.sin(elapsedTime * item.speed * motionMultiplier + item.phase) * item.amp;
          item.mesh.position.y = item.basePos.y + floatY + (mouseY * item.parallax * 0.35);
          item.mesh.position.x = item.basePos.x + (mouseX * item.parallax * 0.45);

          if (item.rotX) item.mesh.rotation.x += item.rotX * motionMultiplier;
          if (item.rotY) item.mesh.rotation.y += item.rotY * motionMultiplier;
          if (item.rotZ) item.mesh.rotation.z += item.rotZ * motionMultiplier;
        }

        // Slow particle drift
        if (particles.points) {
          particles.points.rotation.y = elapsedTime * 0.02 * motionMultiplier;
          particles.points.rotation.x = Math.sin(elapsedTime * 0.015) * 0.04 * motionMultiplier;
        }

        renderer.render(scene, camera);
      };

      animate();

      // 9. Cleanup
      return () => {
        isDisposed = true;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);

        disposables.forEach((item) => {
          try {
            if (item && typeof item.dispose === 'function') {
              item.dispose();
            }
          } catch { /* ignore disposal errors */ }
        });

        if (scene) {
          while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
          }
        }

        if (renderer) {
          try {
            renderer.dispose();
            renderer.forceContextLoss?.();
            if (renderer.domElement) {
              renderer.domElement.remove();
            }
          } catch { /* ignore renderer cleanup errors */ }
        }
      };
    } catch (err) {
      console.warn('Three.js Liquid Chrome Background initialization skipped:', err);
      return () => {
        isDisposed = true;
      };
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className="three-canvas-container"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
