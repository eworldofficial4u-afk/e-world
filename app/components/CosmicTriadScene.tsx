"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";

interface OrbProps {
  id: string;
  name: string;
  subName: string;
  badge: string;
  subtitle: string;
  texturePath?: string;
  videoPath?: string;
  position: [number, number, number];
  color: string;
  accentHex: string;
  isActive: boolean;
  onSelect: () => void;
  href?: string;
  size?: number;
  ringTilt?: [number, number, number];
  isVideo?: boolean;
}

// Custom hook to build glowing orbital particle rings
function useOrbParticles(size: number) {
  const particleCount = 280;
  return useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const outerPos = new Float32Array((particleCount / 2) * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const r = size * 1.55 + (Math.random() - 0.5) * 0.35;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }

    for (let i = 0; i < particleCount / 2; i++) {
      const angle = (i / (particleCount / 2)) * Math.PI * 2;
      const r = size * 1.85 + (Math.random() - 0.5) * 0.45;
      outerPos[i * 3] = Math.cos(angle) * r;
      outerPos[i * 3 + 1] = (Math.random() - 0.5) * 0.35;
      outerPos[i * 3 + 2] = Math.sin(angle) * r;
    }

    const g1 = new THREE.BufferGeometry();
    g1.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute("position", new THREE.BufferAttribute(outerPos, 3));
    return { ringGeo: g1, outerRingGeo: g2 };
  }, [size]);
}

// Standard Terrarium Orb with static texture
function TerrariumImageOrb({
  id,
  name,
  subName,
  badge,
  subtitle,
  texturePath = "",
  position,
  color,
  accentHex,
  isActive,
  onSelect,
  href,
  size = 2.2,
  ringTilt = [0.4, 0.2, -0.3],
}: OrbProps) {
  const router = useRouter();
  const texture = useTexture(texturePath);
  const meshRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Points>(null!);
  const ringOuterRef = useRef<THREE.Points>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  const { ringGeo, outerRingGeo } = useOrbParticles(size);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const offset = id === "smp" ? 1.0 : id === "community" ? 0.0 : 2.0;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.9 + offset) * 0.15;
    }

    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.45;
      ringRef.current.rotation.z += delta * 0.1;
    }

    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.y -= delta * 0.25;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (href) {
      router.push(href);
    }
    onSelect();
  };

  return (
    <group ref={meshRef} position={position}>
      {/* Interactive Trigger Sphere */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[size * 1.15, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Internal High-Fidelity Diorama Billboard inside Glass Sphere */}
      <mesh ref={coreRef}>
        <planeGeometry args={[size * 2.35, size * 2.35]} />
        <shaderMaterial
          uniforms={{ uMap: { value: texture } }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uMap;
            varying vec2 vUv;
            void main() {
              vec4 sampleColor = texture2D(uMap, vUv);
              float radius = length(vUv - 0.5);
              float edge = 1.0 - smoothstep(0.40, 0.50, radius);
              // Suppress the dark space matte only near the perimeter.
              float brightness = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
              float matte = mix(1.0, smoothstep(0.015, 0.14, brightness), smoothstep(0.32, 0.44, radius));
              float alpha = sampleColor.a * edge * matte;
              if (alpha < 0.005) discard;
              gl_FragColor = vec4(sampleColor.rgb, alpha);
              #include <colorspace_fragment>
            }
          `}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting Particle Dust Rings */}
      <group rotation={ringTilt}>
        <points ref={ringRef} geometry={ringGeo}>
          <pointsMaterial
            size={0.05}
            color={color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
        <points ref={ringOuterRef} geometry={outerRingGeo}>
          <pointsMaterial
            size={0.035}
            color={color}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* Label Plate Below Sphere */}
      <Html position={[0, -size * 1.25, 0]} center zIndexRange={[100, 0]}>
        <div
          onClick={handleClick}
          className={`flex flex-col items-center select-none pointer-events-auto cursor-pointer transition-all duration-300 ${
            isActive ? "scale-105" : "hover:scale-105 opacity-90 hover:opacity-100"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <span
              className="text-[10px] font-mono tracking-widest font-semibold"
              style={{ color: accentHex }}
            >
              {badge}
            </span>
            <div className="flex items-center gap-1.5 leading-tight">
              <h3 className="text-white font-bold text-sm sm:text-base tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {name}
              </h3>
              {subName && (
                <span
                  className="text-xs sm:text-sm font-semibold tracking-wider uppercase"
                  style={{ color: accentHex }}
                >
                  {subName}
                </span>
              )}
            </div>
            <p className="text-white/60 text-[9px] font-mono tracking-[0.25em] uppercase mt-0.5">
              {subtitle}
            </p>
          </div>

          <div
            className="mt-2 text-xs transition-transform duration-300"
            style={{
              color: accentHex,
              filter: `drop-shadow(0 0 8px ${accentHex})`,
            }}
          >
            ▽
          </div>
        </div>
      </Html>
    </group>
  );
}

// Video-based Terrarium Orb with square framing and white background keying
function TerrariumVideoOrb({
  id,
  name,
  subName,
  badge,
  subtitle,
  videoPath = "/assets/discord.mp4",
  position,
  color,
  accentHex,
  isActive,
  onSelect,
  href,
  size = 2.2,
  ringTilt = [0.4, 0.2, -0.3],
}: OrbProps) {
  const router = useRouter();
  const meshRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Points>(null!);
  const ringOuterRef = useRef<THREE.Points>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  const { ringGeo, outerRingGeo } = useOrbParticles(size);

  const dummyTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, 2, 2);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    if (!videoPath || typeof document === "undefined") return;

    const video = document.createElement("video");
    video.src = videoPath;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    video.addEventListener("canplay", tryPlay);
    tryPlay();

    const handlePointerDown = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", handlePointerDown, { once: true });
    window.addEventListener("touchstart", handlePointerDown, { once: true });

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    setVideoTexture(tex);

    return () => {
      video.removeEventListener("canplay", tryPlay);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      video.pause();
      video.removeAttribute("src");
      video.load();
      tex.dispose();
    };
  }, [videoPath]);

  useFrame((state, delta) => {
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }

    if (meshRef.current) {
      const offset = id === "smp" ? 1.0 : id === "community" ? 0.0 : 2.0;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.9 + offset) * 0.15;
    }

    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.45;
      ringRef.current.rotation.z += delta * 0.1;
    }

    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.y -= delta * 0.25;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (href) {
      router.push(href);
    }
    onSelect();
  };

  const uniforms = useMemo(() => {
    return {
      uMap: { value: videoTexture || dummyTexture },
    };
  }, [videoTexture, dummyTexture]);

  return (
    <group ref={meshRef} position={position}>
      {/* Interactive Trigger Sphere */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[size * 1.15, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Internal Billboard: square 1:1 framing with transparent white background */}
      <mesh ref={coreRef}>
        <planeGeometry args={[size * 2.35, size * 2.35]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uMap;
            varying vec2 vUv;

            void main() {
              // Map square plane (0..1) to 1:1 square crop of 1280x720 video
              // 750px crop out of 1280x720 keeps the entire globe & outer rings without edge cutoff
              vec2 videoUv = vec2(
                (vUv.x - 0.5) * (750.0 / 1280.0) + 0.5,
                (vUv.y - 0.5) * (750.0 / 720.0) + 0.5
              );

              if (videoUv.x < 0.0 || videoUv.x > 1.0 || videoUv.y < 0.0 || videoUv.y > 1.0) {
                discard;
              }

              vec4 sampleColor = texture2D(uMap, videoUv);

              float minVal = min(sampleColor.r, min(sampleColor.g, sampleColor.b));
              float maxVal = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
              float sat = maxVal - minVal;
              float dist = length(vUv - 0.5);

              // Adaptive lightness threshold
              float lightThreshLow = dist > 0.32 ? 0.68 : 0.76;
              float lightThreshHigh = dist > 0.32 ? 0.84 : 0.89;

              float isLight = smoothstep(lightThreshLow, lightThreshHigh, minVal);
              // Background is neutral white (low sat <= 0.06), while golden rings & Discord logo have sat > 0.25
              float isNeutral = 1.0 - smoothstep(0.06, 0.20, sat);

              float bgMask = isLight * isNeutral;
              float alpha = clamp(1.0 - bgMask, 0.0, 1.0) * sampleColor.a;

              // Soft square edge fade
              float edgeX = max(0.0, abs(vUv.x - 0.5) - 0.46) / 0.04;
              float edgeY = max(0.0, abs(vUv.y - 0.5) - 0.46) / 0.04;
              float edgeDist = max(edgeX, edgeY);
              alpha *= (1.0 - smoothstep(0.0, 1.0, edgeDist));

              if (alpha < 0.01) discard;

              gl_FragColor = vec4(sampleColor.rgb, alpha);
              #include <colorspace_fragment>
            }
          `}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting Particle Dust Rings */}
      <group rotation={ringTilt}>
        <points ref={ringRef} geometry={ringGeo}>
          <pointsMaterial
            size={0.05}
            color={color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
        <points ref={ringOuterRef} geometry={outerRingGeo}>
          <pointsMaterial
            size={0.035}
            color={color}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* Label Plate Below Sphere */}
      <Html position={[0, -size * 1.25, 0]} center zIndexRange={[100, 0]}>
        <div
          onClick={handleClick}
          className={`flex flex-col items-center select-none pointer-events-auto cursor-pointer transition-all duration-300 ${
            isActive ? "scale-105" : "hover:scale-105 opacity-90 hover:opacity-100"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <span
              className="text-[10px] font-mono tracking-widest font-semibold"
              style={{ color: accentHex }}
            >
              {badge}
            </span>
            <div className="flex items-center gap-1.5 leading-tight">
              <h3 className="text-white font-bold text-sm sm:text-base tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {name}
              </h3>
              {subName && (
                <span
                  className="text-xs sm:text-sm font-semibold tracking-wider uppercase"
                  style={{ color: accentHex }}
                >
                  {subName}
                </span>
              )}
            </div>
            <p className="text-white/60 text-[9px] font-mono tracking-[0.25em] uppercase mt-0.5">
              {subtitle}
            </p>
          </div>

          <div
            className="mt-2 text-xs transition-transform duration-300"
            style={{
              color: accentHex,
              filter: `drop-shadow(0 0 8px ${accentHex})`,
            }}
          >
            ▽
          </div>
        </div>
      </Html>
    </group>
  );
}

// TerrariumOrb dispatcher: renders video or image orb
function TerrariumOrb(props: OrbProps) {
  const isVideo = props.isVideo || Boolean(props.videoPath) || props.texturePath?.endsWith(".mp4");
  if (isVideo) {
    return <TerrariumVideoOrb {...props} />;
  }
  return <TerrariumImageOrb {...props} />;
}

// Procedural Asteroids floating in 3D
function AsteroidBelt() {
  const asteroidCount = 18;
  const groupRef = useRef<THREE.Group>(null!);

  const rocks = useMemo(() => {
    const list = [];
    for (let i = 0; i < asteroidCount; i++) {
      const radius = 0.3 + Math.random() * 0.7;
      const x = (Math.random() - 0.5) * 26;
      const y = (Math.random() - 0.5) * 12 - 2;
      const z = -6 + (Math.random() - 0.5) * 10;
      const rotSpeed = [(Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5];
      list.push({ id: i, pos: [x, y, z] as [number, number, number], radius, rotSpeed });
    }
    return list;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, idx) => {
        const rock = rocks[idx];
        if (rock) {
          child.rotation.x += rock.rotSpeed[0] * delta;
          child.rotation.y += rock.rotSpeed[1] * delta;
          child.rotation.z += rock.rotSpeed[2] * delta;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {rocks.map((r) => (
        <mesh key={r.id} position={r.pos}>
          <dodecahedronGeometry args={[r.radius, 1]} />
          <meshStandardMaterial
            color="#2a2e3a"
            roughness={0.9}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Orbital Ellipse Lines connecting the 3 orbs
function OrbitalTrajectories({ scale = 1 }: { scale?: number }) {
  const lineGeo = useMemo(() => {
    const points = [];
    const segments = 128;
    const a = 11.5 * scale;
    const b = 4.2 * scale;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * a;
      const z = Math.sin(theta) * b;
      const y = (Math.sin(theta) * 1.5 - 0.5) * scale;
      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [scale]);

  return (
    <group rotation={[0.2, 0, -0.05]}>
      {/* @ts-ignore */}
      <line geometry={lineGeo}>
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
}

interface CosmicTriadSceneProps {
  activeWorld: string | null;
  onSelectWorld: (id: string) => void;
}

export default function CosmicTriadScene({
  activeWorld,
  onSelectWorld,
}: CosmicTriadSceneProps) {
  const { viewport } = useThree();
  const aspect = viewport.aspect;

  // Responsive device aspect layout
  // aspect < 0.85: Portrait mobile (e.g. 9:16 ~ 0.56, 9:20 ~ 0.45)
  // 0.85 <= aspect < 1.35: Tablets, foldables & square viewports (e.g. 4:3 ~ 1.33)
  // aspect >= 1.35: Standard laptops, desktops & ultra-wide screens (16:9, 21:9)
  const isMobilePortrait = aspect < 0.85;
  const isTablet = aspect >= 0.85 && aspect < 1.35;

  const config = useMemo(() => {
    if (isMobilePortrait) {
      return {
        scale: 0.65,
        yOffset: 0.9,
        communityPos: [-1.85, -0.7, 0.5] as [number, number, number],
        smpPos: [0, 2.5, -0.5] as [number, number, number],
        rpPos: [1.85, -0.7, 0.5] as [number, number, number],
      };
    } else if (isTablet) {
      return {
        scale: 0.82,
        yOffset: 0.3,
        communityPos: [-4.2, 0.1, 0.5] as [number, number, number],
        smpPos: [0, 2.35, -0.5] as [number, number, number],
        rpPos: [4.2, 0.1, 0.5] as [number, number, number],
      };
    } else {
      return {
        scale: 1.0,
        yOffset: 0,
        communityPos: [-6.2, -0.1, 0.5] as [number, number, number],
        smpPos: [0, 2.35, -0.5] as [number, number, number],
        rpPos: [6.2, -0.1, 0.5] as [number, number, number],
      };
    }
  }, [isMobilePortrait, isTablet]);

  return (
    <group position={[0, config.yOffset, 0]}>
      {/* Subtle Orbital Ellipse Guides */}
      <OrbitalTrajectories scale={config.scale} />

      {/* Floating Asteroid Field */}
      <AsteroidBelt />

      {/* 1. Left Orb: E-WORLD COMMUNITY (Amber / Gold) */}
      <TerrariumOrb
        id="community"
        name="E-WORLD"
        subName="COMMUNITY"
        badge="// 01"
        subtitle="PEOPLE × EVENTS"
        videoPath="/assets/discord.mp4"
        position={config.communityPos}
        color="#fbbf24"
        accentHex="#f59e0b"
        size={2.15 * config.scale}
        ringTilt={[0.5, 0.3, -0.4]}
        isActive={activeWorld === "community"}
        onSelect={() => onSelectWorld("community")}
        href="/community"
        isVideo
      />

      {/* 2. Center Top Orb: E-WORLD SMP (Emerald Green) */}
      <TerrariumOrb
        id="smp"
        name="E-WORLD"
        subName="SMP"
        badge="02 //"
        subtitle="BUILD × SURVIVE"
        texturePath="/images/community/smp-world-20260914.png"
        position={config.smpPos}
        color="#22c55e"
        accentHex="#10b981"
        size={2.35 * config.scale}
        ringTilt={[0.3, -0.4, 0.2]}
        isActive={activeWorld === "smp"}
        onSelect={() => onSelectWorld("smp")}
        href="/smp"
      />

      {/* 3. Right Orb: E-WORLD FIVEM (Electric Cyan / Blue) */}
      <TerrariumOrb
        id="rp"
        name="E-WORLD"
        subName="FIVEM"
        badge="// 03"
        subtitle="CITY × ROLEPLAY"
        texturePath="/images/community/fivem-world-20260914.png"
        position={config.rpPos}
        color="#38bdf8"
        accentHex="#00aaff"
        size={2.15 * config.scale}
        ringTilt={[-0.4, 0.3, 0.3]}
        isActive={activeWorld === "rp"}
        onSelect={() => onSelectWorld("rp")}
        href="/grid"
      />
    </group>
  );
}

