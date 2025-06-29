/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { client } from "@/lib/elastic-client";
import { type NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const index = searchParams.get("index") || "_all";
    const from = Number.parseInt(searchParams.get("from") || "0");
    const size = Number.parseInt(searchParams.get("size") || "10");

    if (!query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required",
        },
        { status: 400 }
      );
    }

    // Check if Elasticsearch is available
    try {
      await client.ping();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to connect to Elasticsearch",
        },
        { status: 500 }
      );
    }

    const searchBody = {
      query: {
        multi_match: {
          query: query,
          type: "best_fields",
          fields: ["*"],
          fuzziness: "AUTO",
        },
      },
      highlight: {
        fields: {
          "*": {},
        },
        pre_tags: ["<mark>"],
        post_tags: ["</mark>"],
      },
      from,
      size,
    };

    const response = await client.search({
      index: index === "_all" ? undefined : index,
      body: searchBody,
    });

    const results = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      index: hit._index,
      score: hit._score,
      source: hit._source,
      highlight: hit.highlight,
    }));

    return NextResponse.json({
      success: true,
      results,
      total: response.hits.total,
      took: response.took,
      query,
      from,
      size,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 }
    );
  }
}
