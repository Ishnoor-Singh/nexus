"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CreateCharacterModal } from "@/components/create-character-modal";
import { HatchingScreen } from "@/components/hatching-screen";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [showCreate, setShowCreate] = useState(false);
  const [isHatching, setIsHatching] = useState(false);
  
  const characters = useQuery(
    api.characters.list,
    user ? { userId: user.id } : "skip"
  );
  
  const needsStarter = useQuery(
    api.starter.needsStarter,
    user ? { userId: user.id } : "skip"
  );
  
  const hatchStarter = useMutation(api.starter.hatchStarter);
  
  useEffect(() => {
    if (needsStarter && user && !isHatching) {
      setIsHatching(true);
    }
  }, [needsStarter, user]);
  
  const handleHatch = async () => {
    if (!user) return;
    await hatchStarter({ userId: user.id });
    setIsHatching(false);
  };
  
  if (isHatching && needsStarter) {
    return <HatchingScreen onHatch={handleHatch} />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[--muted-foreground]">Please sign in to continue</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient glow background */}
      <div className="glow-bg" />
      
      {/* Header */}
      <header className="glass-subtle sticky top-0 z-50 border-b border-[--border]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-pulse-glow transition-all">🪽</span>
            <span className="font-semibold text-lg">Saphira</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[--muted-foreground]">
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold">
              Your <span className="text-gradient">Familiars</span>
            </h1>
            <p className="text-[--muted-foreground] mt-1">
              {characters?.length || 0} companion{characters?.length !== 1 ? "s" : ""} at your side
            </p>
          </div>
          
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Familiar</span>
          </button>
        </div>

        {/* Characters Grid */}
        {characters === undefined ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-[--card] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-20 animate-slideUp">
            <div className="text-7xl mb-6 animate-float">🥚</div>
            <h2 className="text-2xl font-semibold mb-3">No familiars yet</h2>
            <p className="text-[--muted-foreground] mb-8 max-w-md mx-auto">
              Hatch your first AI companion and begin building a unique relationship
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary px-8 py-3 rounded-xl text-lg"
            >
              Hatch Your First Familiar
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {characters.map((char, i) => (
              <Link
                key={char._id}
                href={`/chat/${char._id}`}
                className={`group relative p-6 rounded-2xl bg-[--card] border border-[--border] 
                  hover:border-[--border-hover] transition-all duration-300 hover:-translate-y-1
                  animate-slideUp stagger-${Math.min(i + 1, 4)}`}
                style={{ animationFillMode: 'both' }}
              >
                {/* Hover glow */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{ 
                    background: `radial-gradient(ellipse at center, ${char.color}15, transparent 70%)`,
                  }}
                />
                
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                      group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      backgroundColor: char.color + "20",
                      boxShadow: `0 8px 32px ${char.color}20`
                    }}
                  >
                    {char.emoji}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[--muted-foreground] 
                    group-hover:text-[--foreground] transition-colors">
                    <span>Chat</span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="font-semibold text-xl mb-2 group-hover:text-gradient transition-all">
                  {char.name}
                </h3>
                <p className="text-sm text-[--muted-foreground] line-clamp-2 leading-relaxed">
                  {char.soul.personality.slice(0, 100)}...
                </p>
                
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {char.soul.traits.slice(0, 3).map((trait) => (
                    <span 
                      key={trait}
                      className="text-xs px-2.5 py-1 rounded-full border border-[--border]
                        text-[--muted-foreground] group-hover:border-[--border-hover] transition-colors"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                
                {/* Archetype badge */}
                {char.archetype && (
                  <div className="mt-4 pt-4 border-t border-[--border] flex items-center gap-2 text-xs text-[--muted-foreground]">
                    <span>
                      {char.archetype === 'companion' && '🐉'}
                      {char.archetype === 'journal' && '📓'}
                      {char.archetype === 'accountability' && '🎯'}
                      {char.archetype === 'thinking' && '🧠'}
                    </span>
                    <span className="capitalize">{char.archetype}</span>
                  </div>
                )}
              </Link>
            ))}
            
            {/* Add new card */}
            <button
              onClick={() => setShowCreate(true)}
              className="group p-6 rounded-2xl border-2 border-dashed border-[--border] 
                hover:border-[--primary] transition-all duration-300 flex flex-col items-center 
                justify-center min-h-[200px] hover:bg-[--primary]/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-[--muted] flex items-center justify-center
                group-hover:bg-[--primary]/20 transition-colors mb-4">
                <svg className="w-8 h-8 text-[--muted-foreground] group-hover:text-[--primary] transition-colors" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[--muted-foreground] group-hover:text-[--foreground] font-medium transition-colors">
                Hatch New Familiar
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreate && (
        <CreateCharacterModal
          userId={user.id}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
