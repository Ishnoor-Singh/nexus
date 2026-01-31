"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

const EMOJI_OPTIONS = ["🐉", "🦊", "🦉", "🐺", "🦋", "🌟", "🔮", "🌙", "✨", "🪽"];
const COLOR_OPTIONS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f97316", // orange
  "#10b981", // green
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#ef4444", // red
];

const ARCHETYPES = [
  {
    id: "companion",
    emoji: "🐉",
    name: "Companion",
    description: "A curious friend who gets to know you and grows with you",
    color: "#3b82f6",
  },
  {
    id: "journal",
    emoji: "📓",
    name: "Journal Buddy",
    description: "Prompts reflection, morning intentions, evening check-ins",
    color: "#8b5cf6",
  },
  {
    id: "accountability",
    emoji: "🎯",
    name: "Accountability Partner",
    description: "Helps you stay on track with goals and habits",
    color: "#10b981",
  },
  {
    id: "thinking",
    emoji: "🧠",
    name: "Thinking Partner",
    description: "Helps you work through decisions, plays devil's advocate",
    color: "#f97316",
  },
] as const;

type ArchetypeId = typeof ARCHETYPES[number]["id"];

interface Props {
  userId: string;
  onClose: () => void;
}

export function CreateCharacterModal({ userId, onClose }: Props) {
  const router = useRouter();
  const createCharacter = useMutation(api.characters.create);
  
  const [step, setStep] = useState<"archetype" | "details" | "customize">("archetype");
  const [archetype, setArchetype] = useState<ArchetypeId>("companion");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🐉");
  const [color, setColor] = useState("#3b82f6");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced customization
  const [personality, setPersonality] = useState("");
  const [traits, setTraits] = useState("");
  const [voice, setVoice] = useState("");
  const [quirks, setQuirks] = useState("");
  const [backstory, setBackstory] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const selectedArchetype = ARCHETYPES.find(a => a.id === archetype)!;

  const handleArchetypeSelect = (id: ArchetypeId) => {
    setArchetype(id);
    const arch = ARCHETYPES.find(a => a.id === id)!;
    setEmoji(arch.emoji);
    setColor(arch.color);
  };

  const handleCreate = async () => {
    if (!name) return;
    
    setIsLoading(true);
    try {
      // Only pass custom soul if user filled in advanced fields
      const customSoul = showAdvanced && (personality || traits || voice) ? {
        personality: personality || "A friendly companion.",
        traits: traits ? traits.split(",").map((t) => t.trim()).filter(Boolean) : [],
        voice: voice || "Casual and friendly.",
        quirks: quirks || undefined,
        backstory: backstory || undefined,
      } : undefined;

      const characterId = await createCharacter({
        userId,
        name,
        emoji,
        color,
        archetype,
        soul: customSoul,
      });
      
      router.push(`/chat/${characterId}`);
    } catch (error) {
      console.error("Failed to create character:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">
            {step === "archetype" ? "Choose a Starting Point" : "Create Your Familiar"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {step === "archetype" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Pick an archetype to start with. Your familiar can evolve beyond this over time.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => handleArchetypeSelect(arch.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      archetype === arch.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{arch.emoji}</div>
                    <div className="font-medium">{arch.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{arch.description}</div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setStep("details")}
                className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Continue with {selectedArchetype.name}
              </button>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-6">
              {/* Selected archetype badge */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-lg">{selectedArchetype.emoji}</span>
                <span>{selectedArchetype.name}</span>
                <button 
                  onClick={() => setStep("archetype")}
                  className="text-blue-400 hover:text-blue-300 ml-auto"
                >
                  Change
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name your familiar
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ember, Nova, Sage..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-lg"
                  autoFocus
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Avatar
                </label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
                        emoji === e 
                          ? "bg-blue-600" 
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === c ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Advanced toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2"
              >
                <span>{showAdvanced ? "▼" : "▶"}</span>
                <span>Customize personality (optional)</span>
              </button>

              {showAdvanced && (
                <div className="space-y-4 pl-4 border-l border-gray-700">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Personality</label>
                    <textarea
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      placeholder="Override the default personality..."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 outline-none resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Traits (comma-separated)</label>
                    <input
                      type="text"
                      value={traits}
                      onChange={(e) => setTraits(e.target.value)}
                      placeholder="curious, witty, supportive..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Communication style</label>
                    <input
                      type="text"
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                      placeholder="Casual and friendly, uses emojis..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Backstory (optional)</label>
                    <textarea
                      value={backstory}
                      onChange={(e) => setBackstory(e.target.value)}
                      placeholder="Their origin story..."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("archetype")}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isLoading || !name}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {isLoading ? "Hatching..." : "Hatch Familiar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
