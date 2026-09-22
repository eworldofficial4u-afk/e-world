"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, extend, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial, Plane } from "@react-three/drei";

const FluidDistortionMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0.5, 0.5),
    uMouseVelocity: 0.0,
    uTransition: 0.0,
    uResolution: new THREE.Vector2(1, 1),
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
    uniform float uMouseVelocity;
    uniform float uTransition;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simplex Noise 2D
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5);

      // 1. Mouse trail fluid ripple
      float distToMouse = distance(uv, uMouse);
      float mouseWave = sin(distToMouse * 35.0 - uTime * 6.0) * exp(-distToMouse * 4.0);
      float mouseRipple = mouseWave * uMouseVelocity * 0.08;

      // 2. Liquid screen transition shockwave
      float distToCenter = distance(uv, center);
      float waveRadius = uTransition * 1.5;
      float shockDist = abs(distToCenter - waveRadius);
      float shockwave = sin(shockDist * 40.0 - uTime * 8.0) * exp(-shockDist * 12.0) * uTransition;

      // 3. Fluid turbulent warp
      float noiseVal = snoise(uv * 4.0 + vec2(uTime * 0.5));
      vec2 displacement = vec2(
        noiseVal * 0.03 * (uMouseVelocity + uTransition * 1.5) + shockwave * 0.05,
        snoise(uv * 4.0 - vec2(uTime * 0.5)) * 0.03 * (uMouseVelocity + uTransition * 1.5) + shockwave * 0.05
      );

      // Chromatic liquid refraction tint
      float alpha = clamp((abs(mouseRipple) * 1.5 + abs(shockwave) * 2.0), 0.0, 0.45);
      vec3 liquidTint = vec3(
        0.1 + shockwave * 0.4,
        0.3 + abs(mouseRipple) * 0.6,
        0.7 + shockwave * 0.8
      );

      gl_FragColor = vec4(liquidTint, alpha);
    }
  `
);

extend({ FluidDistortionMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    fluidDistortionMaterial: ThreeElement<typeof FluidDistortionMaterial>;
  }
}

interface FluidDistortionPassProps {
  transitionProgress: number;
}

export default function FluidDistortionPass({
  transitionProgress,
}: FluidDistortionPassProps) {
  const matRef = useRef<any>(null);
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const currentMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lastMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const velocity = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      targetMouse.current.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight
      );
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useFrame(({ clock, gl }, delta) => {
    if (!matRef.current) return;

    // Calculate smooth mouse movement velocity
    currentMouse.current.lerp(targetMouse.current, 1 - Math.exp(-12 * delta));
    const dist = currentMouse.current.distanceTo(lastMouse.current);
    velocity.current = THREE.MathUtils.lerp(
      velocity.current,
      Math.min(1.0, dist * 25),
      1 - Math.exp(-6 * delta)
    );
    lastMouse.current.copy(currentMouse.current);

    matRef.current.uTime = clock.getElapsedTime();
    matRef.current.uMouse.copy(currentMouse.current);
    matRef.current.uMouseVelocity = velocity.current;
    matRef.current.uTransition = transitionProgress;
    gl.getDrawingBufferSize(matRef.current.uResolution);
  });

  return (
    <Plane
      args={[2, 2]}
      frustumCulled={false}
      renderOrder={999}
      raycast={() => {}}
    >
      <fluidDistortionMaterial
        ref={matRef}
        key={FluidDistortionMaterial.key}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Plane>
  );
}
