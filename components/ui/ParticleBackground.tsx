"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

interface ParticleBackgroundProps {
  count?: number;
  speed?: number;
  className?: string;
}

export default function ParticleBackground({
  count = 60,
  speed = 0.6,
  className = "",
}: ParticleBackgroundProps) {
  const [engineReady, setEngineReady] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, [isMobile]);

  const options: ISourceOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "bubble" },
          onClick: { enable: true, mode: "push" },
        },
        modes: {
          bubble: { distance: 120, size: 8, duration: 0.3, opacity: 0.8 },
          push: { quantity: 3 },
        },
      },
      particles: {
        color: {
          value: ["#74C69D", "#D8F3DC", "#ffffff", "#74C69D", "#52B788"],
        },
        links: {
          color: "#74C69D",
          distance: 140,
          enable: true,
          opacity: 0.12,
          width: 1,
        },
        move: {
          direction: "top" as const,
          enable: true,
          outModes: {
            default: "out" as const,
            top: "destroy" as const,
            bottom: "none" as const,
          },
          random: true,
          speed: speed,
          straight: false,
          warp: false,
        },
        number: { density: { enable: true }, value: count },
        opacity: {
          value: { min: 0.15, max: 0.5 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        shape: { type: "circle" },
        size: {
          value: { min: 2, max: 6 },
          animation: { enable: true, speed: 1, sync: false },
        },
        shadow: {
          enable: true,
          color: "#74C69D",
          blur: 8,
        },
      },
      detectRetina: true,
    }),
    [count, speed]
  );

  if (isMobile || !engineReady) return null;

  return (
    <Particles
      id={`tsparticles-${count}-${speed}`}
      options={options}
      className={`absolute inset-0 z-0 pointer-events-none ${className}`}
    />
  );
}
