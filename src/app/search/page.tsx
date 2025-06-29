/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  ImageIcon,
  Video,
  NewspaperIcon as News,
  MapPin,
  Loader2,
  AlertCircle,
  SearchIcon,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import SearchPagination from "@/components/search-engine-pagination";

interface SearchResult {
  id: string;
  index: string;
  score: number;
  source: Record<string, any>;
  highlight?: Record<string, string[]>;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: any;
  took: number;
  query: string;
  from: number;
  size: number;
  error?: string;
}

const RESULTS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function Search() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const selectedIndex = searchParams.get("index") || "_all";
  const currentPage = Number.parseInt(searchParams.get("page") || "1");
  const resultsPerPage = Number.parseInt(searchParams.get("size") || "10");

  const [activeTab, setActiveTab] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  const tabs = [
    { id: "all", label: "All", icon: Globe },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "videos", label: "Videos", icon: Video },
    { id: "news", label: "News", icon: News },
  ];

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const fetchSearchResults = async (
    searchQuery: string,
    page = 1,
    size = 10
  ) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const from = (page - 1) * size;
      const params = new URLSearchParams({
        q: searchQuery,
        index: selectedIndex,
        from: from.toString(),
        size: size.toString(),
      });

      const response = await fetch(`/api/search?${params}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setSearchResults(data.results);
        const totalCount =
          typeof data.total === "object" ? data.total.value : data.total;
        setTotalResults(totalCount);
        setSearchTime(data.took);
      } else {
        setError(data.error || "Search failed");
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      setError("Failed to connect to search service");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchSearchResults(query, page, resultsPerPage);
  };

  const handleResultsPerPageChange = (newSize: string) => {
    const size = Number.parseInt(newSize);
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", size.toString());
    params.delete("page"); // Reset to first page when changing page size
    router.push(`/search?${params.toString()}`);
    fetchSearchResults(query, 1, size);
  };

  useEffect(() => {
    if (query) {
      fetchSearchResults(query, currentPage, resultsPerPage);
    }
  }, [query, selectedIndex, currentPage, resultsPerPage]);

  const renderHighlightedText = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) {
      return text;
    }

    // Use the first highlight if available
    const highlightedText = highlights[0];
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const formatResultTitle = (result: SearchResult) => {
    const source = result.source;
    // Try common title fields
    const title =
      source.title ||
      source.name ||
      source.subject ||
      source.headline ||
      `Document ${result.id}`;
    return renderHighlightedText(title, result.highlight?.title);
  };

  const formatResultDescription = (result: SearchResult) => {
    const source = result.source;
    // Try common description fields
    const description =
      source.description ||
      source.content ||
      source.body ||
      source.summary ||
      "";
    const truncated =
      description.length > 200
        ? description.substring(0, 200) + "..."
        : description;
    return renderHighlightedText(
      truncated,
      result.highlight?.description || result.highlight?.content
    );
  };

  const formatResultUrl = (result: SearchResult) => {
    const source = result.source;
    return source.url || source.link || `${result.index}/${result.id}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar query={query} />

      <div className="max-w-6xl mx-auto px-6">
        {/* Search Stats and Controls */}
        <div className="py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            ) : (
              <>
                <span>About {totalResults.toLocaleString()} results</span>
                <span>({(searchTime / 1000).toFixed(2)} seconds)</span>
                {selectedIndex !== "_all" && (
                  <Badge variant="secondary">Index: {selectedIndex}</Badge>
                )}
              </>
            )}
          </div>

          {/* Results per page selector */}
          {!loading && totalResults > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Results per page:
              </span>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={handleResultsPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULTS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Search Tabs */}
        <div className="flex gap-6 mb-6 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className="relative"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 w-full h-[2px] bg-blue-600"
                    layoutId="underline"
                  />
                )}
              </Button>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && query && searchResults.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <div className="space-y-6">
            {/* All Results */}
            {activeTab === "all" && (
              <div className="space-y-6">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.index}-${result.id}`}
                    className="max-w-4xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {result.index.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatResultUrl(result)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {result.index}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Score: {result.score.toFixed(2)}
                      </span>
                    </div>
                    <h3 className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                      {formatResultTitle(result)}
                    </h3>
                    <p className="text-foreground text-sm leading-relaxed">
                      {formatResultDescription(result)}
                    </p>

                    {/* Show additional fields */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(result.source)
                        .filter(
                          ([key, value]) =>
                            ![
                              "title",
                              "description",
                              "content",
                              "body",
                              "url",
                              "link",
                              "id",
                              "indexed_at",
                              "file_name",
                              "file_size",
                            ].includes(key) &&
                            value &&
                            typeof value === "string" &&
                            value.length < 50
                        )
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-xs"
                          >
                            {key}: {value}
                          </Badge>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Filtered Results by Type */}
            {activeTab !== "all" && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Content filtering by type is not yet implemented for indexed
                  data. All results are shown in the &quot;All&quot; tab.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalResults={totalResults}
                  resultsPerPage={resultsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* No Query State */}
        {!query && (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a search query to find documents in your indexed data
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Indonesia</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-foreground">
                About
              </a>
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
              <a href="#" className="hover:text-foreground">
                Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
