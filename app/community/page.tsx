"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Activity, Radio, Trophy, Sparkles } from "lucide-react";
import EventsTournamentHub from "./components/EventsTournamentHub";
import CreatorGuildSection from "./components/CreatorGuildSection";
import CouncilTeamSection from "./components/CouncilTeamSection";
import IndexMatrixTable from "./components/IndexMatrixTable";
import NexusCommsWidget from "./components/NexusCommsWidget";
import CitizenLeaderboardSection from "./components/CitizenLeaderboardSection";
import CitizenIdModal from "./components/CitizenIdModal";
import BotCommandsDrawer from "./components/BotCommandsDrawer";
import { useLiveStats, Citizen } from "../../hooks/useLiveStats";
import ConstellationGrid from "@/components/ui/constellation-grid";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import styles from "./community.module.css";

const worlds = [
  { name: "E-World", tag: "DISCORD / COMMUNITY", image: "/images/community/discord-world-new.jpg", color: "#e9b972", word: "Belong", line: "beyond the screen.", description: "Different worlds. Familiar voices. A place for late-night conversations, unlikely friendships, and whatever we create next.", href: "https://discord.gg/ewld", cta: "Find your people" },
  { name: "E-World", tag: "MINECRAFT / SURVIVAL", image: "/images/community/smp-world-old.jpg", color: "#91d5aa", word: "Build", line: "something together.", description: "Start with a block. Leave behind a world. Find your crew and make your mark in a shared survival universe.", href: "/smp", cta: "Explore the SMP" },
  { name: "E-World", tag: "FIVEM / ROLEPLAY", image: "/images/community/fivem-world-old.jpg", color: "#82bdec", word: "Become", line: "your next story.", description: "Every street is a beginning. Meet the people, make the choices, and become part of a city written by its players.", href: "/grid", cta: "Enter the city" },
];

const chapters = ["Explore", "Comms", "Leaderboard", "Events", "Creators", "Council", "Directory"] as const;
type Chapter = typeof chapters[number];

export default function CommunityPage() {
  const [selected, setSelected] = useState(0);
  const [chapter, setChapter] = useState<Chapter>("Explore");
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState(false);
  const [isBotDrawerOpen, setIsBotDrawerOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | undefined>(undefined);

  const stage = useRef<HTMLDivElement>(null);
  const world = worlds[selected];
  const { stats, isConnected } = useLiveStats(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080");
  const count = selected === 0 ? stats.nexus.online : selected === 1 ? stats.block.players : stats.grid.players;

  return (
    <main className={styles.experience} style={{ "--accent": world.color } as CSSProperties}>
      {/* Interactive Constellation Grid Kinetic Mesh in Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-75">
        <ConstellationGrid showOverlay={false} className="w-full h-full bg-transparent" />
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="E-World home">E<span>—</span>WORLD<span className={styles.brandDot}>®</span></Link>
        <nav aria-label="Community chapters" className={styles.nav}>
          {chapters.map(item => (
            <button
              key={item}
              aria-current={chapter === item ? "page" : undefined}
              onClick={() => setChapter(item)}
            >
              {item === "Comms" ? "Voice Comms" : item}
            </button>
          ))}
        </nav>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => { setSelectedCitizen(undefined); setIsCitizenModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-cyan-400/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,245,255,0.2)]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Citizen ID</span>
          </button>
          <a href="https://discord.gg/ewld" target="_blank" rel="noreferrer">
            <InteractiveHoverButton text="Join Community" className="text-xs py-1.5 px-4 min-w-36" />
          </a>
        </div>
      </header>

      {chapter === "Explore" ? (
        <div
          className={styles.stage}
          ref={stage}
          onPointerMove={event => {
            if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const rect = event.currentTarget.getBoundingClientRect();
            stage.current?.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width - 0.5) * 22}px`);
            stage.current?.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height - 0.5) * 16}px`);
          }}
          onPointerLeave={() => {
            stage.current?.style.setProperty("--mx", "0px");
            stage.current?.style.setProperty("--my", "0px");
          }}
        >
          <div className={styles.ambient} aria-hidden="true" />
          <div className={styles.stars} aria-hidden="true" />
          <div className={styles.coordinates}>A SHARED UNIVERSE<br />BUILT AROUND YOU</div>
          <div className={styles.artwork} key={world.image} aria-hidden="true">
            <div className={styles.orbit} /><div className={styles.orbitTwo} />
            <div className={styles.planet}>
              <Image src={world.image} alt="" fill sizes="(max-width: 700px) 100vw, 65vw" priority />
            </div>
            <span className={styles.orbitLabel}>E-W / 0{selected + 1} <i /> {world.name.toUpperCase()}</span>
          </div>
          <div className={styles.heroCopy} key={world.name}>
            <p className={styles.eyebrow}><span /> THE E-WORLD COLLECTIVE</p>
            <h1>{world.word}<br /><em>{world.line}</em></h1>
            <p className={styles.description}>{world.description}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <a href={world.href} target={selected === 0 ? "_blank" : undefined} rel={selected === 0 ? "noreferrer" : undefined} className="inline-block">
                <InteractiveHoverButton text={world.cta} className="text-xs py-2.5 px-6 min-w-44" />
              </a>

              {/* Quick Discord Bot & Citizen Portals */}
              <button
                onClick={() => { setSelectedCitizen(undefined); setIsCitizenModalOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-cyan-400/40 bg-black/60 text-cyan-300 hover:bg-cyan-950/60 transition-all font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,245,255,0.25)] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>CITIZEN ID</span>
              </button>

              <button
                onClick={() => setIsBotDrawerOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white/80 hover:text-white hover:border-white/30 transition-all font-mono text-xs font-bold cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>LIVE STATS</span>
              </button>
            </div>
          </div>
          <div className={styles.sideNote}>PEOPLE MAKE THE WORLD.</div>
          <div className={styles.worldPicker} aria-label="Choose a world">
            {worlds.map((item, index) => (
              <button
                key={item.name}
                className={selected === index ? styles.selected : ""}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span className={styles.number}>0{index + 1}</span>
                <span><small>{item.tag}</small><strong>{item.name}</strong></span>
                <span className={styles.worldArrow}>↗</span>
              </button>
            ))}
          </div>
          <footer className={styles.footer}>
            <span>
              <i className={isConnected ? styles.live : styles.offline} />
              {isConnected ? `${count.toLocaleString()} ONLINE IN THIS WORLD` : "LIVE CONNECTION UNAVAILABLE"}
            </span>
            <span>THREE WORLDS. ONE COMMUNITY.</span>
            <button onClick={() => setChapter("Comms")}>Connect to Voice Comms ↓</button>
          </footer>
        </div>
      ) : (
        <div className={styles.chapterContent}>
          <div className={styles.chapterHeading}>
            <p className={styles.eyebrow}>THE COLLECTIVE / {chapter.toUpperCase()}</p>
            <h1>
              {chapter === "Comms"
                ? "Direct from E-World."
                : chapter === "Leaderboard"
                ? "Top active citizens."
                : chapter === "Events"
                ? "Make it a moment."
                : chapter === "Creators"
                ? "E-World Creators."
                : chapter === "Council"
                ? "Meet the collective."
                : "Your next destination."}
            </h1>
            <button onClick={() => setChapter("Explore")}>← Back to the universe</button>
          </div>

          {chapter === "Comms" ? (
            <div className="max-w-5xl mx-auto w-full py-8">
              <NexusCommsWidget
                channels={stats.nexus.voiceChannels}
                totalActiveVoice={stats.nexus.voiceActive}
              />
            </div>
          ) : chapter === "Leaderboard" ? (
            <CitizenLeaderboardSection
              leaderboard={stats.nexus.leaderboard}
              onOpenCitizenCard={(c) => {
                setSelectedCitizen(c);
                setIsCitizenModalOpen(true);
              }}
            />
          ) : chapter === "Events" ? (
            <EventsTournamentHub />
          ) : chapter === "Creators" ? (
            <CreatorGuildSection />
          ) : chapter === "Council" ? (
            <CouncilTeamSection />
          ) : (
            <IndexMatrixTable />
          )}

          <div className={styles.chapterEnd}>
            <p>There’s a place for you here.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              <a href="https://discord.gg/ewld" target="_blank" rel="noreferrer">
                <InteractiveHoverButton text="Join us on Discord" className="text-xs py-3 px-6 min-w-48" />
              </a>
              <button
                onClick={() => { setSelectedCitizen(undefined); setIsCitizenModalOpen(true); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-cyan-400/40 bg-black/60 text-cyan-300 hover:bg-cyan-950/60 font-mono text-xs font-bold shadow-[0_0_20px_rgba(0,245,255,0.2)] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>CLAIM CITIZEN ID</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holographic Citizen ID & Discord Sync Modal */}
      <CitizenIdModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
        defaultCitizen={selectedCitizen}
      />

      {/* Bot Slash Commands Drawer */}
      <BotCommandsDrawer
        isOpen={isBotDrawerOpen}
        onClose={() => setIsBotDrawerOpen(false)}
        botStats={stats.nexus.botStats}
      />
    </main>
  );
}
