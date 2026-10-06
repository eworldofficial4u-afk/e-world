import { NextResponse } from "next/server";
import { creators, ROLE_STAR_CREATORS_ID, ROLE_CONTENT_CREATOR_ID } from "../../community/data/creators";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      roles: {
        starCreatorId: ROLE_STAR_CREATORS_ID,
        contentCreatorId: ROLE_CONTENT_CREATOR_ID,
      },
      count: creators.length,
      creators,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
