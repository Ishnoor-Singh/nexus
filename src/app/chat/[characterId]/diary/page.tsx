"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function DiaryPage() {
  const { characterId } = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  
  const character = useQuery(api.characters.get, { 
    id: characterId as Id<"characters"> 
  });
  
  const entries = useQuery(api.diary.list, {
    characterId: characterId as Id<"characters">,
  });
  
  const generateEntry = useAction(api.diary.generate);
  const deleteEntry = useMutation(api.diary.remove);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateEntry({ 
        characterId: characterId as Id<"characters"> 
      });
      if ('error' in result) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Failed to generate entry:", error);
      alert("Failed to generate diary entry");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayEntry = entries?.find(e => e.date === today);

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
            <h1 className="font-semibold">{character.name}&apos;s Diary</h1>
            <p className="text-xs text-gray-400">
              {entries?.length || 0} entries
            </p>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">✨</span>
              <span>Writing...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>{todayEntry ? "Update Today" : "Write Today"}</span>
            </>
          )}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Entries List */}
        {entries?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📔</div>
            <p className="text-gray-400">No diary entries yet</p>
            <p className="text-sm text-gray-500 mt-1">
              {character.name} will reflect on your conversations
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              Generate First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries?.map((entry) => (
              <div 
                key={entry._id}
                className={`p-5 rounded-xl bg-gray-900/50 border transition-all cursor-pointer ${
                  selectedEntry === entry._id 
                    ? "border-blue-500/50" 
                    : "border-gray-800 hover:border-gray-700"
                }`}
                onClick={() => setSelectedEntry(selectedEntry === entry._id ? null : entry._id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{entry.mood || "📝"}</span>
                    <span className="font-medium">
                      {formatDate(entry.date)}
                    </span>
                    {entry.date === today && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this diary entry?")) {
                        deleteEntry({ id: entry._id });
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className={`text-gray-300 whitespace-pre-wrap ${
                  selectedEntry !== entry._id ? "line-clamp-3" : ""
                }`}>
                  {entry.content}
                </div>
                
                {selectedEntry !== entry._id && entry.content.length > 200 && (
                  <p className="text-sm text-gray-500 mt-2">Click to expand...</p>
                )}
                
                {entry.highlights && entry.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.highlights.map((h, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-xl bg-gray-900/30 border border-gray-800">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <span>📔</span>
            <span>About the Diary</span>
          </h3>
          <p className="text-sm text-gray-400">
            {character.name}&apos;s diary contains their personal reflections on your conversations. 
            Click &quot;Write Today&quot; to have them reflect on recent chats and memories. 
            This helps {character.name} develop their own perspective and inner life.
          </p>
        </div>
      </main>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateStr === today.toISOString().split("T")[0]) {
    return "Today";
  } else if (dateStr === yesterday.toISOString().split("T")[0]) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "short", 
      day: "numeric" 
    });
  }
}
