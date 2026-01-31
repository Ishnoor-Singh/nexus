"use client";

import { useState } from "react";

interface Props {
  onHatch: () => Promise<void>;
}

export function HatchingScreen({ onHatch }: Props) {
  const [stage, setStage] = useState<"intro" | "hatching" | "hatched">("intro");
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (stage === "intro") {
      setStage("hatching");
      setIsLoading(true);
      
      // Small delay for dramatic effect
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await onHatch();
      setStage("hatched");
      setIsLoading(false);
      
      // Auto-dismiss after showing hatched state
      setTimeout(() => {
        // The parent component will handle the redirect
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center space-y-8 p-8 max-w-md">
        {stage === "intro" && (
          <>
            <div className="text-8xl animate-pulse">🥚</div>
            <h1 className="text-3xl font-bold">Welcome, new companion!</h1>
            <p className="text-gray-400 text-lg">
              A mysterious egg awaits you. Something inside stirs with anticipation...
            </p>
            <button
              onClick={handleClick}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-500 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
            >
              Touch the egg...
            </button>
          </>
        )}

        {stage === "hatching" && (
          <>
            <div className="text-8xl animate-bounce">🥚</div>
            <div className="space-y-2">
              <p className="text-xl text-orange-400 animate-pulse">
                Crack... crack...
              </p>
              <p className="text-gray-400">Something is emerging!</p>
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          </>
        )}

        {stage === "hatched" && (
          <>
            <div className="text-8xl animate-bounce">🐉</div>
            <h1 className="text-3xl font-bold text-orange-400">
              Ember has hatched!
            </h1>
            <p className="text-gray-300 text-lg">
              Your dragon familiar blinks at you with curious eyes, ready to begin your journey together.
            </p>
            <p className="text-gray-500 text-sm animate-pulse">
              Taking you to meet your new companion...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
