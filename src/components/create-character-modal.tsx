"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

const EMOJI_OPTIONS = ["🐉", "🦊", "🦉", "🐺", "🦋", "🌟", "🔮", "🌙", "✨", "🪽", "🦄", "🐙"];
const COLOR_OPTIONS = [
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f97316", // orange
  "#10b981", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#eab308", // yellow
  "#ef4444", // red
];

const ARCHETYPES = [
  {
    id: "companion",
    emoji: "🐉",
    name: "Companion",
    description: "A curious friend who gets to know you and grows with you",
    color: "#8b5cf6",
  },
  {
    id: "journal",
    emoji: "📓",
    name: "Journal Buddy",
    description: "Prompts reflection, morning intentions, evening check-ins",
    color: "#ec4899",
  },
  {
    id: "accountability",
    emoji: "🎯",
    name: "Accountability",
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
  
  const [step, setStep] = useState<"archetype" | "details">("archetype");
  const [archetype, setArchetype] = useState<ArchetypeId>("companion");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🐉");
  const [color, setColor] = useState("#8b5cf6");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [personality, setPersonality] = useState("");
  const [traits, setTraits] = useState("");
  const [voice, setVoice] = useState("");
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
      const customSoul = showAdvanced && (personality || traits || voice) ? {
        personality: personality || "A friendly companion.",
        traits: traits ? traits.split(",").map((t) => t.trim()).filter(Boolean) : [],
        voice: voice || "Casual and friendly.",
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
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[--card] rounded-2xl border border-[--border] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl">
        <div className="sticky top-0 bg-[--card] border-b border-[--border] px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {step === "archetype" ? (
              <>🥚 Choose Your Path</>
            ) : (
              <>✨ Birth Your Familiar</>
            )}
          </h2>
          <button 
            onClick={onClose}
            className="text-[--muted-foreground] hover:text-[--foreground] transition-colors p-1"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {step === "archetype" && (
            <div className="space-y-5 animate-fadeIn">
              <p className="text-[--muted-foreground]">
                Pick a starting archetype. Your familiar will evolve beyond it.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => handleArchetypeSelect(arch.id)}
                    className={`p-5 rounded-xl border text-left transition-all duration-300 group
                      ${archetype === arch.id
                        ? "border-[--primary] bg-[--primary]/10 scale-[1.02]"
                        : "border-[--border] hover:border-[--border-hover] bg-[--muted]/30 hover:bg-[--muted]/50"
                      }`}
                  >
                    <div 
                      className="text-3xl mb-3 group-hover:scale-110 transition-transform"
                      style={{ filter: archetype === arch.id ? `drop-shadow(0 4px 12px ${arch.color}50)` : 'none' }}
                    >
                      {arch.emoji}
                    </div>
                    <div className="font-medium mb-1">{arch.name}</div>
                    <div className="text-xs text-[--muted-foreground] leading-relaxed">{arch.description}</div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setStep("details")}
                className="w-full mt-2 btn-primary px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 group"
              >
                <span>Continue with {selectedArchetype.name}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Selected archetype badge */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[--muted]/30 border border-[--border]">
                <span className="text-2xl">{selectedArchetype.emoji}</span>
                <span className="font-medium flex-1">{selectedArchetype.name}</span>
                <button 
                  onClick={() => setStep("archetype")}
                  className="text-sm text-[--primary] hover:text-[--primary-hover] transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[--muted-foreground] mb-2">
                  What will you name them?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ember, Nova, Sage, Luna..."
                  className="w-full px-4 py-3.5 bg-[--muted]/30 border border-[--border] rounded-xl 
                    focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20 outline-none text-lg
                    placeholder:text-[--muted-foreground]/50 transition-all"
                  autoFocus
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-[--muted-foreground] mb-2">
                  Choose their form
                </label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200
                        ${emoji === e 
                          ? "bg-[--primary] scale-110 shadow-lg" 
                          : "bg-[--muted]/30 hover:bg-[--muted]/50 hover:scale-105"
                        }`}
                      style={emoji === e ? { boxShadow: `0 8px 24px ${color}40` } : {}}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-[--muted-foreground] mb-2">
                  Pick their color
                </label>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        color === c 
                          ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[--card]" 
                          : "hover:scale-110"
                      }`}
                      style={{ 
                        backgroundColor: c,
                        boxShadow: color === c ? `0 4px 20px ${c}60` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center justify-center py-4">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300"
                  style={{ 
                    backgroundColor: color + "20",
                    boxShadow: `0 12px 40px ${color}30`
                  }}
                >
                  {emoji}
                </div>
              </div>

              {/* Advanced toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-[--muted-foreground] hover:text-[--foreground] flex items-center gap-2 transition-colors"
              >
                <span className="transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'none' }}>▶</span>
                <span>Customize personality (optional)</span>
              </button>

              {showAdvanced && (
                <div className="space-y-4 pl-4 border-l-2 border-[--border] animate-fadeIn">
                  <div>
                    <label className="block text-sm text-[--muted-foreground] mb-1">Personality</label>
                    <textarea
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      placeholder="Override the default personality..."
                      rows={2}
                      className="w-full px-3 py-2 bg-[--muted]/30 border border-[--border] rounded-xl focus:border-[--primary] outline-none resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--muted-foreground] mb-1">Traits (comma-separated)</label>
                    <input
                      type="text"
                      value={traits}
                      onChange={(e) => setTraits(e.target.value)}
                      placeholder="curious, witty, supportive..."
                      className="w-full px-3 py-2 bg-[--muted]/30 border border-[--border] rounded-xl focus:border-[--primary] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--muted-foreground] mb-1">Communication style</label>
                    <input
                      type="text"
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                      placeholder="Casual and friendly, uses emojis..."
                      className="w-full px-3 py-2 bg-[--muted]/30 border border-[--border] rounded-xl focus:border-[--primary] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--muted-foreground] mb-1">Backstory</label>
                    <textarea
                      value={backstory}
                      onChange={(e) => setBackstory(e.target.value)}
                      placeholder="Their origin story..."
                      rows={2}
                      className="w-full px-3 py-2 bg-[--muted]/30 border border-[--border] rounded-xl focus:border-[--primary] outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("archetype")}
                  className="flex-1 px-4 py-3.5 bg-[--muted]/30 hover:bg-[--muted]/50 border border-[--border] rounded-xl font-medium transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isLoading || !name}
                  className="flex-1 btn-primary px-4 py-3.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">🥚</span>
                      <span>Hatching...</span>
                    </>
                  ) : (
                    <>
                      <span>🪄</span>
                      <span>Hatch {name || 'Familiar'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
