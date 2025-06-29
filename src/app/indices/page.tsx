/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Database,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Search,
  Upload,
} from "lucide-react";
import Link from "next/link";

interface ElasticsearchIndex {
  index: string;
  "docs.count": string;
  "store.size": string;
  "creation.date.string": string;
}

export default function IndicesPage() {
  const [indices, setIndices] = useState<ElasticsearchIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<string | null>(null);

  const fetchIndices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/indices");
      const data = await response.json();

      if (data.success) {
        setIndices(data.indices);
      } else {
        setError(data.error || "Failed to fetch indices");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const deleteIndex = async (indexName: string) => {
    try {
      setDeletingIndex(indexName);
      const response = await fetch(`/api/indices?index=${indexName}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setIndices(indices.filter((index) => index.index !== indexName));
      } else {
        setError(data.error || "Failed to delete index");
      }
    } catch (err) {
      setError("Failed to delete index");
    } finally {
      setDeletingIndex(null);
    }
  };

  useEffect(() => {
    fetchIndices();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Index Management
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Elasticsearch Indices</h2>
            <p className="text-muted-foreground">
              Manage your indexed data and search indices
            </p>
          </div>
          <Button onClick={fetchIndices} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading indices...
          </div>
        )}

        {/* Indices Grid */}
        {!loading && indices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indices.map((index) => (
              <Card
                key={index.index}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{index.index}</CardTitle>
                      <CardDescription>
                        Created: {index["creation.date.string"] || "Unknown"}
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                          disabled={deletingIndex === index.index}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Index</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the index &quot;
                            {index.index}&quot;? This action cannot be undone and all
                            data in this index will be permanently lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteIndex(index.index)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {index["docs.count"] || "0"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Documents
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {index["store.size"] || "0b"}
                      </div>
                      <div className="text-sm text-muted-foreground">Size</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/search?index=${index.index}`}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && indices.length === 0 && !error && (
          <Card className="text-center py-12">
            <CardContent>
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Indices Found</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any search indices yet. Upload a CSV file to
                get started.
              </p>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Dataset
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
