"use client";

import { useState, useEffect } from "react";

interface Props {
  onHatch: () => Promise<void>;
}

export function HatchingScreen({ onHatch }: Props) {
  const [stage, setStage] = useState<"intro" | "touching" | "hatching" | "hatched">("intro");
  const [wobble, setWobble] = useState(false);

  // Egg wobble animation
  useEffect(() => {
    if (stage === "intro") {
      const interval = setInterval(() => {
        setWobble(true);
        setTimeout(() => setWobble(false), 500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleClick = async () => {
    if (stage === "intro") {
      setStage("touching");
      
      // Suspenseful pause
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStage("hatching");
      
      // Hatching animation
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      await onHatch();
      setStage("hatched");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Magical background */}
      <div className="glow-bg" />
      
      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none">
        {stage === "hatching" && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                ✨
              </div>
            ))}
          </>
        )}
        {stage === "hatched" && (
          <>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                {["✨", "💜", "⭐", "🌟"][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="text-center space-y-8 p-8 max-w-md relative z-10">
        {stage === "intro" && (
          <div className="animate-fadeIn">
            <div 
              className={`text-[120px] md:text-[150px] cursor-pointer transition-transform duration-300
                ${wobble ? 'animate-wiggle' : ''} hover:scale-105`}
              onClick={handleClick}
              style={{ filter: 'drop-shadow(0 20px 60px rgba(251, 146, 60, 0.4))' }}
            >
              🥚
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4">
              Something stirs within...
            </h1>
            <p className="text-[--muted-foreground] text-lg mb-8">
              A mysterious egg pulses with warmth. It seems to be waiting for your touch.
            </p>
            <button
              onClick={handleClick}
              className="btn-primary px-10 py-4 rounded-2xl font-semibold text-lg group"
            >
              <span className="flex items-center gap-2">
                Touch the egg
                <span className="group-hover:translate-x-1 transition-transform">👆</span>
              </span>
            </button>
          </div>
        )}

        {stage === "touching" && (
          <div className="animate-fadeIn">
            <div 
              className="text-[120px] md:text-[150px] animate-pulse"
              style={{ filter: 'drop-shadow(0 20px 60px rgba(251, 146, 60, 0.6))' }}
            >
              🥚
            </div>
            <p className="text-2xl text-[--secondary] mt-8 animate-pulse">
              The egg trembles...
            </p>
          </div>
        )}

        {stage === "hatching" && (
          <div className="animate-fadeIn">
            <div 
              className="text-[120px] md:text-[150px] animate-bounce"
              style={{ filter: 'drop-shadow(0 30px 80px rgba(139, 92, 246, 0.5))' }}
            >
              🥚
            </div>
            <div className="space-y-3 mt-8">
              <p className="text-3xl font-bold text-gradient animate-pulse">
                Crack... crack...
              </p>
              <p className="text-[--muted-foreground] text-lg">Something is emerging!</p>
            </div>
            <div className="flex justify-center gap-3 mt-8">
              <div className="w-4 h-4 bg-[--primary] rounded-full animate-bounce" />
              <div className="w-4 h-4 bg-[--primary] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-4 h-4 bg-[--primary] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        {stage === "hatched" && (
          <div className="animate-slideUp">
            <div 
              className="text-[120px] md:text-[150px]"
              style={{ 
                filter: 'drop-shadow(0 30px 80px rgba(251, 146, 60, 0.5))',
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              🐉
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mt-8 mb-4">
              <span className="text-gradient-warm">Ember</span> has hatched!
            </h1>
            <p className="text-[--muted-foreground] text-lg mb-6">
              Your dragon familiar blinks at you with curious, glowing eyes. 
              A new journey begins...
            </p>
            <div className="flex items-center justify-center gap-2 text-[--muted-foreground] animate-pulse">
              <div className="w-2 h-2 bg-[--primary] rounded-full animate-ping" />
              <span>Preparing your first meeting...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS for wiggle animation */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
