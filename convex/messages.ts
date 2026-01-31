import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the most recent conversation for a character
export const getConversation = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .order("desc")
      .first();
    
    return existing?._id ?? null;
  },
});

// Create a new conversation for a character
export const createConversation = mutation({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("conversations", {
      characterId: args.characterId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// List conversations for a character
export const listConversations = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .order("desc")
      .collect();
  },
});

// Get messages for a conversation
export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
  },
});

// Send a message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      createdAt: now,
    });
    
    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, { updatedAt: now });
    
    return messageId;
  },
});

// Get recent messages (for context window)
export const getRecentMessages = query({
  args: { 
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(args.limit || 50);
    
    return messages.reverse(); // Return in chronological order
  },
});
