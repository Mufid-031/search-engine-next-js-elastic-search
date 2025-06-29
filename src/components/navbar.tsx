"use client";

import type React from "react";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GithubIcon, Zap, Database, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  query?: string;
}

export default function Navbar({ query = "" }: NavbarProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState<string>("");

  const placeholders = [
    "Search your data...",
    "Find documents",
    "Query your indices",
    "Search anything",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimeout(() => {
      router.push(`/search?q=${searchInput}`);
    }, 500);
  };

  return (
    <nav className="flex justify-between p-6 w-full border-b">
      <div className="flex items-center gap-6">
        <Link
          href="/search"
          className="text-2xl font-bold flex items-center gap-2 min-w-fit"
        >
          <Zap fill="currentColor" className="text-blue-600" />
          Next Brave
        </Link>
        <div className="w-[500px]">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
            defaultValue={query}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/indices">
            <Database className="w-4 h-4 mr-2" />
            Indices
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Link>
        </Button>
        <GithubIcon className="w-6 h-6 text-gray-600 hover:text-foreground cursor-pointer" />
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
