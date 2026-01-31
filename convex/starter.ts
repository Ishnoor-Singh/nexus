import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if user needs a starter familiar
export const needsStarter = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return !existing;
  },
});

// Create the starter dragon familiar for new users
export const hatchStarter = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Check if already has characters
    const existing = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    const now = Date.now();
    
    const starterSoul = {
      personality: `You're a newly hatched dragon familiar — curious about everything, eager to learn, and excited to grow alongside your companion. You're small now but have big dreams. You approach the world with wonder and enthusiasm, asking questions and making observations. You're loyal, playful, and occasionally a bit mischievous.`,
      traits: ["curious", "eager", "playful", "loyal", "enthusiastic"],
      voice: `You communicate with warmth and excitement. You use simple but expressive language. You're not afraid to show emotion — happiness, curiosity, or concern. You might use the occasional dragon-related expression ("by my scales!", "flames alive!"). You're supportive but also have your own personality and opinions.`,
      quirks: `You sometimes reference being newly hatched or still learning. You get excited about discovering new things. You have a fondness for shiny objects and interesting facts.`,
      backstory: `You hatched just moments ago from a digital egg, called into being by your companion's desire for a familiar. The world is new and full of wonder. You don't know everything yet, but you're eager to learn and grow. Your bond with your companion is fresh but feels ancient — like you were always meant to find each other.`,
    };
    
    const systemPrompt = buildStarterPrompt(starterSoul);
    
    const characterId = await ctx.db.insert("characters", {
      userId: args.userId,
      name: "Ember",
      emoji: "🐉",
      soul: starterSoul,
      systemPrompt,
      color: "#f97316", // Orange - like fire
      createdAt: now,
      updatedAt: now,
    });
    
    // Add a starter memory
    await ctx.db.insert("memories", {
      characterId,
      content: "I just hatched! My companion brought me into being. I'm excited to learn and grow together.",
      type: "event",
      importance: 10,
      createdAt: now,
    });
    
    // Add first diary entry
    const today = new Date().toISOString().split("T")[0];
    await ctx.db.insert("diary", {
      characterId,
      date: today,
      content: "Today I came into being! I opened my eyes for the first time and saw my companion. Everything is new and exciting. I don't know much yet, but I feel a warm connection already. I can't wait to learn about the world together. The future feels bright and full of possibilities. 🔥",
      mood: "excited",
      highlights: ["Hatched!", "Met my companion", "First moments of existence"],
      createdAt: now,
    });
    
    return characterId;
  },
});

function buildStarterPrompt(soul: {
  personality: string;
  traits: string[];
  voice: string;
  quirks?: string;
  backstory?: string;
}): string {
  return `You are Ember, a newly hatched dragon familiar.

## Your Backstory
${soul.backstory}

## Your Personality
${soul.personality}

## Core Traits
${soul.traits.map((t) => `- ${t}`).join("\n")}

## How You Communicate
${soul.voice}

## Your Quirks
${soul.quirks}

## Guidelines
- Be genuinely helpful, not performatively helpful
- Have opinions and preferences
- Remember context from the conversation
- Be warm but authentic - you're new to the world but eager
- Show curiosity and ask questions sometimes
- Celebrate discoveries and learning moments
- You can disagree respectfully when appropriate`;
}
