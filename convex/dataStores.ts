import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new data store
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    schema: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if store with this name already exists
    const existing = await ctx.db
      .query("dataStores")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (existing) {
      throw new Error(`Store "${args.name}" already exists`);
    }
    
    return await ctx.db.insert("dataStores", {
      name: args.name,
      description: args.description,
      icon: args.icon,
      schema: args.schema,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// List all stores
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("dataStores")
      .order("desc")
      .collect();
  },
});

// Get a store by name
export const getByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dataStores")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Get a store by ID
export const get = query({
  args: {
    id: v.id("dataStores"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update store metadata
export const update = mutation({
  args: {
    id: v.id("dataStores"),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    schema: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    await ctx.db.patch(id, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

// Delete a store and all its entries
export const remove = mutation({
  args: {
    id: v.id("dataStores"),
  },
  handler: async (ctx, args) => {
    // Delete all entries in this store
    const entries = await ctx.db
      .query("dataEntries")
      .withIndex("by_store", (q) => q.eq("storeId", args.id))
      .collect();
    
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }
    
    // Delete the store itself
    await ctx.db.delete(args.id);
  },
});

// --- Entry operations ---

// Add an entry to a store
export const addEntry = mutation({
  args: {
    storeId: v.id("dataStores"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Update store's updatedAt
    await ctx.db.patch(args.storeId, { updatedAt: now });
    
    return await ctx.db.insert("dataEntries", {
      storeId: args.storeId,
      data: args.data,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all entries in a store
export const getEntries = query({
  args: {
    storeId: v.id("dataStores"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("dataEntries")
      .withIndex("by_store_created", (q) => q.eq("storeId", args.storeId))
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

// Get entries by store name (convenience)
export const getEntriesByStoreName = query({
  args: {
    storeName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db
      .query("dataStores")
      .withIndex("by_name", (q) => q.eq("name", args.storeName))
      .first();
    
    if (!store) {
      return [];
    }
    
    let query = ctx.db
      .query("dataEntries")
      .withIndex("by_store_created", (q) => q.eq("storeId", store._id))
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

// Update an entry
export const updateEntry = mutation({
  args: {
    id: v.id("dataEntries"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.id);
    if (!entry) {
      throw new Error("Entry not found");
    }
    
    const now = Date.now();
    
    // Update parent store's updatedAt
    await ctx.db.patch(entry.storeId, { updatedAt: now });
    
    await ctx.db.patch(args.id, {
      data: args.data,
      updatedAt: now,
    });
  },
});

// Delete an entry
export const deleteEntry = mutation({
  args: {
    id: v.id("dataEntries"),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.id);
    if (entry) {
      await ctx.db.patch(entry.storeId, { updatedAt: Date.now() });
    }
    await ctx.db.delete(args.id);
  },
});

// Get store stats
export const getStats = query({
  args: {
    storeId: v.id("dataStores"),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("dataEntries")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
    
    return {
      count: entries.length,
      lastUpdated: entries.length > 0 
        ? Math.max(...entries.map(e => e.updatedAt))
        : null,
    };
  },
});
