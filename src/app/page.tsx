"use client";

import Threads from "@/components/backgrounds/Threads/Threads";
import { SpinningText } from "@/components/magicui/spinning-text";
import SplashScreen from "@/components/splash-screen";
import BlurText from "@/components/text-animations/BlurText/BlurText";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useState } from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showMain, setShowMain] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const router = useRouter();

  const placeholders = [
    "Anime",
    "Games",
    "Music",
    "Movies",
    "TV Shows",
    "Books",
    "Games",
    "Movies",
    "TV Shows",
    "Books",
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
    <>
      {!showMain && <SplashScreen onFinish={() => setShowMain(true)} />}
      {showMain && (
        <div className="w-full h-screen relative">
          <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
          <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] flex flex-col items-center">
            <BlurText
              text="Next Brave"
              delay={150}
              animateBy="letters"
              direction="top"
              className="text-5xl mb-8 font-bold"
            />
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
          </main>
          <div className="absolute bottom-40 left-40">
            <div className="relative">
              <SpinningText>ahmad • mufid • risqi •</SpinningText>
              <Zap
                fill="white"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
