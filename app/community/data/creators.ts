export type CreatorCategory = "Star Creator" | "Content Creator";

export interface CreatorSocials {
  youtube?: string;
  twitch?: string;
  twitter?: string;
  steam?: string;
  spotify?: string;
  github?: string;
  reddit?: string;
  riotgames?: string;
  battlenet?: string;
  xbox?: string;
  playstation?: string;
  epicgames?: string;
  roblox?: string;
  bluesky?: string;
  paypal?: string;
  ebay?: string;
  crunchyroll?: string;
  amazonmusic?: string;
  bungie?: string;
  facebook?: string;
  domain?: string;
  website?: string;
  instagram?: string;
  discord?: string;
  kick?: string;
  bio?: string;
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
  bioLink?: string;
  bio?: string;
  memberSince?: string;
  links: CreatorSocials;
}

export const creators: Creator[] = [
  // ==========================================
  // CATEGORY 1: STAR CREATORS
  // ==========================================
  {
    id: "989767963823456267",
    name: "STARKOPIAN",
    username: "starkopian",
    tag: "@starkopian",
    category: "Star Creator",
    badge: "Star Creator",
    avatarGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
    avatarGlow: "rgba(245, 158, 11, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/embed/avatars/3.png",
    initials: "STA",
    role: "E-World Star Creator • Media Ambassador",
    subscribers: "Discord Role Verified",
    platform: "Spotify • Twitch • YouTube",
    specialties: ["Cinematics", "SMP Megabuilds", "Community Events"],
    featuredQuote: "Lost somewhere between midnight and morning.",
    bio: "EWLD- http://discord.gg/ewld\nLost somewhere between midnight and morning.",
    memberSince: "Jun 24, 2022",
    verified: true,
    discordRoleId: ROLE_STAR_CREATORS_ID,
    bioLink: "http://discord.gg/ewld",
    links: {
      spotify: "https://open.spotify.com/user/Starkopian",
      twitch: "https://twitch.tv/starkopian",
      youtube: "https://youtube.com/@Starkopian",
    },
  },
  {
    id: "611825507683532802",
    name: "SAVI",
    username: "saviytts",
    tag: "@saviytts",
    category: "Star Creator",
    badge: "Star Creator",
    avatarGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
    avatarGlow: "rgba(245, 158, 11, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/avatars/611825507683532802/289e97c02fc315f05edbf8f474fde503.png?size=256",
    initials: "SAV",
    role: "E-World Star Creator • Media Ambassador",
    subscribers: "Discord Role Verified",
    platform: "YouTube & Instagram",
    specialties: ["Cinematics", "SMP Megabuilds", "Community Events"],
    featuredQuote: "Verified creator holding active roles in the E-World Discord server.",
    verified: true,
    discordRoleId: ROLE_STAR_CREATORS_ID,
    bioLink: "https://youtube.com/@saviytts",
    links: {
      youtube: "https://youtube.com/@saviytts",
      instagram: "https://instagram.com/saviytts",
    },
  },
  {
    id: "814524882305548319",
    name: "DOT",
    username: "dotrender",
    tag: "@dotrender",
    category: "Star Creator",
    badge: "Star Creator",
    avatarGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
    avatarGlow: "rgba(245, 158, 11, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/avatars/814524882305548319/6b410b29e01f87450b2c7463a38a0708.png?size=256",
    initials: "DOT",
    role: "E-World Star Creator • Media Ambassador",
    subscribers: "Discord Role Verified",
    platform: "YouTube",
    specialties: ["FiveM Cinema", "4K Server Trailers", "SMP Lore"],
    featuredQuote: "Verified creator holding active roles in the E-World Discord server.",
    verified: true,
    discordRoleId: ROLE_STAR_CREATORS_ID,
    bioLink: "https://youtube.com/@dotrender",
    links: {
      youtube: "https://youtube.com/@dotrender",
    },
  },

  // ==========================================
  // CATEGORY 2: CONTENT CREATORS
  // ==========================================
  {
    id: "733767027830947930",
    name: "Sendy",
    username: "akthegamer_",
    tag: "@akthegamer_",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #2563eb 100%)",
    avatarGlow: "rgba(6, 182, 212, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/avatars/733767027830947930/a133e0fa50c01eefb0c7ef5da0fd5d8c.png?size=256",
    initials: "SEN",
    role: "E-World Content Creator • Broadcaster",
    subscribers: "Discord Role Verified",
    platform: "YouTube",
    specialties: ["Esports Highlights", "Tournament Casting"],
    featuredQuote: "Verified creator holding active roles in the E-World Discord server.",
    verified: true,
    discordRoleId: ROLE_CONTENT_CREATOR_ID,
    bioLink: "https://youtube.com/@akthegamer_",
    links: {
      youtube: "https://youtube.com/@akthegamer_",
    },
  },
  {
    id: "735057650588319804",
    name: "-DPI",
    username: "ggs11",
    tag: "@ggs11",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #2563eb 100%)",
    avatarGlow: "rgba(6, 182, 212, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/avatars/735057650588319804/9aebc8a31353dfe45665c3d067c79761.png?size=256",
    initials: "-DP",
    role: "E-World Content Creator • Broadcaster",
    subscribers: "Discord Role Verified",
    platform: "YouTube",
    specialties: ["Tactical Infiltration", "Competitive Aim"],
    featuredQuote: "Verified creator holding active roles in the E-World Discord server.",
    verified: true,
    discordRoleId: ROLE_CONTENT_CREATOR_ID,
    bioLink: "https://youtube.com/@ggs11",
    links: {
      youtube: "https://youtube.com/@ggs11",
    },
  },
  {
    id: "930857176447193118",
    name: "!Smmoky",
    username: "smmoky",
    tag: "@smmoky",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #2563eb 100%)",
    avatarGlow: "rgba(6, 182, 212, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/avatars/930857176447193118/58adebaf64129048039df460cf6404c4.png?size=256",
    initials: "!SM",
    role: "E-World Content Creator • Broadcaster",
    subscribers: "Discord Role Verified",
    platform: "YouTube",
    specialties: ["Hardcore Survival", "Speedrunning"],
    featuredQuote: "Verified creator holding active roles in the E-World Discord server.",
    verified: true,
    discordRoleId: ROLE_CONTENT_CREATOR_ID,
    bioLink: "https://youtube.com/@smmoky",
    links: {
      youtube: "https://youtube.com/@smmoky",
    },
  },
  {
    id: "1497480379106459749",
    name: "Vada Pav",
    username: "zclux.frr",
    tag: "@zclux.frr",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #2563eb 100%)",
    avatarGlow: "rgba(6, 182, 212, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/avatars/1497480379106459749/ddac8756f6bfc0572a889cd60a7ed2b7.png?size=256",
    initials: "VAD",
    role: "E-World Content Creator • Broadcaster",
    subscribers: "Discord Role Verified",
    platform: "YouTube",
    specialties: ["SMP Banter", "Voice Room Chaos"],
    featuredQuote: "Verified creator holding active roles in the E-World Discord server.",
    verified: true,
    discordRoleId: ROLE_CONTENT_CREATOR_ID,
    bioLink: "https://youtube.com/@zclux.frr",
    links: {
      youtube: "https://youtube.com/@zclux.frr",
    },
  },
  {
    id: "1374812205098340454",
    name: "Biggb Khan",
    username: "biggbsteel",
    tag: "@biggbsteel",
    category: "Content Creator",
    badge: "Content Creator",
    avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #2563eb 100%)",
    avatarGlow: "rgba(6, 182, 212, 0.45)",
    avatarUrl: "https://cdn.discordapp.com/avatars/1374812205098340454/c229e76f0b72b6b13c733e9479116b6c.png?size=256",
    initials: "BIG",
    role: "E-World Content Creator • Broadcaster",
    subscribers: "Discord Role Verified",
    platform: "YouTube",
    specialties: ["Roleplay Vanguard", "Underground Syndicates"],
    featuredQuote: "Verified creator holding active roles in the E-World Discord server.",
    verified: true,
    discordRoleId: ROLE_CONTENT_CREATOR_ID,
    bioLink: "https://youtube.com/@biggbsteel",
    links: {
      youtube: "https://youtube.com/@biggbsteel",
    },
  },
];
