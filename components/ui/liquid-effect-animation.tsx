"use client"

import { useEffect, useRef } from "react"

interface LiquidEffectAnimationProps {
  imageUrl?: string
  className?: string
  metalness?: number
  roughness?: number
  displacementScale?: number
}

export function LiquidEffectAnimation({
  imageUrl = "",
  className = "",
  metalness = 0.1,
  roughness = 0.08,
  displacementScale = 3.5,
}: LiquidEffectAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Load the script dynamically
    const script = document.createElement("script")
    script.type = "module"
    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      
      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        ${imageUrl ? `app.loadImage('${imageUrl}');` : `app.loadImage(null);`}
        if (app.liquidPlane && app.liquidPlane.material) {
          app.liquidPlane.material.color.setHex(0x000000);
          app.liquidPlane.material.metalness = ${metalness};
          app.liquidPlane.material.roughness = ${roughness};
          if (app.liquidPlane.material.emissive) {
            app.liquidPlane.material.emissive.setHex(0x000000);
          }
          if (app.liquidPlane.material.envMapIntensity !== undefined) {
            app.liquidPlane.material.envMapIntensity = 0.75;
          }
        }
        if (app.liquidPlane && app.liquidPlane.uniforms && app.liquidPlane.uniforms.displacementScale) {
          app.liquidPlane.uniforms.displacementScale.value = ${displacementScale};
        }
        app.setRain(true);
        app.setRainTime(1.6);
        window.__liquidApp = app;
      }
    `
    document.body.appendChild(script)

    return () => {
      if (window.__liquidApp && window.__liquidApp.dispose) {
        window.__liquidApp.dispose()
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [imageUrl, metalness, roughness, displacementScale])

  return (
    <div
      className={`fixed inset-0 m-0 w-full h-full touch-none overflow-hidden ${className}`}
      style={{ fontFamily: '"Montserrat", serif' }}
    >
      <canvas ref={canvasRef} id="liquid-canvas" className="fixed inset-0 w-full h-full" />
    </div>
  )
}

declare global {
  interface Window {
    __liquidApp?: any
  }
}
