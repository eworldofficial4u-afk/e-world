export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: "founder" | "management" | "development" | "moderation";
  discordTag: string;
  bio: string;
  avatarColor: string;
  badge: string;
  image?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "khan",
    name: "KHAN",
    role: "Owner",
    category: "founder",
    discordTag: "khan",
    bio: "Owner and Executive Director of the E-World ecosystem. Oversees community governance, cross-realm infrastructure, and strategic expansion across Minecraft SMP, FiveM Roleplay, and the global collective.",
    avatarColor: "linear-gradient(135deg, #00f5ff, #3b82f6)",
    badge: "OWNER",
    image: "/images/community/khan.jpg",
  },
];
