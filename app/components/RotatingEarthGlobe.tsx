"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

interface RotatingEarthGlobeProps {
  position?: [number, number, number];
  radius?: number;
  rotationSpeed?: number;
  mode?: "horizon" | "full";
}

export default function RotatingEarthGlobe({
  position = [0, -11.2, -1.0],
  radius = 10.5,
  rotationSpeed = 0.035,
  mode = "horizon",
}: RotatingEarthGlobeProps) {
  const rootGroupRef = useRef<THREE.Group>(null!);
  const axialTiltRef = useRef<THREE.Group>(null!);
  const earthRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const atmosphereRef = useRef<THREE.ShaderMaterial>(null!);

  // Interactive drag-to-spin state
  const isDragging = useRef(false);
  const prevPointerX = useRef(0);
  const prevPointerY = useRef(0);
  const spinVelocityX = useRef(0);
  const spinVelocityY = useRef(0);

  // Load 5.4K Google Earth satellite photography & terrain maps
  const [satelliteMap, cloudsMap, normalMap, specularMap, lightsMap] = useTexture([
    "/assets/earth_google_satellite.jpg",
    "/assets/earth_clouds.png",
    "/assets/earth_normal.jpg",
    "/assets/earth_specular.jpg",
    "/assets/earth_lights.png",
  ]);

  useEffect(() => {
    satelliteMap.colorSpace = THREE.SRGBColorSpace;
    lightsMap.colorSpace = THREE.SRGBColorSpace;
    satelliteMap.anisotropy = 16;
  }, [satelliteMap, lightsMap]);

  // Google Earth Rayleigh Atmospheric Scattering Shader
  const atmosphereVertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const atmosphereFragmentShader = `
    varying vec3 vNormal;
    void main() {
      float viewDot = dot(vNormal, vec3(0.0, 0.0, 1.0));
      float intensity = pow(0.72 - max(0.0, viewDot), 2.8);
      // Google Earth distinctive azure & electric cyan limb scattering
      vec3 atmosphericAura = mix(vec3(0.05, 0.45, 0.95), vec3(0.1, 0.82, 1.0), intensity);
      gl_FragColor = vec4(atmosphericAura * 1.8, intensity * 1.4);
    }
  `;

  // Pointer drag listeners for Google Earth-style spinning
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    isDragging.current = true;
    prevPointerX.current = e.clientX;
    prevPointerY.current = e.clientY;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - prevPointerX.current;
    const deltaY = e.clientY - prevPointerY.current;
    prevPointerX.current = e.clientX;
    prevPointerY.current = e.clientY;

    spinVelocityX.current = deltaX * 0.006;
    spinVelocityY.current = deltaY * 0.004;

    if (earthRef.current) {
      earthRef.current.rotation.y += spinVelocityX.current;
    }
    if (axialTiltRef.current) {
      axialTiltRef.current.rotation.x = THREE.MathUtils.clamp(
        axialTiltRef.current.rotation.x + spinVelocityY.current,
        -0.6,
        0.6
      );
    }
  };

  useEffect(() => {
    const onUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  useFrame((state, delta) => {
    // Mode transitions (smooth animated lerp between orbital horizon and full globe)
    const targetPos: [number, number, number] =
      mode === "full" ? [0, 0.2, 1.5] : position;
    const targetScale = mode === "full" ? 0.46 : 1.0;

    if (rootGroupRef.current) {
      rootGroupRef.current.position.x = THREE.MathUtils.lerp(
        rootGroupRef.current.position.x,
        targetPos[0],
        0.05
      );
      rootGroupRef.current.position.y = THREE.MathUtils.lerp(
        rootGroupRef.current.position.y,
        targetPos[1],
        0.05
      );
      rootGroupRef.current.position.z = THREE.MathUtils.lerp(
        rootGroupRef.current.position.z,
        targetPos[2],
        0.05
      );
      rootGroupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.05
      );
    }

    if (!isDragging.current) {
      // Damped spin inertia
      spinVelocityX.current *= 0.93;
      spinVelocityY.current *= 0.93;

      // Continuous Google Earth planetary rotation
      if (earthRef.current) {
        earthRef.current.rotation.y += delta * rotationSpeed + spinVelocityX.current;
      }

      // Atmospheric cloud drift with natural parallax
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y +=
          delta * (rotationSpeed * 1.38) + spinVelocityX.current * 1.15;
      }

      // Subtle mouse tilt for immense cinematic depth
      if (rootGroupRef.current && mode === "horizon") {
        const targetRotX = state.pointer.y * 0.025;
        const targetRotZ = -state.pointer.x * 0.025;
        rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rootGroupRef.current.rotation.x,
          targetRotX,
          0.05
        );
        rootGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rootGroupRef.current.rotation.z,
          targetRotZ,
          0.05
        );
      }
    } else {
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += spinVelocityX.current * 1.15;
      }
    }
  });

  return (
    <group
      ref={rootGroupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 23.4° Earth Axial Tilt */}
      <group ref={axialTiltRef} rotation={[0.12, 0, 0.408]}>
        {/* 1. Google Earth Photorealistic Satellite Surface */}
        <mesh ref={earthRef} receiveShadow>
          <sphereGeometry args={[radius, 128, 128]} />
          <meshStandardMaterial
            map={satelliteMap}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.95, 0.95)}
            roughnessMap={specularMap}
            roughness={0.62}
            metalness={0.18}
            emissiveMap={lightsMap}
            emissive="#ffcc66"
            emissiveIntensity={0.65}
          />
        </mesh>

        {/* 2. Swirling Atmospheric Cloud Layer */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius * 1.015, 64, 64]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent
            opacity={0.82}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 3. Google Earth Cyan Rayleigh Scattering Outer Limb Halo */}
        <mesh>
          <sphereGeometry args={[radius * 1.034, 64, 64]} />
          <shaderMaterial
            ref={atmosphereRef}
            vertexShader={atmosphereVertexShader}
            fragmentShader={atmosphereFragmentShader}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
