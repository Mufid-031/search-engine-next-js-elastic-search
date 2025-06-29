import { client } from "@/lib/elastic-client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams.get("q");

  if (query == null)
    return NextResponse.json({ error: "No query provided" }, { status: 400 });

  const results = await client.search({
    index: "my-index",
    query: {
      multi_match: {
        query,
        fields: ["title", "description"],
      },
    },
  });

  return NextResponse.json(results, { status: 200 });
};
