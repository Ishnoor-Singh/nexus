import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";

// List diary entries for a character
export const list = query({
  args: { 
    characterId: v.id("characters"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("diary")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .order("desc")
      .collect();
    
    return args.limit ? entries.slice(0, args.limit) : entries;
  },
});

// Get a specific diary entry
export const get = query({
  args: { id: v.id("diary") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get today's entry
export const getToday = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    
    return await ctx.db
      .query("diary")
      .withIndex("by_character_date", (q) => 
        q.eq("characterId", args.characterId).eq("date", today)
      )
      .first();
  },
});

// Create or update diary entry
export const upsert = mutation({
  args: {
    characterId: v.id("characters"),
    date: v.string(),
    content: v.string(),
    mood: v.optional(v.string()),
    highlights: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("diary")
      .withIndex("by_character_date", (q) => 
        q.eq("characterId", args.characterId).eq("date", args.date)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        mood: args.mood,
        highlights: args.highlights,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("diary", {
        characterId: args.characterId,
        date: args.date,
        content: args.content,
        mood: args.mood,
        highlights: args.highlights,
        createdAt: Date.now(),
      });
    }
  },
});

// Delete diary entry
export const remove = mutation({
  args: { id: v.id("diary") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Generate a diary entry based on recent conversations
export const generate = action({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");

    // Get character
    const character = await ctx.runQuery(api.characters.get, { id: args.characterId });
    if (!character) throw new Error("Character not found");

    // Get recent messages (last day or so)
    const conversations = await ctx.runQuery(api.messages.listConversations, { 
      characterId: args.characterId 
    });
    
    let recentMessages: { role: string; content: string }[] = [];
    if (conversations.length > 0) {
      const messages = await ctx.runQuery(api.messages.getRecentMessages, {
        conversationId: conversations[0]._id,
        limit: 30,
      });
      recentMessages = messages.map(m => ({ role: m.role, content: m.content }));
    }

    // Get recent memories
    const memories = await ctx.runQuery(api.memories.getRecent, {
      characterId: args.characterId,
      limit: 10,
    });

    if (recentMessages.length === 0 && memories.length === 0) {
      return { error: "No recent activity to write about" };
    }

    const prompt = `You are ${character.name}. Write a short, personal diary entry reflecting on your recent conversations with your companion.

${character.soul.personality}

Recent conversation snippets:
${recentMessages.slice(-10).map(m => `${m.role}: ${m.content}`).join("\n")}

Recent memories formed:
${memories.map(m => `- ${m.content}`).join("\n")}

Write a brief diary entry (2-3 paragraphs) from YOUR perspective as ${character.name}. Be genuine, not cheesy. Reflect on what you learned, how you felt, and what you're thinking about. Include:
1. A mood emoji at the start (just one)
2. Your honest thoughts and feelings
3. Maybe something you're curious about or looking forward to

Keep it natural and personal - this is your private diary.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI response failed: ${response.status}`);
    }

    const data = await response.json();
    const diaryContent = data.content[0].text;
    
    // Extract mood emoji (first emoji in the response)
    const moodMatch = diaryContent.match(/[\u{1F300}-\u{1F9FF}]/u);
    const mood = moodMatch ? moodMatch[0] : "📝";

    const today = new Date().toISOString().split("T")[0];
    
    // Save the diary entry
    await ctx.runMutation(api.diary.upsert, {
      characterId: args.characterId,
      date: today,
      content: diaryContent,
      mood: mood,
    });

    return { success: true, content: diaryContent };
  },
});
