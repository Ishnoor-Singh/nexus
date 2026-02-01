import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Notes/captures - the core content
  notes: defineTable({
    content: v.string(), // The actual text content
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
    metadata: v.optional(v.any()), // oEmbed data, etc.
    embedding: v.optional(v.array(v.float64())), // For semantic search
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_sourceType", ["sourceType"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // OpenAI ada-002
      filterFields: ["sourceType"],
    }),

  // Conversation history with the AI
  messages: defineTable({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  // AI personality/settings
  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  // Data stores - AI-created mini apps / structured data
  dataStores: defineTable({
    name: v.string(),              // "workouts", "books", "mood_log"
    description: v.string(),       // AI's description of what this store is for
    icon: v.optional(v.string()),  // Emoji icon for the store
    schema: v.optional(v.any()),   // Optional schema hint for the AI
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_createdAt", ["createdAt"]),

  // Data entries - individual records in a store
  dataEntries: defineTable({
    storeId: v.id("dataStores"),
    data: v.any(),                 // Flexible JSON data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_created", ["storeId", "createdAt"]),
});
