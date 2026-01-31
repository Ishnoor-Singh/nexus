"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SoulPage() {
  const { characterId } = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const character = useQuery(api.characters.get, { 
    id: characterId as Id<"characters"> 
  });
  
  const updateCharacter = useMutation(api.characters.update);
  
  const [editedSoul, setEditedSoul] = useState({
    personality: "",
    traits: [] as string[],
    voice: "",
    quirks: "",
    backstory: "",
  });
  const [newTrait, setNewTrait] = useState("");

  // Initialize form when character loads
  useEffect(() => {
    if (character) {
      setEditedSoul({
        personality: character.soul.personality,
        traits: [...character.soul.traits],
        voice: character.soul.voice,
        quirks: character.soul.quirks || "",
        backstory: character.soul.backstory || "",
      });
    }
  }, [character]);

  const handleSave = async () => {
    if (!character) return;
    setIsSaving(true);
    try {
      await updateCharacter({
        id: character._id,
        soul: {
          personality: editedSoul.personality,
          traits: editedSoul.traits,
          voice: editedSoul.voice,
          quirks: editedSoul.quirks || undefined,
          backstory: editedSoul.backstory || undefined,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const addTrait = () => {
    if (newTrait.trim() && !editedSoul.traits.includes(newTrait.trim())) {
      setEditedSoul({
        ...editedSoul,
        traits: [...editedSoul.traits, newTrait.trim()],
      });
      setNewTrait("");
    }
  };

  const removeTrait = (trait: string) => {
    setEditedSoul({
      ...editedSoul,
      traits: editedSoul.traits.filter(t => t !== trait),
    });
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

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
            <h1 className="font-semibold">{character.name}&apos;s Soul</h1>
            <p className="text-xs text-gray-400">
              Who they are at their core
            </p>
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedSoul({
                  personality: character.soul.personality,
                  traits: [...character.soul.traits],
                  voice: character.soul.voice,
                  quirks: character.soul.quirks || "",
                  backstory: character.soul.backstory || "",
                });
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Edit Soul
          </button>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Personality */}
        <section className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>✨</span>
            <span>Personality</span>
          </h2>
          {isEditing ? (
            <textarea
              value={editedSoul.personality}
              onChange={(e) => setEditedSoul({ ...editedSoul, personality: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="Describe their core personality..."
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">{character.soul.personality}</p>
          )}
        </section>

        {/* Traits */}
        <section className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>🏷️</span>
            <span>Core Traits</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? editedSoul.traits : character.soul.traits).map((trait) => (
              <span 
                key={trait} 
                className={`px-3 py-1.5 rounded-full text-sm ${
                  isEditing 
                    ? "bg-gray-800 border border-gray-700 flex items-center gap-2" 
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {trait}
                {isEditing && (
                  <button
                    onClick={() => removeTrait(trait)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTrait()}
                  placeholder="Add trait..."
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-sm focus:border-blue-500 outline-none w-32"
                />
                <button
                  onClick={addTrait}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-sm"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Voice */}
        <section className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>💬</span>
            <span>Communication Style</span>
          </h2>
          {isEditing ? (
            <textarea
              value={editedSoul.voice}
              onChange={(e) => setEditedSoul({ ...editedSoul, voice: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="How do they communicate? Formal, casual, witty...?"
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">{character.soul.voice}</p>
          )}
        </section>

        {/* Backstory */}
        <section className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>📖</span>
            <span>Backstory</span>
          </h2>
          {isEditing ? (
            <textarea
              value={editedSoul.backstory}
              onChange={(e) => setEditedSoul({ ...editedSoul, backstory: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="Their origin story, history, how they came to be..."
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">
              {character.soul.backstory || <span className="text-gray-500 italic">No backstory yet</span>}
            </p>
          )}
        </section>

        {/* Quirks */}
        <section className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>🎭</span>
            <span>Quirks</span>
          </h2>
          {isEditing ? (
            <textarea
              value={editedSoul.quirks}
              onChange={(e) => setEditedSoul({ ...editedSoul, quirks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="Unique behaviors, habits, or peculiarities..."
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">
              {character.soul.quirks || <span className="text-gray-500 italic">No quirks defined</span>}
            </p>
          )}
        </section>

        {/* System Prompt Preview */}
        <section className="p-5 rounded-xl bg-gray-900/30 border border-gray-800">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-gray-400">
            <span>🔧</span>
            <span>Generated System Prompt</span>
          </h2>
          <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono bg-gray-900/50 p-3 rounded-lg overflow-x-auto">
            {character.systemPrompt}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            This is automatically generated from the soul settings above and used to guide {character.name}&apos;s responses.
          </p>
        </section>
      </main>
    </div>
  );
}
