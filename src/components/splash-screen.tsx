"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "./text-animations/CountUp/CountUp";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [done, setDone] = useState<boolean>(false);

  const handleComplete = () => {
    setTimeout(() => {
      setDone(true);
    }, 2200);

    setTimeout(() => {
      onFinish();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 bg-background text-white flex items-center justify-center z-[9999]"
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            borderRadius: "50%",
            opacity: 0,
            backgroundColor: "bg-muted",
            transitionEnd: { display: "none" },
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl font-bold">
            <CountUp
              from={0}
              to={100}
              duration={2}
              className="text-white"
              onEnd={handleComplete}
              separator="."
            />
            <span className="ml-2">%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
