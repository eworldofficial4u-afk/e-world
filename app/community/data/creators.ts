export type CreatorCategory = "Star Creator" | "Content Creator";

export interface CreatorSocials {
  youtube?: string;
  twitch?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  kick?: string;
}

export const ROLE_STAR_CREATORS_ID = "1550017295789588523";
export const ROLE_CONTENT_CREATOR_ID = "1550016791428730960";

export interface Creator {
  id: string;
  name: string;
  username: string;
  tag: string;
  category: CreatorCategory;
  badge: string;
  avatarGradient: string;
  avatarGlow: string;
  avatarUrl?: string;
  initials: string;
  role: string;
  subscribers: string;
  platform: string;
  specialties: string[];
  featuredQuote: string;
  verified: boolean;
  discordRoleId?: string;
  links: CreatorSocials;
}

export const creators: Creator[] = [
  // ==========================================
  // CATEGORY 1: STAR CREATORS
  // ==========================================
  {
    id: "dot",
    name: "DOT",
    username: "dotrender",
    tag: "@dotrender",
    category: "Star Creator",
    badge: "Star Creator",
    avatarGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
    avatarGlow: "rgba(245, 158, 11, 0.45)",
    initials: "DOT",
    role: "Lead Filmmaker • FiveM Cinema & Machinima",
    subscribers: "165K+",
    platform: "YouTube & Twitch",
    specialties: ["FiveM Cinema", "4K Server Trailers", "SMP Lore & Directing"],
    featuredQuote:
      "“Every frame in E-World tells a story. We don't just capture gameplay; we direct living cinema.”",
    verified: true,
    links: {
      youtube: "https://youtube.com/@dotrender",
      twitch: "https://twitch.tv/dotrender",
      twitter: "https://x.com/dotrender",
      instagram: "https://instagram.com/dotrender",
    },
  },
  {
    id: "savi",
    name: "Savi",
    username: "saviytts",
    tag: "@saviytts",
    category: "Star Creator",
    badge: "Star Creator",
    avatarGradient: "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)",
    avatarGlow: "rgba(244, 63, 94, 0.45)",
    initials: "SV",
    role: "Content Creator • SMP Megabuilds & Live Events",
    subscribers: "140K+",
    platform: "YouTube & Twitch",
    specialties: ["SMP Megaprojects", "Survival Architecture", "Community Festivals"],
    featuredQuote:
      "“E-World is an infinite canvas. Building here alongside the community feels like crafting a digital empire.”",
    verified: true,
    links: {
      youtube: "https://youtube.com/@saviytts",
      twitch: "https://twitch.tv/saviytts",
      twitter: "https://x.com/saviytts",
      instagram: "https://instagram.com/saviytts",
    },
  },

  // ==========================================
  // CATEGORY 2: CONTENT CREATORS
  // ==========================================
  {
    id: "dpi",
    name: "-DPI",
    username: "ggs11",
    tag: "@ggs11",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #2563eb 100%)",
    avatarGlow: "rgba(6, 182, 212, 0.45)",
    initials: "-D",
    role: "FPS Specialist • E-World Roleplay & Tactics",
    subscribers: "78K+",
    platform: "Twitch & YouTube",
    specialties: ["Tactical Infiltration", "E-World Street RP", "Competitive Aim"],
    featuredQuote:
      "“Precision aim, ultra-low latency, and high-octane pursuits. The arena in E-World never sleeps.”",
    verified: true,
    links: {
      youtube: "https://youtube.com/@ggs11",
      twitch: "https://twitch.tv/ggs11",
      twitter: "https://x.com/ggs11",
      instagram: "https://instagram.com/ggs11",
    },
  },
  {
    id: "smmoky",
    name: "!Smmoky",
    username: "smmoky",
    tag: "@smmoky",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #4f46e5 100%)",
    avatarGlow: "rgba(168, 85, 247, 0.45)",
    initials: "!S",
    role: "Survival Expert • Hardcore Speedruns & Tourneys",
    subscribers: "92K+",
    platform: "YouTube & Twitch",
    specialties: ["Hardcore Survival", "Speedrunning", "Community Showdowns"],
    featuredQuote:
      "“If you're not pushing every boundary in E-World, you're only seeing half the universe. Welcome to the smoke show.”",
    verified: true,
    links: {
      youtube: "https://youtube.com/@smmoky",
      twitch: "https://twitch.tv/smmoky",
      twitter: "https://x.com/smmoky",
      instagram: "https://instagram.com/smmoky",
    },
  },
  {
    id: "biggb-khan",
    name: "Biggb Khan",
    username: "biggbsteel",
    tag: "@biggbsteel",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
    avatarGlow: "rgba(16, 185, 129, 0.45)",
    initials: "BK",
    role: "Roleplay Vanguard • Underground Syndicates & Car Culture",
    subscribers: "68K+",
    platform: "YouTube & Kick",
    specialties: ["Underground Factions", "Custom Vehicle Tuning", "High-Stakes Heists"],
    featuredQuote:
      "“Respect isn't given on the streets of E-World; it's forged in chrome, horsepower, and unbreakable loyalty.”",
    verified: true,
    links: {
      youtube: "https://youtube.com/@biggbsteel",
      twitch: "https://twitch.tv/biggbsteel",
      twitter: "https://x.com/biggbsteel",
      instagram: "https://instagram.com/biggbsteel",
    },
  },
  {
    id: "sendy",
    name: "Sendy",
    username: "akthegamer_",
    tag: "@akthegamer_",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)",
    avatarGlow: "rgba(249, 115, 22, 0.45)",
    initials: "SN",
    role: "Arena Champion • FPS Montages & Live Casting",
    subscribers: "96K+",
    platform: "YouTube & Instagram",
    specialties: ["Esports Highlights", "Tournament Casting", "Sniper Montages"],
    featuredQuote:
      "“Locked in 24/7. When tournament brackets drop in E-World, you know where to look for peak plays.”",
    verified: true,
    links: {
      youtube: "https://youtube.com/@akthegamer_",
      twitch: "https://twitch.tv/akthegamer_",
      twitter: "https://x.com/akthegamer_",
      instagram: "https://instagram.com/akthegamer_",
    },
  },
  {
    id: "vada-pav",
    name: "Vada Pav",
    username: "zclux.frr",
    tag: "@zclux.frr",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #9333ea 100%)",
    avatarGlow: "rgba(236, 72, 153, 0.45)",
    initials: "VP",
    role: "Variety Entertainer • SMP Comedy & Community Shenanigans",
    subscribers: "58K+",
    platform: "YouTube & Twitch",
    specialties: ["SMP Pranks & Banter", "Voice Room Chaos", "Faction Warfare"],
    featuredQuote:
      "“Top-tier spice, endless laughs, and unhinged moments. E-World is always better with a hot snack and great company.”",
    verified: true,
    links: {
      youtube: "https://youtube.com/@zclux.frr",
      twitch: "https://twitch.tv/zclux_frr",
      twitter: "https://x.com/zclux_frr",
      instagram: "https://instagram.com/zclux.frr",
    },
  },
];
