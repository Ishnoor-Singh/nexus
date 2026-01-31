import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="glow-bg" />
      
      {/* Floating orbs for extra magic */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[--primary]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[--secondary]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-[--accent]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Header */}
      <header className="glass-subtle border-b border-[--border] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-pulse-glow transition-all">🪽</span>
            <span className="font-semibold text-lg">Saphira</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary px-5 py-2.5 rounded-xl font-medium">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="btn-secondary px-5 py-2.5 rounded-xl font-medium"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center space-y-8 animate-fadeIn">
          {/* Floating emoji */}
          <div className="text-7xl md:text-8xl animate-float mb-8" style={{ filter: 'drop-shadow(0 20px 40px rgba(139, 92, 246, 0.3))' }}>
            🥚
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Hatch Your Own
            <br />
            <span className="text-gradient">AI Familiar</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[--muted-foreground] max-w-2xl mx-auto leading-relaxed">
            Create companions that remember you, grow with you, and develop their own personality. 
            <span className="text-[--foreground]"> Not just AI — a relationship.</span>
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 group">
                  <span>Start Hatching</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard"
                className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg"
              >
                Go to Your Familiars
              </Link>
            </SignedIn>
          </div>
          
          <p className="text-sm text-[--muted-foreground] pt-4">
            ✨ Free to start • No credit card required
          </p>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-6">
          {[
            {
              emoji: "🧠",
              title: "They Remember",
              description: "Facts, preferences, inside jokes — your familiar builds a real memory of you over time.",
              color: "290",
            },
            {
              emoji: "💜",
              title: "They Grow",
              description: "Their personality evolves through your conversations. New traits, quirks, and perspectives emerge.",
              color: "320",
            },
            {
              emoji: "🎯",
              title: "They Care",
              description: "Set goals together. They'll check in, celebrate wins, and gently nudge you when you slip.",
              color: "200",
            },
          ].map((feature, i) => (
            <div 
              key={feature.title}
              className={`group p-8 rounded-2xl bg-[--card] border border-[--border] 
                hover:border-[--border-hover] transition-all duration-300 hover:-translate-y-2
                animate-slideUp stagger-${i + 1}`}
              style={{ animationFillMode: 'both' }}
            >
              <div 
                className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ filter: `drop-shadow(0 8px 16px oklch(0.5 0.2 ${feature.color} / 0.3))` }}
              >
                {feature.emoji}
              </div>
              <h3 className="font-semibold text-xl mb-3 group-hover:text-gradient transition-all">
                {feature.title}
              </h3>
              <p className="text-[--muted-foreground] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Archetypes preview */}
        <div className="mt-32 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Choose Your <span className="text-gradient">Starting Point</span>
          </h2>
          <p className="text-[--muted-foreground] mb-12 max-w-xl mx-auto">
            Pick an archetype that fits your needs. Your familiar will evolve beyond it.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "🐉", name: "Companion", desc: "Curious friend" },
              { emoji: "📓", name: "Journal Buddy", desc: "Daily reflection" },
              { emoji: "🎯", name: "Accountability", desc: "Goal tracker" },
              { emoji: "🧠", name: "Thinking Partner", desc: "Devil's advocate" },
            ].map((arch) => (
              <div 
                key={arch.name}
                className="p-6 rounded-xl bg-[--card]/50 border border-[--border] 
                  hover:bg-[--card] hover:border-[--border-hover] transition-all group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {arch.emoji}
                </div>
                <div className="font-medium">{arch.name}</div>
                <div className="text-sm text-[--muted-foreground]">{arch.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 text-center pb-16">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-[--primary]/10 to-[--accent]/10 border border-[--primary]/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to meet your familiar?
            </h2>
            <p className="text-[--muted-foreground] mb-8 max-w-lg mx-auto">
              They&apos;re waiting to hatch. All they need is you.
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary px-10 py-4 rounded-2xl font-semibold text-lg">
                  Create Your First Familiar
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard"
                className="btn-primary px-10 py-4 rounded-2xl font-semibold text-lg inline-block"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-[--border] py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[--muted-foreground]">
          <div className="flex items-center gap-2">
            <span>🪽</span>
            <span>Saphira</span>
          </div>
          <div>Made with 💜 for humans who want more from AI</div>
        </div>
      </footer>
    </div>
  );
}
