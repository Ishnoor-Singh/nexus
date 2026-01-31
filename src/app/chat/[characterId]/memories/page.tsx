"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const typeEmoji: Record<string, string> = {
  fact: "📝",
  preference: "💜",
  event: "📅",
  reflection: "💭",
  goal_progress: "🎯",
};

const typeLabel: Record<string, string> = {
  fact: "Fact",
  preference: "Preference", 
  event: "Event",
  reflection: "Reflection",
  goal_progress: "Goal Progress",
};

export default function MemoriesPage() {
  const { characterId } = useParams();
  const [filter, setFilter] = useState<string | null>(null);
  
  const character = useQuery(api.characters.get, { 
    id: characterId as Id<"characters"> 
  });
  
  const memories = useQuery(api.memories.list, {
    characterId: characterId as Id<"characters">,
    type: filter ? filter as "fact" | "preference" | "event" | "reflection" | "goal_progress" : undefined,
  });
  
  const deleteMemory = useMutation(api.memories.remove);

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const memoryTypes = ["fact", "preference", "event", "reflection", "goal_progress"];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link 
          href={`/chat/${characterId}`}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          ← Back to Chat
        </Link>
        
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: character.color + "20" }}
          >
            {character.emoji}
          </div>
          <div>
            <h1 className="font-semibold">{character.name}&apos;s Memories</h1>
            <p className="text-xs text-gray-400">
              {memories?.length || 0} memories stored
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === null 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {memoryTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filter === type 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <span>{typeEmoji[type]}</span>
              <span>{typeLabel[type]}</span>
            </button>
          ))}
        </div>

        {/* Memories List */}
        {memories?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-gray-400">No memories yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Chat with {character.name} and they&apos;ll start remembering things about you
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories?.map((memory) => (
              <div 
                key={memory._id}
                className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">{typeEmoji[memory.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-100">{memory.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{typeLabel[memory.type]}</span>
                      <span>•</span>
                      <span>Importance: {memory.importance}/10</span>
                      <span>•</span>
                      <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMemory({ id: memory._id })}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                    title="Delete memory"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-xl bg-gray-900/30 border border-gray-800">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>How Memories Work</span>
          </h3>
          <p className="text-sm text-gray-400">
            {character.name} automatically extracts and remembers important information from your conversations. 
            Higher importance memories (5+) are stored and used to personalize future chats. 
            You can delete memories you don&apos;t want them to remember.
          </p>
        </div>
      </main>
    </div>
  );
}
