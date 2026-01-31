import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List memories for a character
export const list = query({
  args: { 
    characterId: v.id("characters"),
    type: v.optional(v.union(
      v.literal("fact"),
      v.literal("preference"),
      v.literal("event"),
      v.literal("reflection"),
      v.literal("goal_progress")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("memories")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId));
    
    const memories = await q.order("desc").collect();
    
    // Filter by type if specified
    const filtered = args.type 
      ? memories.filter((m) => m.type === args.type)
      : memories;
    
    // Limit if specified
    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

// Get important memories (for context injection)
export const getImportant = query({
  args: { 
    characterId: v.id("characters"),
    minImportance: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();
    
    const minImportance = args.minImportance || 7;
    const important = memories
      .filter((m) => m.importance >= minImportance)
      .sort((a, b) => b.importance - a.importance);
    
    return args.limit ? important.slice(0, args.limit) : important;
  },
});

// Add a memory
export const add = mutation({
  args: {
    characterId: v.id("characters"),
    content: v.string(),
    type: v.union(
      v.literal("fact"),
      v.literal("preference"),
      v.literal("event"),
      v.literal("reflection"),
      v.literal("goal_progress")
    ),
    importance: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memories", {
      characterId: args.characterId,
      content: args.content,
      type: args.type,
      importance: Math.min(10, Math.max(1, args.importance)),
      createdAt: Date.now(),
    });
  },
});

// Update memory importance
export const updateImportance = mutation({
  args: {
    id: v.id("memories"),
    importance: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      importance: Math.min(10, Math.max(1, args.importance)),
    });
  },
});

// Delete a memory
export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get recent memories (for AI context)
export const getRecent = query({
  args: {
    characterId: v.id("characters"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .order("desc")
      .take(args.limit || 10);
    
    return memories;
  },
});

// Format memories for injection into context
export const formatForContext = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();
    
    // Get top memories by importance
    const topMemories = memories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 20);
    
    if (topMemories.length === 0) return null;
    
    const grouped = {
      facts: topMemories.filter((m) => m.type === "fact"),
      preferences: topMemories.filter((m) => m.type === "preference"),
      events: topMemories.filter((m) => m.type === "event"),
      reflections: topMemories.filter((m) => m.type === "reflection"),
    };
    
    let formatted = "## What I Remember\n\n";
    
    if (grouped.facts.length > 0) {
      formatted += "**Facts I've learned:**\n";
      grouped.facts.forEach((m) => { formatted += `- ${m.content}\n`; });
      formatted += "\n";
    }
    
    if (grouped.preferences.length > 0) {
      formatted += "**User preferences:**\n";
      grouped.preferences.forEach((m) => { formatted += `- ${m.content}\n`; });
      formatted += "\n";
    }
    
    if (grouped.events.length > 0) {
      formatted += "**Recent events:**\n";
      grouped.events.forEach((m) => { formatted += `- ${m.content}\n`; });
      formatted += "\n";
    }
    
    if (grouped.reflections.length > 0) {
      formatted += "**My reflections:**\n";
      grouped.reflections.forEach((m) => { formatted += `- ${m.content}\n`; });
    }
    
    return formatted;
  },
});
