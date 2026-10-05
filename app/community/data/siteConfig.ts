export interface RealmConfig {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  tagline: string;
  status: "ONLINE" | "IN DEVELOPMENT" | "MAINTENANCE" | "OFFLINE";
  accessInfo: string;
  serverIp?: string;
  directJoinUrl?: string;
  version?: string;
  features: string[];
  rules?: string[];
  externalMapUrl?: string;
  maxPlayers?: number;
  threatLevel?: "NOMINAL" | "ELEVATED" | "CRITICAL";
}

export interface TournamentConfig {
  id: string;
  title: string;
  game: string;
  format: string;
  status: "REGISTRATION OPEN" | "IN PROGRESS" | "UPCOMING" | "CONCLUDED";
  prizePool: string;
  scheduleDate: string;
  registrationUrl: string;
  streamBroadcastUrl: string;
  bracketUrl?: string;
  rules: string[];
}

export interface OfficialSocials {
  discord: string;
  youtube?: string;
  twitch?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  github?: string;
  store?: string;
  reddit?: string;
  kick?: string;
}

export interface AnnouncementBanner {
  enabled: boolean;
  type: "info" | "urgent" | "event" | "maintenance";
  badgeText: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}

export interface SiteConfig {
  identity: {
    siteName: string;
    brandTagline: string;
    metaTitle: string;
    metaDescription: string;
    missionHeadline: string;
    missionStatement: string;
    discordGuildId: string;
    contactEmail: string;
    copyrightText: string;
  };
  announcement: AnnouncementBanner;
  socials: OfficialSocials;
  realms: {
    smp: RealmConfig;
    rp: RealmConfig;
    esports: RealmConfig;
  };
  tournament: TournamentConfig;
  system: {
    maintenanceMode: boolean;
    audioAmbienceEnabled: boolean;
    defaultVolume: number;
    telemetryRefreshRateSec: number;
  };
}

export const defaultSiteConfig: SiteConfig = {
  identity: {
    siteName: "E-WORLD",
    brandTagline: "A UNIVERSE TOGETHER",
    metaTitle: "E-WORLD // TECHNICAL HUD",
    metaDescription: "E-World Cinematic WebGL & Live Telemetry Experience",
    missionHeadline: "A WORLD BEYOND PLAY.",
    missionStatement:
      "An independent digital civilization uniting custom Minecraft survival multiplayer, FiveM cinematic roleplay, and competitive esports operations.",
    discordGuildId: "1550017295789588523",
    contactEmail: "admin@eworld.net",
    copyrightText: "© 2026 E-World Protocol. All telemetry rights reserved.",
  },
  announcement: {
    enabled: false,
    type: "info",
    badgeText: "",
    message: "",
    actionText: "",
    actionUrl: "",
  },
  socials: {
    discord: "https://discord.gg/ewld",
    youtube: "https://youtube.com/@eworld",
    twitch: "https://twitch.tv/eworld",
    twitter: "https://x.com/eworld",
    instagram: "https://instagram.com/eworld",
    tiktok: "https://tiktok.com/@eworld",
    github: "https://github.com/eworld",
    store: "https://store.eworld.net",
  },
  realms: {
    smp: {
      id: "smp",
      name: "E-WORLD SMP",
      category: "MINECRAFT JAVA 1.21",
      subtitle: "Build • Explore • Survive",
      tagline: "CUSTOM SHADERS • EXPEDITION REALM",
      status: "ONLINE",
      accessInfo: "Verified Citizens on Discord",
      serverIp: "151.243.226.61:25565",
      version: "Purpur 1.21.11",
      maxPlayers: 100,
      features: [
        "Crossplay: Java, Bedrock, TLauncher & SKLauncher",
        "Custom Terrain & Atmospheric Shaders",
        "Player-Driven Dynamic Economy",
        "Dungeon Raid Megastructures",
        "GriefDefender Core Protection",
      ],
      rules: [
        "No unconsented griefing or stealing in claim zones",
        "Automated duping and malicious hacks strictly prohibited",
        "Respect community trade corridors and builds",
      ],
      externalMapUrl: "",
    },
    rp: {
      id: "rp",
      name: "E-WORLD RP",
      category: "FIVEM / GTA V",
      subtitle: "Live • Build • Become",
      tagline: "LOS SANTOS METROPOLIS • ROLEPLAY",
      status: "ONLINE",
      accessInfo: "Tier 1 Whitelist Required",
      directJoinUrl: "cfx.re/join/eworld",
      threatLevel: "ELEVATED",
      maxPlayers: 128,
      features: [
        "Realistic Multi-Tier Economy",
        "Custom Performance Vehicle Handling",
        "Dedicated Police, SWAT & EMS Departments",
        "Player-Owned Businesses & Luxury Real Estate",
      ],
      rules: [
        "Value your life at all times (NVL rule enforced)",
        "No Metagaming or Out-Of-Character comms in voice channels",
        "Microphone of acceptable fidelity is mandatory",
      ],
    },
    esports: {
      id: "esports",
      name: "E-WORLD ARENA",
      category: "COMPETITIVE OPERATIONS",
      subtitle: "Invitational Tournaments",
      tagline: "TIER 1 ANTI-CHEAT ENFORCED",
      status: "IN DEVELOPMENT",
      accessInfo: "Announcements on Discord",
      features: [
        "5v5 Search & Destroy Brackets",
        "Official Competitive Map Rotation",
        "Real-Time Anti-Cheat Hardware Verification",
        "Multi-Stream Broadcast with Live Casting",
      ],
    },
  },
  tournament: {
    id: "codm-championship-2026",
    title: "CODM CHAMPIONSHIP 2026",
    game: "Call of Duty: Mobile",
    format: "5v5 Search & Destroy (Double Elimination)",
    status: "REGISTRATION OPEN",
    prizePool: "₹50,000 INR",
    scheduleDate: "OCTOBER 15, 2026",
    registrationUrl: "https://discord.gg/ewld",
    streamBroadcastUrl: "https://youtube.com/@eworld",
    rules: [
      "Official 5v5 S&D ruleset apply",
      "No third-party emulators permitted",
      "Mandatory screen recordings upon referee request",
    ],
  },
  system: {
    maintenanceMode: false,
    audioAmbienceEnabled: true,
    defaultVolume: 0.4,
    telemetryRefreshRateSec: 15,
  },
};
