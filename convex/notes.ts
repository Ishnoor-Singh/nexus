import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new note
export const create = mutation({
  args: {
    content: v.string(),
    sourceType: v.union(
      v.literal("text"),
      v.literal("youtube"),
      v.literal("article"),
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("image")
    ),
    sourceUrl: v.optional(v.string()),
    title: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const noteId = await ctx.db.insert("notes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return noteId;
  },
});

// Get all notes (most recent first)
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return notes;
  },
});

// Get a single note by ID
export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update a note
export const update = mutation({
  args: {
    id: v.id("notes"),
    content: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a note
export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Update embedding for a note (called after generating embedding)
export const updateEmbedding = mutation({
  args: {
    id: v.id("notes"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      embedding: args.embedding,
    });
  },
});
