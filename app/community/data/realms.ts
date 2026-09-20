export interface UniverseScene {
  index: string;
  id: string;
  category: string;
  title: string;
  subtitle: string;
  tagline: string;
  coordinates: string;
  stats: { status: string; access: string };
  description: string;
  features?: string[];
  rules?: string[];
  theme: "cyan" | "emerald" | "crimson" | "violet" | "gold";
}

export const universeScenes: UniverseScene[] = [
  {
    index: "01",
    id: "nexus",
    category: "E-WORLD PROTOCOL",
    title: "A WORLD BEYOND PLAY.",
    subtitle: "An independent universe for the next generation of players.",
    tagline: "PLAY • CONNECT • CREATE • COMPETE",
    coordinates: "0x00 // E-WORLD_ORIGIN",
    stats: { status: "IN DEVELOPMENT", access: "Announcements on Discord" },
    description:
      "The gravitational anchor of E-World. A unified digital civilization combining custom survival multiplayer, FiveM roleplay cinema, and sanctioned esports tournaments.",
    theme: "cyan",
  },
  {
    index: "02",
    id: "smp",
    category: "MINECRAFT JAVA 1.21",
    title: "E-WORLD SMP",
    subtitle: "Build • Explore • Survive",
    tagline: "CUSTOM SHADERS • EXPEDITION REALM",
    coordinates: "0x1A // SMP_VOXEL",
    stats: { status: "IN DEVELOPMENT", access: "Announcements on Discord" },
    description:
      "A survival world in development. Shape the terrain, build with friends, and explore plans for dungeon raids, player trading, and community adventures.",
    features: [
      "Custom Terrain Shaders",
      "Player Driven Economy",
      "End Boss Raids",
      "Anti-Grief Protection",
    ],
    theme: "emerald",
  },
  {
    index: "03",
    id: "rp",
    category: "FIVEM / GTA V",
    title: "E-WORLD RP",
    subtitle: "Live • Build • Become",
    tagline: "LOS SANTOS METROPOLIS • ROLEPLAY",
    coordinates: "0x2B // FIVEM_CITY",
    stats: { status: "IN DEVELOPMENT", access: "Announcements on Discord" },
    description:
      "A roleplay city in development. Create a character, choose a path, and discover plans for player businesses, emergency services, and stories written together.",
    features: [
      "Realistic Economy",
      "Custom Vehicle Handling",
      "Dedicated Police / EMS",
      "Luxury Real Estate",
    ],
    theme: "crimson",
  },
  {
    index: "04",
    id: "galaxy",
    category: "ECOSYSTEM TOPOLOGY",
    title: "COMMUNITY GALAXY",
    subtitle: "Orbital Constellation Network",
    tagline: "10 INTERCONNECTED SATELLITES",
    coordinates: "0x3C // GALAXY_MAP",
    stats: { status: "IN DEVELOPMENT", access: "Announcements on Discord" },
    description:
      "The interactive topological network connecting SMP, RP, Tournaments, Content Creators, Giveaways, and Governance into one harmonized ecosystem.",
    theme: "violet",
  },
  {
    index: "05",
    id: "esports",
    category: "COMPETITIVE OPERATIONS",
    title: "CODM CHAMPIONSHIP",
    subtitle: "Search & Destroy 5v5 Invitational",
    tagline: "COMPETITIVE GAMING • SCHEDULE TO BE ANNOUNCED",
    coordinates: "0x4D // ARENA_SND",
    stats: { status: "IN DEVELOPMENT", access: "Announcements on Discord" },
    description:
      "The premier competitive arena in E-World. Double-elimination brackets with anti-cheat enforcement and live broadcast casting on YouTube & Twitch.",
    rules: [
      "5v5 Search & Destroy",
      "Official Map Pool",
      "Anti-Cheat Required",
      "Live Broadcast Casting",
    ],
    theme: "gold",
  },
  {
    index: "06",
    id: "creators",
    category: "TALENT & MEDIA",
    title: "E-WORLD CREATORS",
    subtitle: "Star & Content Creators Network",
    tagline: "STORIES FROM OUR COMMUNITY",
    coordinates: "0x5E // CREATOR_HUB",
    stats: { status: "IN DEVELOPMENT", access: "Announcements on Discord" },
    description:
      "Partnered streamers, YouTube machinima artists, and top-tier competitors delivering high-fidelity stories and gameplay from across the E-World realms.",
    theme: "cyan",
  },
  {
    index: "07",
    id: "gateway",
    category: "COMMUNITY TERMINAL",
    title: "JOIN THE UNIVERSE",
    subtitle: "Enter E-World on Discord",
    tagline: "FIND YOUR PEOPLE",
    coordinates: "0x7E // GATEWAY_CORE",
    stats: { status: "IN DEVELOPMENT", access: "Announcements on Discord" },
    description:
      "Your passport to the digital universe. Verify your Discord citizen pass, claim roleplay visas, register for tournaments, and connect with fellow creators.",
    theme: "cyan",
  },
];
