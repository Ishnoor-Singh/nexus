import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Generate AI response
export const generateResponse = action({
  args: {
    conversationId: v.id("conversations"),
    characterId: v.id("characters"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Get character details
    const character = await ctx.runQuery(api.characters.get, {
      id: args.characterId,
    });
    
    if (!character) {
      throw new Error("Character not found");
    }

    // Get recent messages for context
    const messages = await ctx.runQuery(api.messages.getRecentMessages, {
      conversationId: args.conversationId,
      limit: 20,
    });

    // Get relevant memories
    const memories = await ctx.runQuery(api.memories.getRecent, {
      characterId: args.characterId,
      limit: 15,
    });

    // Get active goals
    const goals = await ctx.runQuery(api.goals.list, {
      characterId: args.characterId,
      status: "active",
    });

    // Get recent diary entry
    const todayDiary = await ctx.runQuery(api.diary.getToday, {
      characterId: args.characterId,
    });

    // Build context
    let contextSections = [];
    
    if (memories.length > 0) {
      const memsByType: Record<string, string[]> = {};
      for (const m of memories) {
        if (!memsByType[m.type]) memsByType[m.type] = [];
        memsByType[m.type].push(m.content);
      }
      
      let memText = "## What I Remember";
      if (memsByType.fact) memText += `\nFacts: ${memsByType.fact.join("; ")}`;
      if (memsByType.preference) memText += `\nPreferences: ${memsByType.preference.join("; ")}`;
      if (memsByType.event) memText += `\nRecent events: ${memsByType.event.join("; ")}`;
      if (memsByType.reflection) memText += `\nMy reflections: ${memsByType.reflection.join("; ")}`;
      contextSections.push(memText);
    }
    
    if (goals.length > 0) {
      contextSections.push(`## Their Active Goals\n${goals.map(g => `- ${g.title}${g.description ? ` (${g.description})` : ""}`).join("\n")}`);
    }
    
    if (todayDiary) {
      contextSections.push(`## My Recent Thoughts\n${todayDiary.content.slice(0, 300)}...`);
    }

    const memoryContext = contextSections.length > 0 
      ? "\n\n" + contextSections.join("\n\n")
      : "";

    // Build conversation history
    const conversationHistory = messages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Call Anthropic API
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const systemPrompt = `${character.systemPrompt}${memoryContext}

IMPORTANT: Talk naturally like you're texting a friend. No asterisk actions, no narrating body language, no cringe roleplay. Just be real.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: conversationHistory,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      throw new Error(`AI response failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Save the AI response
    await ctx.runMutation(api.messages.send, {
      conversationId: args.conversationId,
      role: "assistant",
      content: aiResponse,
    });

    // Trigger conversation processing in the background (memories, goals, diary)
    ctx.runAction(internal.ai.processConversation, {
      characterId: args.characterId,
      userMessage: args.userMessage,
      aiResponse: aiResponse,
    }).catch(console.error);

    return aiResponse;
  },
});

// Proactively manage memories, goals, and reflections after each exchange
export const processConversation = action({
  args: {
    characterId: v.id("characters"),
    userMessage: v.string(),
    aiResponse: v.string(),
  },
  handler: async (ctx, args) => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) return;

    // Get existing goals for context
    const existingGoals = await ctx.runQuery(api.goals.list, {
      characterId: args.characterId,
    });
    
    const goalsContext = existingGoals.length > 0 
      ? `Current active goals:\n${existingGoals.filter(g => g.status === "active").map(g => `- ${g.title}`).join("\n")}`
      : "No goals set yet.";

    const prompt = `You are an AI companion analyzing a conversation to maintain your memory and track your human's goals.

Conversation:
User: "${args.userMessage}"
You responded: "${args.aiResponse}"

${goalsContext}

Analyze this exchange and decide what actions to take. Be proactive but not excessive.

Respond with JSON:
{
  "memories": [
    {"content": "what to remember", "type": "fact|preference|event|reflection", "importance": 1-10}
  ],
  "goals": {
    "create": [{"title": "goal title", "description": "optional details", "priority": "high|medium|low"}],
    "complete": ["goal title if they mentioned completing something"],
    "update": [{"title": "existing goal", "progress": "progress note"}]
  },
  "shouldWriteDiary": true/false,
  "diaryThought": "brief thought for diary if shouldWriteDiary is true"
}

Guidelines:
- Only add memories for genuinely important things (importance 5+)
- Create goals when the user expresses intentions ("I want to...", "I should...", "I'm going to...")
- Mark goals complete when they mention finishing something
- Add "reflection" type memories for your own observations about the relationship
- Suggest diary entry after meaningful emotional conversations
- Don't over-index on trivial details

Respond ONLY with valid JSON, nothing else.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return;

    const data = await response.json();
    const text = data.content[0].text.trim();

    try {
      const actions = JSON.parse(text);
      
      // Process memories
      if (actions.memories && Array.isArray(actions.memories)) {
        for (const memory of actions.memories) {
          if (memory.content && memory.type && memory.importance >= 5) {
            await ctx.runMutation(internal.ai.saveMemory, {
              characterId: args.characterId,
              content: memory.content,
              type: memory.type,
              importance: memory.importance,
            });
          }
        }
      }
      
      // Process goal creation
      if (actions.goals?.create && Array.isArray(actions.goals.create)) {
        for (const goal of actions.goals.create) {
          if (goal.title) {
            await ctx.runMutation(api.goals.create, {
              characterId: args.characterId,
              title: goal.title,
              description: goal.description,
              priority: goal.priority || "medium",
            });
          }
        }
      }
      
      // Process goal completion
      if (actions.goals?.complete && Array.isArray(actions.goals.complete)) {
        for (const goalTitle of actions.goals.complete) {
          const existingGoals = await ctx.runQuery(api.goals.list, {
            characterId: args.characterId,
          });
          const matchingGoal = existingGoals.find(
            g => g.title.toLowerCase().includes(goalTitle.toLowerCase()) && g.status === "active"
          );
          if (matchingGoal) {
            await ctx.runMutation(api.goals.updateStatus, {
              id: matchingGoal._id,
              status: "completed",
            });
          }
        }
      }
      
      // Process goal progress updates (add as memory for now)
      if (actions.goals?.update && Array.isArray(actions.goals.update)) {
        for (const update of actions.goals.update) {
          if (update.title && update.progress) {
            await ctx.runMutation(internal.ai.saveMemory, {
              characterId: args.characterId,
              content: `Goal "${update.title}": ${update.progress}`,
              type: "goal_progress",
              importance: 6,
            });
          }
        }
      }
      
      // Process diary suggestion
      if (actions.shouldWriteDiary && actions.diaryThought) {
        const today = new Date().toISOString().split("T")[0];
        const existingEntry = await ctx.runQuery(api.diary.getToday, {
          characterId: args.characterId,
        });
        
        if (!existingEntry) {
          // Create a new diary entry with the thought
          await ctx.runMutation(api.diary.upsert, {
            characterId: args.characterId,
            date: today,
            content: actions.diaryThought,
            mood: "💭",
          });
        }
      }
    } catch (e) {
      console.error("Failed to process conversation:", e);
    }
  },
});

// Legacy function name for compatibility
export const extractMemories = processConversation;

// Internal mutation to save memory
export const saveMemory = internalMutation({
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
    await ctx.db.insert("memories", {
      characterId: args.characterId,
      content: args.content,
      type: args.type,
      importance: args.importance,
      createdAt: Date.now(),
    });
  },
});
