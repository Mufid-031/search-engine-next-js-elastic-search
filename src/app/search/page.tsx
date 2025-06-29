"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  GithubIcon,
  Zap,
  Clock,
  Globe,
  ImageIcon,
  Video,
  NewspaperIcon as News,
  MapPin,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Mock data
const searchResults = {
  web: [
    {
      id: 1,
      title: "Anime - Complete Guide to Japanese Animation",
      url: "https://anime-guide.com",
      description:
        "Discover the world of anime with our comprehensive guide covering popular series, genres, and recommendations for beginners and veterans alike.",
      timestamp: "2 hours ago",
      favicon: "/placeholder.svg?height=16&width=16",
    },
    {
      id: 2,
      title: "Top 10 Anime Series of 2024 - Must Watch List",
      url: "https://animereviews.net",
      description:
        "Explore the best anime series released in 2024, featuring detailed reviews, ratings, and where to watch them online.",
      timestamp: "5 hours ago",
      favicon: "/placeholder.svg?height=16&width=16",
    },
    {
      id: 3,
      title: "Anime Streaming Platforms Comparison",
      url: "https://streamingguide.com/anime",
      description:
        "Compare the best anime streaming services including Crunchyroll, Funimation, and Netflix to find your perfect viewing platform.",
      timestamp: "1 day ago",
      favicon: "/placeholder.svg?height=16&width=16",
    },
    {
      id: 4,
      title: "Anime Art Styles Through the Decades",
      url: "https://animeart.org",
      description:
        "A visual journey through the evolution of anime art styles from the 1960s to present day, showcasing iconic series and their artistic influence.",
      timestamp: "2 days ago",
      favicon: "/placeholder.svg?height=16&width=16",
    },
  ],
  images: [
    {
      id: 1,
      src: "/placeholder.svg?height=200&width=300",
      alt: "Anime character art",
      source: "pixiv.net",
    },
    {
      id: 2,
      src: "/placeholder.svg?height=200&width=300",
      alt: "Studio Ghibli scene",
      source: "ghibli.jp",
    },
    {
      id: 3,
      src: "/placeholder.svg?height=200&width=300",
      alt: "Manga panel",
      source: "mangaplus.com",
    },
    {
      id: 4,
      src: "/placeholder.svg?height=200&width=300",
      alt: "Anime poster",
      source: "crunchyroll.com",
    },
    {
      id: 5,
      src: "/placeholder.svg?height=200&width=300",
      alt: "Character design",
      source: "artstation.com",
    },
    {
      id: 6,
      src: "/placeholder.svg?height=200&width=300",
      alt: "Anime wallpaper",
      source: "wallhaven.cc",
    },
  ],
  videos: [
    {
      id: 1,
      title: "Top 10 Anime of All Time",
      channel: "AnimeZone",
      duration: "15:32",
      views: "2.3M views",
      timestamp: "3 days ago",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 2,
      title: "Anime Explained: Understanding Japanese Culture",
      channel: "CultureCast",
      duration: "22:15",
      views: "890K views",
      timestamp: "1 week ago",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 3,
      title: "How Anime is Made: Behind the Scenes",
      channel: "StudioInsights",
      duration: "18:45",
      views: "1.5M views",
      timestamp: "2 weeks ago",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
  ],
  news: [
    {
      id: 1,
      title: "New Anime Series Announced for Spring 2024",
      source: "Anime News Network",
      timestamp: "4 hours ago",
      category: "Entertainment",
    },
    {
      id: 2,
      title: "Studio Ghibli Opens New Theme Park Section",
      source: "Japan Times",
      timestamp: "1 day ago",
      category: "Travel",
    },
    {
      id: 3,
      title: "Anime Industry Revenue Reaches Record High",
      source: "Variety",
      timestamp: "3 days ago",
      category: "Business",
    },
  ],
};

const searchStats = {
  totalResults: "About 45,600,000 results",
  searchTime: "0.42 seconds",
};

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "anime";
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All", icon: Globe },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "videos", label: "Videos", icon: Video },
    { id: "news", label: "News", icon: News },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar query={query} />

      <div className="max-w-6xl mx-auto px-6">
        {/* Search Stats */}
        <div className="py-4 text-sm text-gray-600">
          {searchStats.totalResults} ({searchStats.searchTime})
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
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 w-full h-[1px] bg-white"
                    layoutId="underline"
                  />
                )}
              </Button>
            );
          })}
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          {/* Web Results */}
          {(activeTab === "all" || activeTab === "web") && (
            <div className="space-y-6">
              {searchResults.web.map((result) => (
                <div key={result.id} className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={result.favicon || "/placeholder.svg"}
                      alt="gambar"
                      className="w-4 h-4"
                      width={16}
                      height={16}
                    />
                    <span className="text-sm text-gray-600">{result.url}</span>
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp}
                    </span>
                  </div>
                  <h3 className="text-xl text-blue-300 hover:underline cursor-pointer mb-1">
                    {result.title}
                  </h3>
                  <p className="text-foreground text-sm leading-relaxed">
                    {result.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Images */}
          {(activeTab === "all" || activeTab === "images") && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {searchResults.images.map((image) => (
                  <div key={image.id} className="group cursor-pointer">
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        width={300}
                        height={300}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {image.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {(activeTab === "all" || activeTab === "videos") && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Videos
              </h2>
              <div className="space-y-4">
                {searchResults.videos.map((video) => (
                  <Card
                    key={video.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative">
                          <Image
                            src={video.thumbnail || "/placeholder.svg"}
                            alt={video.title}
                            className="w-48 h-28 object-cover rounded"
                            width={300}
                            height={300}
                          />
                          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
                            {video.duration}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-300 hover:underline mb-1">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {video.channel}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{video.views}</span>
                            <span>•</span>
                            <span>{video.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* News */}
          {(activeTab === "all" || activeTab === "news") && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <News className="w-5 h-5" />
                News
              </h2>
              <div className="space-y-4">
                {searchResults.news.map((article) => (
                  <div
                    key={article.id}
                    className="border-l-4 border-blue-300 pl-4"
                  >
                    <h3 className="font-semibold text-blue-300 hover:underline cursor-pointer mb-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{article.timestamp}</span>
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Searches */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Related searches</h2>
            <div className="flex flex-wrap gap-2">
              {[
                "best anime 2024",
                "anime streaming sites",
                "manga vs anime",
                "studio ghibli movies",
                "anime conventions",
                "japanese animation history",
                "anime art style",
                "popular anime characters",
              ].map((term) => (
                <Badge
                  key={term}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted px-3 py-1"
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>
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
