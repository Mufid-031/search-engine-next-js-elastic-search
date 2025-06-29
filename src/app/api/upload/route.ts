/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "@/lib/elastic-client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const indexName = formData.get("indexName") as string;
    const indexDescription = formData.get("indexDescription") as string;

    if (!file || !indexName) {
      return NextResponse.json(
        {
          success: false,
          error: "File and index name are required",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only CSV files are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File size must be less than 100MB",
        },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const csvText = await file.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV file must contain at least a header row and one data row",
        },
        { status: 400 }
      );
    }

    // Parse CSV headers
    const headers = lines[0]
      .split(",")
      .map((header) => header.trim().replace(/"/g, ""));

    // Validate headers
    if (headers.length === 0 || headers.some((header) => !header)) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV file must have valid column headers",
        },
        { status: 400 }
      );
    }

    // Parse CSV data
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((value) => value.trim().replace(/"/g, ""));
      if (values.length === headers.length) {
        const record: any = { id: `${indexName}_${i}` };
        headers.forEach((header, index) => {
          record[header] = values[index] || "";
        });
        records.push(record);
      }
    }

    if (records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid records found in CSV file",
        },
        { status: 400 }
      );
    }

    // Validate index name
    const indexNameRegex = /^[a-z0-9][a-z0-9_-]*$/;
    if (!indexNameRegex.test(indexName)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Index name must contain only lowercase letters, numbers, hyphens, and underscores",
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
          error:
            "Unable to connect to Elasticsearch. Please check your configuration.",
        },
        { status: 500 }
      );
    }

    // Create index with mapping
    const indexExists = await client.indices.exists({ index: indexName });

    if (!indexExists) {
      // Create dynamic mapping based on CSV headers
      const properties: any = {};
      headers.forEach((header) => {
        properties[header] = {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
              ignore_above: 256,
            },
          },
        };
      });

      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                default: {
                  type: "standard",
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: "keyword" },
              indexed_at: { type: "date" },
              file_name: { type: "keyword" },
              file_size: { type: "long" },
              description: { type: "text" },
              ...properties,
            },
          },
        },
      });
    }

    // Bulk index documents
    const body = [];
    for (const record of records) {
      body.push({
        index: {
          _index: indexName,
          _id: record.id,
        },
      });
      body.push({
        ...record,
        indexed_at: new Date().toISOString(),
        file_name: file.name,
        file_size: file.size,
        description: indexDescription || "",
      });
    }

    const bulkResponse = await client.bulk({
      refresh: true,
      body,
    });

    // Check for errors
    let errorCount = 0;
    if (bulkResponse.errors) {
      const erroredDocuments = bulkResponse.items.filter((item: any) => {
        return item.index && item.index.error;
      });
      errorCount = erroredDocuments.length;

      if (errorCount > 0) {
        console.error("Bulk indexing errors:", erroredDocuments);
      }
    }

    const successCount = records.length - errorCount;

    return NextResponse.json({
      success: true,
      message: `Successfully indexed ${successCount} records to index "${indexName}"${
        errorCount > 0 ? `. ${errorCount} records failed to index.` : ""
      }`,
      indexName,
      totalRecords: records.length,
      processedRecords: successCount,
      errorCount,
      headers,
    });
  } catch (error) {
    console.error("Error indexing CSV:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
