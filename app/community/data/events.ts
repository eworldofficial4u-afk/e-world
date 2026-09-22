export interface CommunityEvent {
  id: string;
  title: string;
  subtitle: string;
  category: "tournament" | "upcoming";
  categoryLabel: string;
  date: string;
  time: string;
  prizePool: string;
  slots: string;
  status: "COMPLETED" | "UPCOMING" | "REGISTRATIONS_OPEN";
  featured: boolean;
  startsAt: string;
  bannerTheme: "neon-cyan" | "gold" | "crimson";
  description: string;
  rules: string[];
  finaleDetails?: {
    matchup: string;
    teamA: string;
    teamB: string;
    winner: string;
    winningPrize: string;
    normalRounds: number;
    finaleRounds: number;
  };
}

export const upcomingEvents: CommunityEvent[] = [
  {
    id: "cod-snd-tournament-01",
    title: "COD SEARCH & DESTROY // INAUGURAL TOURNAMENT",
    subtitle: "Grand Finale: Pain and Daggers vs Demon Slayers",
    category: "tournament",
    categoryLabel: "COD S&D Championship",
    date: "Concluded",
    time: "Official Final Match",
    prizePool: "₹2,500 INR (Winning Team Cash Prize)",
    slots: "Closed • Winner Decided",
    status: "COMPLETED",
    featured: true,
    startsAt: "2026-09-01T18:00:00Z",
    bannerTheme: "gold",
    description:
      "The premiere Call of Duty Search & Destroy Tournament. After intense qualifying brackets, Demon Slayers clashed against Pain and Daggers in a high-octane 10-round Grand Finale to claim the championship title and ₹2,500 INR cash prize.",
    rules: [
      "Game Mode: Search & Destroy (COD)",
      "Normal Bracket Rounds: First to 7 Rounds",
      "Grand Finale Decider: 10 Rounds",
      "Grand Champions: Demon Slayers (₹2,500 INR awarded)",
      "Runner-up: Pain and Daggers",
    ],
    finaleDetails: {
      matchup: "Pain and Daggers vs Demon Slayers",
      teamA: "Pain and Daggers",
      teamB: "Demon Slayers",
      winner: "Demon Slayers",
      winningPrize: "₹2,500 INR",
      normalRounds: 7,
      finaleRounds: 10,
    },
  },
  {
    id: "cod-snd-season-02",
    title: "COD SEARCH & DESTROY // TOURNAMENT 02",
    subtitle: "Season 02 • Open Registrations Coming Soon",
    category: "upcoming",
    categoryLabel: "Next Major Operation",
    date: "Season 02",
    time: "To Be Announced",
    prizePool: "Cash Prize Pool + Discord Champion Roles",
    slots: "Registrations Opening Soon",
    status: "UPCOMING",
    featured: false,
    startsAt: "2026-10-01T18:00:00Z",
    bannerTheme: "neon-cyan",
    description:
      "Following the thrilling inaugural COD S&D tournament, preparations for Tournament 02 are underway. Assemble your 5v5 squad and prepare for battle.",
    rules: [
      "5v5 Search & Destroy",
      "Regular Bracket: First to 7 Rounds",
      "Grand Finale: 10 Rounds",
      "Official E-World Anti-Cheat verification required",
    ],
  },
];
