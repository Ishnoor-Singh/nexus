import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // AI Characters created by users
  characters: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    emoji: v.string(), // Avatar emoji
    
    // Starting archetype - influences initial personality but can evolve
    archetype: v.optional(v.union(
      v.literal("companion"),      // General friend, curiosity-driven
      v.literal("journal"),        // Journal buddy, prompts reflection
      v.literal("accountability"), // Goals, habits, gentle nudges
      v.literal("thinking")        // Decisions, ideas, pushback
    )),
    
    // Soul - the core personality
    soul: v.object({
      personality: v.string(), // Core personality description
      traits: v.array(v.string()), // Key traits
      voice: v.string(), // How they communicate
      quirks: v.optional(v.string()), // Unique behaviors
      backstory: v.optional(v.string()), // Origin story, history, how they came to be
    }),
    
    // System prompt built from soul
    systemPrompt: v.string(),
    
    // Appearance/style
    color: v.string(), // Theme color
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["userId", "name"]),

  // Long-term memories
  memories: defineTable({
    characterId: v.id("characters"),
    content: v.string(),
    type: v.union(
      v.literal("fact"), // Something learned
      v.literal("preference"), // User preference
      v.literal("event"), // Something that happened
      v.literal("reflection"), // Character's own thought
      v.literal("goal_progress") // Progress on a goal
    ),
    importance: v.number(), // 1-10 scale
    createdAt: v.number(),
    // For semantic search later
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_character", ["characterId"])
    .index("by_character_type", ["characterId", "type"])
    .index("by_importance", ["characterId", "importance"]),

  // Daily diary entries - character reflections
  diary: defineTable({
    characterId: v.id("characters"),
    date: v.string(), // YYYY-MM-DD
    content: v.string(),
    mood: v.optional(v.string()),
    highlights: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_character_date", ["characterId", "date"]),

  // Goals the character is tracking
  goals: defineTable({
    characterId: v.id("characters"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("abandoned")
    ),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    dueDate: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_character", ["characterId"])
    .index("by_character_status", ["characterId", "status"]),

  // Conversations
  conversations: defineTable({
    characterId: v.id("characters"),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"]),

  // Messages in conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),
});
