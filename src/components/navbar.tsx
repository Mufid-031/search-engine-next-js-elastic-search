import { GithubIcon, Zap } from "lucide-react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Navbar({ query }: { query: string }) {
  const placeholders = [
    "Anime",
    "Games",
    "Music",
    "Movies",
    "TV Shows",
    "Books",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <nav className="flex justify-between p-6 w-full border-b">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 min-w-fit">
          <Zap fill="currentColor" className="text-blue-300" />
          Next Brave
        </h1>
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
        <GithubIcon className="w-6 h-6 hover:text-foreground cursor-pointer" />
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
