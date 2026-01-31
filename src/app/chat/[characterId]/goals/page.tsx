"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const priorityColors: Record<string, string> = {
  high: "text-red-400 bg-red-400/10 border-red-400/30",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  low: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

const statusIcons: Record<string, string> = {
  active: "🎯",
  completed: "✅",
  paused: "⏸️",
  abandoned: "❌",
};

export default function GoalsPage() {
  const { characterId } = useParams();
  const [showCreate, setShowCreate] = useState(false);
  const [newGoal, setNewGoal] = useState<{ title: string; description: string; priority: "high" | "medium" | "low"; dueDate: string }>({ title: "", description: "", priority: "medium", dueDate: "" });
  
  const character = useQuery(api.characters.get, { 
    id: characterId as Id<"characters"> 
  });
  
  const goals = useQuery(api.goals.list, {
    characterId: characterId as Id<"characters">,
  });
  
  const createGoal = useMutation(api.goals.create);
  const updateStatus = useMutation(api.goals.updateStatus);
  const deleteGoal = useMutation(api.goals.remove);

  const handleCreate = async () => {
    if (!newGoal.title.trim()) return;
    
    await createGoal({
      characterId: characterId as Id<"characters">,
      title: newGoal.title,
      description: newGoal.description || undefined,
      priority: newGoal.priority,
      dueDate: newGoal.dueDate || undefined,
    });
    
    setNewGoal({ title: "", description: "", priority: "medium", dueDate: "" });
    setShowCreate(false);
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const activeGoals = goals?.filter(g => g.status === "active") || [];
  const completedGoals = goals?.filter(g => g.status === "completed") || [];
  const otherGoals = goals?.filter(g => g.status === "paused" || g.status === "abandoned") || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link 
          href={`/chat/${characterId}`}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          ← Back to Chat
        </Link>
        
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: character.color + "20" }}
          >
            {character.emoji}
          </div>
          <div>
            <h1 className="font-semibold">Goals with {character.name}</h1>
            <p className="text-xs text-gray-400">
              {activeGoals.length} active • {completedGoals.length} completed
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + New Goal
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Create Goal Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">New Goal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">What do you want to achieve?</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Learn to cook 3 new recipes"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="More details about this goal..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Priority</label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as "high" | "medium" | "low" })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🔵 Low</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Due Date (optional)</label>
                    <input
                      type="date"
                      value={newGoal.dueDate}
                      onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newGoal.title.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>🎯</span>
              <span>Active Goals</span>
            </h2>
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <GoalCard 
                  key={goal._id} 
                  goal={goal} 
                  onStatusChange={(status) => updateStatus({ id: goal._id, status })}
                  onDelete={() => deleteGoal({ id: goal._id })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-400">
              <span>✅</span>
              <span>Completed</span>
            </h2>
            <div className="space-y-3 opacity-70">
              {completedGoals.map((goal) => (
                <GoalCard 
                  key={goal._id} 
                  goal={goal} 
                  onStatusChange={(status) => updateStatus({ id: goal._id, status })}
                  onDelete={() => deleteGoal({ id: goal._id })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Paused/Abandoned Goals */}
        {otherGoals.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-400">
              <span>📦</span>
              <span>Archived</span>
            </h2>
            <div className="space-y-3 opacity-50">
              {otherGoals.map((goal) => (
                <GoalCard 
                  key={goal._id} 
                  goal={goal} 
                  onStatusChange={(status) => updateStatus({ id: goal._id, status })}
                  onDelete={() => deleteGoal({ id: goal._id })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {goals?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-gray-400">No goals yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Set goals and track your progress with {character.name}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

interface GoalCardProps {
  goal: {
    _id: Id<"goals">;
    title: string;
    description?: string;
    status: "active" | "completed" | "paused" | "abandoned";
    priority: "high" | "medium" | "low";
    dueDate?: string;
    createdAt: number;
    completedAt?: number;
  };
  onStatusChange: (status: "active" | "completed" | "paused" | "abandoned") => void;
  onDelete: () => void;
}

function GoalCard({ goal, onStatusChange, onDelete }: GoalCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 group relative">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatusChange(goal.status === "completed" ? "active" : "completed")}
          className="text-xl mt-0.5 hover:scale-110 transition-transform"
        >
          {statusIcons[goal.status]}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${goal.status === "completed" ? "line-through text-gray-500" : ""}`}>
            {goal.title}
          </p>
          {goal.description && (
            <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[goal.priority]}`}>
              {goal.priority}
            </span>
            {goal.dueDate && (
              <span className="text-xs text-gray-500">
                Due: {new Date(goal.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 p-1 transition-all"
          >
            ⋮
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-32 z-10">
              {goal.status !== "active" && (
                <button
                  onClick={() => { onStatusChange("active"); setShowActions(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-700"
                >
                  🎯 Reactivate
                </button>
              )}
              {goal.status === "active" && (
                <button
                  onClick={() => { onStatusChange("paused"); setShowActions(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-700"
                >
                  ⏸️ Pause
                </button>
              )}
              <button
                onClick={() => { onDelete(); setShowActions(false); }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-700 text-red-400"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
