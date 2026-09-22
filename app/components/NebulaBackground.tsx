'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, extend, type ThreeElement } from '@react-three/fiber';
import { Plane, shaderMaterial } from '@react-three/drei';

// 1. Define the custom ShaderMaterial using Drei's shaderMaterial helper.
// This handles uniform initialization and automatic GLSL compilation.
const NebulaMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(0, 0),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // --- Noise Functions (FBM & Simplex Noise) ---
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = sin(i.x + i.y * 57.0);
      float b = sin(i.x + 1.0 + i.y * 57.0);
      float c = sin(i.x + (i.y + 1.0) * 57.0);
      float d = sin(i.x + 1.0 + (i.y + 1.0) * 57.0);
      return 0.5 + 0.5 * mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float total = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        total += noise(p) * amplitude;
        p *= 2.0;
        amplitude *= 0.5;
      }
      return total;
    }

    // --- Nebula Shader Logic ---
    void main() {
      // Normalize UVs and handle aspect ratio
      vec2 uv = vUv;
      vec2 st = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

      // 1. Base Dark Space
      vec3 finalColor = vec3(0.01, 0.0, 0.02); // Deep, dark violet void

      // 2. Stars
      vec2 starUV = st * 50.0;
      float starNoise = noise(starUV + uTime * 0.01); // Slow drift
      float stars = smoothstep(0.97, 1.0, starNoise) * 0.8; // High contrast star points
      finalColor += vec3(stars) * (1.0 - uMouse.y * 0.5); // Stars twinkle slightly with mouse

      // 3. The Nebula Clouds (FBM Layers)
      vec2 nebulaUV = st * 0.5; // Scale nebula down

      // Introduce uTime drift and mouse interaction (warp)
      vec2 warp = uMouse * 0.2; 
      nebulaUV += vec2(fbm(nebulaUV + uTime * 0.05 + warp), fbm(nebulaUV - uTime * 0.03 - warp)) * 0.5;

      // Noise value for colors
      float n = fbm(nebulaUV);

      // 4. Color Layers (Purple/Blue Mix)
      vec3 col1 = vec3(0.2, 0.0, 0.4); // Deep Purple
      vec3 col2 = vec3(0.0, 0.3, 0.6); // Deep Blue
      vec3 col3 = vec3(0.5, 0.0, 1.0); // Bright Neon Purple
      vec3 col4 = vec3(0.0, 0.8, 1.0); // Bright Neon Blue

      // Blend the colors based on the noise value 'n' and apply glow
      vec3 nebulaColor = mix(col1, col2, n);
      nebulaColor = mix(nebulaColor, col3, pow(n, 3.0) * 2.0); // Add bright purple filaments
      nebulaColor = mix(nebulaColor, col4, pow(max(0.0, n - 0.5), 5.0) * 3.0); // Add bright blue highlights

      // Add mouse interaction to the nebula glow: intensity increases near the mouse
      float mouseGlow = 1.0 - distance(st, uMouse * 2.0) * 0.4;
      nebulaColor *= max(0.2, mouseGlow);

      finalColor += nebulaColor * smoothstep(0.3, 0.85, n) * 0.35;

      // Output final fragment color with subtle cinematic bloom-like contrast
      gl_FragColor = vec4(finalColor, 1.0);
      #include <colorspace_fragment>
    }
  `
);

// 2. Extend R3F with the new NebulaMaterial component
extend({ NebulaMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    nebulaMaterial: ThreeElement<typeof NebulaMaterial>;
  }
}

export function NebulaPlane() {
  const materialRef = useRef<InstanceType<typeof NebulaMaterial>>(null);
  const targetMouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const move = (event: PointerEvent) => {
      targetMouse.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
      );
    };
    const reset = () => targetMouse.current.set(0, 0);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', reset);
    document.documentElement.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', reset);
      document.documentElement.removeEventListener('pointerleave', reset);
    };
  }, []);

  useFrame(({ clock, gl }, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uMouse.value.lerp(targetMouse.current, 1 - Math.exp(-3 * delta));
    gl.getDrawingBufferSize(material.uniforms.uResolution.value);
  });

  return (
    <Plane args={[2, 2]} frustumCulled={false} renderOrder={-1000} raycast={() => {}}>
      <nebulaMaterial
        ref={materialRef}
        key={NebulaMaterial.key}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </Plane>
  );
}

/** Place foreground content in a positioned container with z-index: 1. */
export default function NebulaBackground() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#030008' }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, alpha: false }}>
        <NebulaPlane />
      </Canvas>
    </div>
  );
}

