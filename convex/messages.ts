import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a message to the conversation
export const send = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

// Get recent messages (for chat history)
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    // Return in chronological order
    return messages.reverse();
  },
});

// Clear all messages (start fresh)
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
