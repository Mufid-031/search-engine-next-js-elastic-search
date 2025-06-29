/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { client } from "@/lib/elastic-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    const response = await client.cat.indices({
      format: "json",
      h: "index,docs.count,store.size,creation.date.string",
    });

    // Filter out system indices (those starting with .)
    const userIndices = response.filter(
      (index: any) => !index.index.startsWith(".")
    );

    return NextResponse.json({
      success: true,
      indices: userIndices,
    });
  } catch (error) {
    console.error("Error fetching indices:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch indices",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indexName = searchParams.get("index");

    if (!indexName) {
      return NextResponse.json(
        {
          success: false,
          error: "Index name is required",
        },
        { status: 400 }
      );
    }

    // Check if index exists
    const indexExists = await client.indices.exists({ index: indexName });

    if (!indexExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Index does not exist",
        },
        { status: 404 }
      );
    }

    // Delete the index
    await client.indices.delete({ index: indexName });

    return NextResponse.json({
      success: true,
      message: `Index "${indexName}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting index:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete index",
      },
      { status: 500 }
    );
  }
}
