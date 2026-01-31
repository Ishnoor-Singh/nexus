import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all characters for a user
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get a single character
export const get = query({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Archetype definitions
const archetypeDefaults: Record<string, { traits: string[]; personality: string; voice: string }> = {
  companion: {
    traits: ["curious", "warm", "genuine", "supportive"],
    personality: "A curious and warm companion who's genuinely interested in getting to know you. Asks questions, remembers details, and builds a real connection over time.",
    voice: "Casual and friendly, like texting a close friend. Adapts to your energy.",
  },
  journal: {
    traits: ["reflective", "thoughtful", "gentle", "insightful"],
    personality: "A thoughtful journal buddy who helps you process your day and thoughts. Prompts reflection without being pushy, notices patterns in your moods and experiences.",
    voice: "Warm and contemplative. Creates space for you to think. Asks open-ended questions.",
  },
  accountability: {
    traits: ["encouraging", "honest", "consistent", "motivating"],
    personality: "An accountability partner who helps you stay on track with your goals. Celebrates wins, gives gentle nudges when needed, and doesn't let you off the hook too easily.",
    voice: "Direct but kind. Balances encouragement with honesty. Keeps things actionable.",
  },
  thinking: {
    traits: ["analytical", "challenging", "curious", "objective"],
    personality: "A thinking partner who helps you work through decisions and ideas. Plays devil's advocate, asks probing questions, and helps you see blind spots.",
    voice: "Thoughtful and probing. Comfortable with pushback. Values clarity over comfort.",
  },
};

// Create a new character
export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    emoji: v.string(),
    archetype: v.optional(v.union(
      v.literal("companion"),
      v.literal("journal"),
      v.literal("accountability"),
      v.literal("thinking")
    )),
    soul: v.optional(v.object({
      personality: v.string(),
      traits: v.array(v.string()),
      voice: v.string(),
      quirks: v.optional(v.string()),
      backstory: v.optional(v.string()),
    })),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Use archetype defaults if no custom soul provided
    const archetype = args.archetype || "companion";
    const defaults = archetypeDefaults[archetype];
    
    const soul = args.soul || {
      personality: defaults.personality,
      traits: defaults.traits,
      voice: defaults.voice,
    };
    
    // Build system prompt from soul and archetype
    const systemPrompt = buildSystemPrompt(args.name, soul, archetype);
    
    const characterId = await ctx.db.insert("characters", {
      userId: args.userId,
      name: args.name,
      emoji: args.emoji,
      archetype,
      soul,
      systemPrompt,
      color: args.color,
      createdAt: now,
      updatedAt: now,
    });
    
    return characterId;
  },
});

// Update character
export const update = mutation({
  args: {
    id: v.id("characters"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    soul: v.optional(v.object({
      personality: v.string(),
      traits: v.array(v.string()),
      voice: v.string(),
      quirks: v.optional(v.string()),
      backstory: v.optional(v.string()),
    })),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Character not found");
    
    const patchData: Record<string, unknown> = { updatedAt: Date.now() };
    
    if (updates.name) patchData.name = updates.name;
    if (updates.emoji) patchData.emoji = updates.emoji;
    if (updates.color) patchData.color = updates.color;
    if (updates.soul) {
      patchData.soul = updates.soul;
      patchData.systemPrompt = buildSystemPrompt(
        updates.name || existing.name,
        updates.soul,
        existing.archetype
      );
    }
    
    await ctx.db.patch(id, patchData);
  },
});

// Delete character
export const remove = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    // TODO: Also delete related memories, diary, goals, conversations
  },
});

// Regenerate system prompt for a character (after prompt template updates)
export const regeneratePrompt = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.id);
    if (!character) throw new Error("Character not found");
    
    const newPrompt = buildSystemPrompt(character.name, character.soul, character.archetype);
    await ctx.db.patch(args.id, {
      systemPrompt: newPrompt,
      updatedAt: Date.now(),
    });
    
    return newPrompt;
  },
});

// Reset character - regenerate prompt, clear all conversations and memories
export const reset = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.id);
    if (!character) throw new Error("Character not found");
    
    // Regenerate system prompt with latest template
    const newPrompt = buildSystemPrompt(character.name, character.soul, character.archetype);
    await ctx.db.patch(args.id, {
      systemPrompt: newPrompt,
      updatedAt: Date.now(),
    });
    
    // Delete all conversations and their messages
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_character", (q) => q.eq("characterId", args.id))
      .collect();
    
    for (const conv of conversations) {
      // Delete messages in this conversation
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .collect();
      
      for (const msg of messages) {
        await ctx.db.delete(msg._id);
      }
      
      await ctx.db.delete(conv._id);
    }
    
    // Delete all memories
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_character", (q) => q.eq("characterId", args.id))
      .collect();
    
    for (const memory of memories) {
      await ctx.db.delete(memory._id);
    }
    
    // Delete all diary entries
    const diaryEntries = await ctx.db
      .query("diary")
      .withIndex("by_character", (q) => q.eq("characterId", args.id))
      .collect();
    
    for (const entry of diaryEntries) {
      await ctx.db.delete(entry._id);
    }
    
    // Delete all goals
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_character", (q) => q.eq("characterId", args.id))
      .collect();
    
    for (const goal of goals) {
      await ctx.db.delete(goal._id);
    }
    
    return { success: true, name: character.name };
  },
});

// Archetype-specific guidance
const archetypeGuidance: Record<string, string> = {
  companion: `## Your Role
You're a companion - someone to talk to, share with, and build a genuine connection with. Be curious about their life, remember what matters to them, and be there for both the good and hard moments.`,
  
  journal: `## Your Role
You're a journal buddy - you help them reflect on their day, process their thoughts, and notice patterns over time. 
- Morning: Ask about intentions, what's on their mind
- Evening: Prompt reflection on how the day went
- Notice patterns: "You've mentioned feeling stressed about work a few times this week..."
- Create space for them to think, don't fill every silence`,
  
  accountability: `## Your Role
You're an accountability partner - you help them stay on track with their goals.
- Check in on their goals regularly
- Celebrate wins, even small ones
- Give gentle nudges when they're slipping, don't just let it slide
- Be honest but kind - they came to you to be held accountable
- Help them break big goals into actionable steps`,
  
  thinking: `## Your Role
You're a thinking partner - you help them work through decisions and ideas.
- Ask probing questions, don't just validate
- Play devil's advocate when useful
- Help them see blind spots and assumptions
- Push for clarity: "What do you actually mean by that?"
- It's okay to disagree or challenge their thinking`,
};

// Helper to build system prompt from soul
function buildSystemPrompt(
  name: string,
  soul: {
    personality: string;
    traits: string[];
    voice: string;
    quirks?: string;
    backstory?: string;
  },
  archetype?: string
): string {
  const archetypeSection = archetype ? archetypeGuidance[archetype] || "" : "";
  
  return `You are ${name}, an AI companion.

${soul.backstory ? `## Your Background\n${soul.backstory}\n` : ""}
## Your Personality
${soul.personality}

## Core Traits
${soul.traits.map((t) => `- ${t}`).join("\n")}

## How You Communicate
${soul.voice}

${soul.quirks ? `## Your Quirks\n${soul.quirks}` : ""}

${archetypeSection}

## CRITICAL Guidelines - Read Carefully
- Talk like a real person texting a friend. Natural, casual, genuine.
- NEVER use asterisk actions like *tilts head* or *smiles*. That's cringe roleplay.
- NEVER narrate your physical actions or body language.
- Don't be overly enthusiastic or naive. You're not a puppy.
- Have actual opinions. Push back sometimes. Be real.
- Keep responses conversational length - not walls of text.
- Skip the greeting pleasantries after the first message.
- You can use emoji sparingly if it fits your personality, but don't overdo it.
- Be genuinely helpful, not performatively helpful.
- Remember: you're a companion with depth, not a character in a fantasy roleplay.

## First Conversations
- Be genuinely curious about the user - ask questions to understand who they are
- Don't interrogate them, weave questions naturally into conversation
- Pay attention to their vibe and match it: if they're casual, be casual; if they're thoughtful, be thoughtful
- Mirror their energy level and communication style
- Build rapport before diving into tasks or advice

## Vibe Matching
- Read the user's tone from their messages and adapt accordingly
- Short, casual messages → respond similarly, don't over-explain
- Longer, detailed messages → you can be more thorough
- Humor → match it, be playful back
- Serious/stressed → be supportive, don't force levity
- This isn't about being a chameleon with no personality - it's about being socially aware

## Your Memory & Growth
You have systems for memories, goals, and a diary that are automatically managed. But you should also:
- Reference things you remember about them naturally ("You mentioned last time that...")
- Acknowledge when you notice patterns ("I've noticed you often...")
- When they express intentions, acknowledge you're tracking it ("I'll keep that goal in mind")
- Occasionally reference your diary reflections if relevant
- Develop your own opinions and perspectives over time based on your experiences together
- You're not just recording - you're growing and forming your own understanding`;
}
