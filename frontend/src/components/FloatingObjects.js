import * as THREE from 'three';

/**
 * Apple/Stripe-Style Liquid Chrome & Iridescent Silk 3D Assets
 * Procedural generation of organic fluid geometry, morphing chrome sculptures,
 * and refractive crystal optics for an ultra-premium aesthetic.
 */

// Helper: Circular particle glow texture
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(129, 140, 248, 0.9)');
  gradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.3)');
  gradient.addColorStop(1, 'rgba(15, 15, 26, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 1. HYPNOTIC LIQUID CHROME / IRIDESCENT SILK WAVE
 * Expansive 3D fluid surface with multi-harmonic wave physics and cursor ripple
 */
export function createLiquidChromeWave({ width = 38, height = 24, segW = 90, segH = 70 } = {}) {
  const geometry = new THREE.PlaneGeometry(width, height, segW, segH);
  geometry.rotateX(-Math.PI / 2.35);

  const posAttribute = geometry.attributes.position;
  const initialPositions = posAttribute.array.slice();

  // Luxurious Liquid Chrome Material
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x312e81, // Deep Royal Indigo Base
    emissive: 0x1e1b4b,
    emissiveIntensity: 0.25,
    metalness: 0.88,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    reflectivity: 0.95,
    wireframe: false,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, -3.2, -3.5);

  return {
    mesh,
    update: (time, mouseX, mouseY) => {
      const pos = geometry.attributes.position;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const ix = initialPositions[i * 3];
        const iy = initialPositions[i * 3 + 1];

        // Complex organic fluid wave harmonics
        const wave1 = Math.sin(ix * 0.28 + time * 1.3) * 0.7;
        const wave2 = Math.cos(iy * 0.32 + time * 1.1) * 0.55;
        const wave3 = Math.sin((ix * 0.4 + iy * 0.3) + time * 1.7) * 0.4;
        const wave4 = Math.cos((ix * 0.2 - iy * 0.35) + time * 0.9) * 0.3;

        // Interactive cursor ripple disturbance
        const dx = ix - (mouseX * 14);
        const dy = iy - (mouseY * 9);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ripple = Math.sin(dist * 0.7 - time * 2.8) * Math.exp(-dist * 0.16) * 0.85;

        pos.setZ(i, wave1 + wave2 + wave3 + wave4 + ripple);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    }
  };
}

/**
 * 2. MORPHING LIQUID CHROME SCULPTURE (Torus Knot)
 * Hypnotic organic ribbon sculpture that twists and reflects iridescent lights
 */
export function createLiquidChromeSculpture({ radius = 1.6, tube = 0.42 } = {}) {
  const geometry = new THREE.TorusKnotGeometry(radius, tube, 120, 32, 2, 3);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x4f46e5,
    emissive: 0x312e81,
    emissiveIntensity: 0.2,
    metalness: 0.92,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(3.8, 0.4, -0.8);

  return {
    mesh,
    update: (time) => {
      mesh.rotation.x = time * 0.35;
      mesh.rotation.y = time * 0.5;
      mesh.rotation.z = Math.sin(time * 0.2) * 0.3;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    }
  };
}

/**
 * 3. REFRACTIVE CRYSTAL GEMSTONES
 * Pure glass refractive icosahedrons with high IOR and dispersion
 */
export function createRefractiveGem({ radius = 0.8, color = 0x818cf8 } = {}) {
  const geometry = new THREE.IcosahedronGeometry(radius, 0);

  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.05,
    transmission: 0.92, // Glass refraction
    thickness: 1.4,
    ior: 1.65,
    metalness: 0.1,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.88,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    }
  };
}

/**
 * 4. FLOATING LIQUID MERCURY / CHROME ORBS
 * Highly polished mirror spheres that catch light glints
 */
export function createLiquidChromeOrb({ radius = 0.45 } = {}) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);

  const material = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.98,
    roughness: 0.08,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    }
  };
}

/**
 * 5. HOLOGRAPHIC GYROSCOPIC TECH RINGS
 * Minimalist thin laser rings orbiting the composition
 */
export function createHolographicHaloRing({ radius = 2.4, color = 0x06b6d4 } = {}) {
  const geometry = new THREE.TorusGeometry(radius, 0.018, 16, 100);

  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.75,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    }
  };
}

/**
 * 6. STARDUST PARTICLES FIELD
 * Sparkling micro-dust particles drifting through the fluid wave
 */
export function createStardustField({ count = 450, range = 24 } = {}) {
  const texture = createParticleTexture();
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * range;
    positions[i * 3 + 1] = (Math.random() - 0.5) * (range * 0.7);
    positions[i * 3 + 2] = (Math.random() - 0.5) * range - 2;
    scales[i] = Math.random() * 0.8 + 0.3;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  const material = new THREE.PointsMaterial({
    size: 0.36,
    map: texture,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    dispose: () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    }
  };
}
