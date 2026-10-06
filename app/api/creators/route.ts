import { NextResponse } from "next/server";
import {
  creators as baseCreators,
  Creator,
  ROLE_STAR_CREATORS_ID,
  ROLE_CONTENT_CREATOR_ID,
} from "../../community/data/creators";

export const dynamic = "force-dynamic";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// In-memory cache for live Discord user profiles
interface CacheEntry {
  timestamp: number;
  data: Creator[];
}

let cachedCreators: CacheEntry | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds TTL for fresh PFPs

async function fetchLiveDiscordProfile(id: string): Promise<{
  avatarUrl?: string;
  avatarDecorationUrl?: string;
  username?: string;
  globalName?: string;
  clanTag?: string;
  bannerColor?: string;
} | null> {
  if (!BOT_TOKEN) return null;
  try {
    const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(3500),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const user = await res.json();
    if (!user || !user.id) return null;

    let avatarUrl: string | undefined;
    if (user.avatar) {
      const ext = user.avatar.startsWith("a_") ? "gif" : "png";
      avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
    } else {
      const defaultIndex = (parseInt(user.id.slice(-4), 10) || 0) % 6;
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    }

    let avatarDecorationUrl: string | undefined;
    if (user.avatar_decoration_data?.asset) {
      avatarDecorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=240&passthrough=true`;
    }

    const clanTag = user.clan?.tag || user.primary_guild?.tag || undefined;
    const bannerColor = user.banner_color || undefined;

    return {
      avatarUrl,
      avatarDecorationUrl,
      username: user.username,
      globalName: user.global_name || user.username,
      clanTag,
      bannerColor,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();

  if (cachedCreators && now - cachedCreators.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        roles: {
          starCreatorId: ROLE_STAR_CREATORS_ID,
          contentCreatorId: ROLE_CONTENT_CREATOR_ID,
        },
        count: cachedCreators.data.length,
        creators: cachedCreators.data,
        cachedAt: cachedCreators.timestamp,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }

  try {
    // Enrich each creator with live Discord PFP and data
    const enrichedCreators = await Promise.all(
      baseCreators.map(async (creator) => {
        const liveProfile = await fetchLiveDiscordProfile(creator.id);
        if (!liveProfile) return creator;

        return {
          ...creator,
          avatarUrl: liveProfile.avatarUrl || creator.avatarUrl,
          avatarDecorationUrl: liveProfile.avatarDecorationUrl || creator.avatarDecorationUrl,
          tag: liveProfile.username ? `@${liveProfile.username}` : creator.tag,
          username: liveProfile.username || creator.username,
          globalName: liveProfile.globalName || creator.globalName,
          clanTag: liveProfile.clanTag || creator.clanTag,
          bannerColor: liveProfile.bannerColor || creator.bannerColor,
        };
      })
    );

    cachedCreators = {
      timestamp: now,
      data: enrichedCreators,
    };

    return NextResponse.json(
      {
        roles: {
          starCreatorId: ROLE_STAR_CREATORS_ID,
          contentCreatorId: ROLE_CONTENT_CREATOR_ID,
        },
        count: enrichedCreators.length,
        creators: enrichedCreators,
        cachedAt: now,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.warn("[Creators API] Fallback to base roster:", err.message);
    return NextResponse.json(
      {
        roles: {
          starCreatorId: ROLE_STAR_CREATORS_ID,
          contentCreatorId: ROLE_CONTENT_CREATOR_ID,
        },
        count: baseCreators.length,
        creators: baseCreators,
      },
      {
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}
