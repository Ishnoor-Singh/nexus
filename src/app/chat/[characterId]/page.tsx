"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { characterId } = useParams();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const character = useQuery(api.characters.get, { 
    id: characterId as Id<"characters"> 
  });
  
  const existingConversationId = useQuery(
    api.messages.getConversation,
    character ? { characterId: character._id } : "skip"
  );
  
  const createConversation = useMutation(api.messages.createConversation);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  
  useEffect(() => {
    if (existingConversationId === null && character) {
      createConversation({ characterId: character._id }).then(setConversationId);
    } else if (existingConversationId) {
      setConversationId(existingConversationId);
    }
  }, [existingConversationId, character, createConversation]);
  
  const messages = useQuery(
    api.messages.listMessages,
    conversationId ? { conversationId } : "skip"
  );
  
  const sendMessage = useMutation(api.messages.send);
  const generateResponse = useAction(api.ai.generateResponse);
  const resetCharacter = useMutation(api.characters.reset);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || !character) return;
    
    const userMessage = input.trim();
    setInput("");
    
    await sendMessage({
      conversationId,
      role: "user",
      content: userMessage,
    });
    
    setIsTyping(true);
    try {
      await generateResponse({
        conversationId,
        characterId: character._id,
        userMessage,
      });
    } catch (error) {
      console.error("Failed to generate response:", error);
      await sendMessage({
        conversationId,
        role: "assistant",
        content: "Sorry, I had trouble responding. Please try again!",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = async () => {
    if (!character) return;
    setIsResetting(true);
    try {
      await resetCharacter({ id: character._id });
      setConversationId(null);
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Failed to reset:", error);
    } finally {
      setIsResetting(false);
    }
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { href: `/chat/${characterId}/memories`, label: "Memories", icon: "🧠" },
    { href: `/chat/${characterId}/goals`, label: "Goals", icon: "🎯" },
    { href: `/chat/${characterId}/diary`, label: "Diary", icon: "📔" },
    { href: `/chat/${characterId}/soul`, label: "Soul", icon: "✨" },
  ];

  return (
    <div className="h-screen flex flex-col relative">
      {/* Subtle ambient glow */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${character.color}10, transparent)`,
        }}
      />
      
      {/* Header */}
      <header className="glass-subtle border-b border-[--border] px-4 py-3 flex items-center gap-4 relative z-20">
        <Link 
          href="/dashboard" 
          className="text-[--muted-foreground] hover:text-[--foreground] transition-colors flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </Link>
        
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ 
              backgroundColor: character.color + "20",
              boxShadow: `0 4px 20px ${character.color}30`
            }}
          >
            {character.emoji}
          </div>
          <div>
            <h1 className="font-semibold text-lg">{character.name}</h1>
            <p className="text-xs text-[--muted-foreground]">
              {character.soul.traits.slice(0, 3).join(" • ")}
            </p>
          </div>
        </div>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-[--muted-foreground] hover:text-[--foreground] 
                hover:bg-[--muted] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 text-sm text-[--muted-foreground] hover:text-[--error] 
              hover:bg-[--error]/10 rounded-lg transition-colors ml-1"
          >
            🔄 Re-hatch
          </button>
          <div className="ml-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-[--muted] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-12 bg-[--card] border border-[--border] rounded-xl shadow-xl py-2 min-w-48 z-50">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-[--muted] text-sm"
                  onClick={() => setShowMenu(false)}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="border-t border-[--border] my-2" />
              <button
                onClick={() => { setShowResetConfirm(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[--error]/10 text-sm text-[--error]"
              >
                <span>🔄</span>
                <span>Re-hatch</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[--card] border border-[--border] rounded-2xl p-6 max-w-md mx-4 animate-slideUp">
            <div className="text-4xl mb-4 text-center">{character.emoji}</div>
            <h2 className="text-xl font-semibold mb-2 text-center">Re-hatch {character.name}?</h2>
            <p className="text-[--muted-foreground] mb-6 text-center text-sm">
              This will clear all conversations, memories, and start fresh. 
              {character.name} will be reborn with no memory of your time together.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[--muted] hover:bg-[--border] rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 px-4 py-2.5 bg-[--error] hover:opacity-90 disabled:opacity-50 rounded-xl font-medium transition-colors"
              >
                {isResetting ? "Re-hatching..." : "Re-hatch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages?.length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <div 
              className="text-6xl mb-4 inline-block animate-float"
              style={{ filter: `drop-shadow(0 8px 24px ${character.color}40)` }}
            >
              {character.emoji}
            </div>
            <p className="text-[--muted-foreground] text-lg">
              Start chatting with {character.name}
            </p>
            <p className="text-[--muted-foreground] text-sm mt-2 opacity-60">
              They&apos;re excited to meet you!
            </p>
          </div>
        )}
        
        {messages?.map((msg, i) => (
          <div
            key={msg._id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} animate-slideUp`}
            style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s`, animationFillMode: 'both' }}
          >
            {msg.role !== "user" && (
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ 
                  backgroundColor: character.color + "20",
                  boxShadow: `0 2px 12px ${character.color}20`
                }}
              >
                {character.emoji}
              </div>
            )}
            
            <div
              className={`max-w-[75%] px-4 py-3 ${
                msg.role === "user"
                  ? "chat-bubble-user text-white"
                  : "chat-bubble-assistant"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
            
            {msg.role === "user" && (
              <div className="w-9 h-9 rounded-xl bg-[--muted] flex items-center justify-center text-base flex-shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  "👤"
                )}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 animate-fadeIn">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
              style={{ backgroundColor: character.color + "20" }}
            >
              {character.emoji}
            </div>
            <div className="chat-bubble-assistant px-5 py-4">
              <div className="flex gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-subtle border-t border-[--border] p-4 relative z-10">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Message ${character.name}...`}
            className="flex-1 px-5 py-3.5 bg-[--card] border border-[--border] rounded-2xl 
              focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20 outline-none
              transition-all placeholder:text-[--muted-foreground]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="btn-primary px-6 py-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed
              disabled:transform-none disabled:shadow-none flex items-center gap-2"
          >
            <span>Send</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
