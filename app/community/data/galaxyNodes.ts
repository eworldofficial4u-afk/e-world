export interface GalaxyNode {
  id: string;
  name: string;
  category: string;
  radius: number;
  color: string;
  glowColor: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  desc: string;
  stats: string;
  actionLabel?: string;
  link?: string;
}

export const galaxyNodes: GalaxyNode[] = [
  {
    id: "core",
    name: "E-WORLD CORE",
    category: "E-World Central Core",
    radius: 36,
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.6)",
    orbitRadius: 0,
    orbitSpeed: 0,
    angle: 0,
    desc: "The central gravitational anchor connecting every gaming realm, tournament, and creator into one unified universe.",
    stats: "12,300+ Citizens • Infinite Worlds",
  },
  {
    id: "community",
    name: "Community Hub",
    category: "Social Network",
    radius: 22,
    color: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.5)",
    orbitRadius: 110,
    orbitSpeed: 0.0006,
    angle: 0.2,
    desc: "The beating heart of E-World. Active 24/7 Discord channels, voice lounges, and community-driven events.",
    stats: "2,380+ Online • Level System Active",
    actionLabel: "JOIN DISCORD",
    link: "https://discord.gg/ewld",
  },
  {
    id: "smp",
    name: "E-World SMP",
    category: "Minecraft Universe",
    radius: 25,
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.6)",
    orbitRadius: 170,
    orbitSpeed: 0.00045,
    angle: 1.4,
    desc: "High-performance survival multiplayer realm with custom world generation, player economy, and lore events.",
    stats: "Version 1.21 • 82 Players Peak",
    actionLabel: "EXPLORE SMP",
    link: "/smp",
  },
  {
    id: "rp",
    name: "E-World RP",
    category: "FiveM Metropolis",
    radius: 25,
    color: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.6)",
    orbitRadius: 230,
    orbitSpeed: 0.00035,
    angle: 3.1,
    desc: "Cinematic roleplay city featuring custom economy, emergency services, business ownership, and deep character lore.",
    stats: "Active Citizens 124 / 128 • Whitelist Open",
    actionLabel: "ENTER THE GRID",
    link: "/grid",
  },
  {
    id: "tournaments",
    name: "Esports Arena",
    category: "Competitive Operations",
    radius: 20,
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.6)",
    orbitRadius: 290,
    orbitSpeed: 0.00028,
    angle: 4.5,
    desc: "Double-elimination competitive tournaments with anti-cheat enforcement, cash prize pools, and live casting.",
    stats: "$1,500 Current Prize Pool • 32 Teams",
  },
  {
    id: "creators",
    name: "E-World Creators",
    category: "Talent & Streaming",
    radius: 19,
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.6)",
    orbitRadius: 350,
    orbitSpeed: 0.00022,
    angle: 5.6,
    desc: "Official ambassador network for Star and Content creators delivering cinema, megabuilds, and esports casting.",
    stats: "790K+ Collective Reach • 7 Creators",
  },
];
