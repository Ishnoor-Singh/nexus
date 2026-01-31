import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List goals for a character
export const list = query({
  args: { 
    characterId: v.id("characters"),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("abandoned")
    )),
  },
  handler: async (ctx, args) => {
    let goals = await ctx.db
      .query("goals")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();
    
    if (args.status) {
      goals = goals.filter((g) => g.status === args.status);
    }
    
    // Sort: active first, then by priority, then by date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const statusOrder = { active: 0, paused: 1, completed: 2, abandoned: 3 };
    
    return goals.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.createdAt - a.createdAt;
    });
  },
});

// Get a single goal
export const get = query({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new goal
export const create = mutation({
  args: {
    characterId: v.id("characters"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("goals", {
      characterId: args.characterId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      dueDate: args.dueDate,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

// Update goal status
export const updateStatus = mutation({
  args: {
    id: v.id("goals"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("abandoned")
    ),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status };
    
    if (args.status === "completed") {
      patch.completedAt = Date.now();
    } else {
      patch.completedAt = undefined;
    }
    
    await ctx.db.patch(args.id, patch);
  },
});

// Update goal details
export const update = mutation({
  args: {
    id: v.id("goals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const patch: Record<string, unknown> = {};
    
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.priority !== undefined) patch.priority = updates.priority;
    if (updates.dueDate !== undefined) patch.dueDate = updates.dueDate;
    
    await ctx.db.patch(id, patch);
  },
});

// Delete a goal
export const remove = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get active goals count (for dashboard)
export const getActiveCount = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_character_status", (q) => 
        q.eq("characterId", args.characterId).eq("status", "active")
      )
      .collect();
    
    return goals.length;
  },
});
