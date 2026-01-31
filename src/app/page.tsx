import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  
  // Redirect signed-in users to dashboard
  if (userId) {
    redirect("/dashboard");
  }
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🪽</span>
            <span className="font-semibold text-lg">Saphira</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Create Your AI
            <span className="text-blue-500"> Familiar</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Build AI companions with personality, memory, and goals. 
            Each familiar remembers your conversations and grows with you.
          </p>
          
          <div className="pt-6">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard"
                className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="font-semibold text-lg mb-2">Memory System</h3>
            <p className="text-gray-400">
              Your familiar remembers important facts, preferences, and events from your conversations.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="font-semibold text-lg mb-2">Unique Soul</h3>
            <p className="text-gray-400">
              Define their personality, voice, and quirks. Each familiar is truly one-of-a-kind.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Goals & Diary</h3>
            <p className="text-gray-400">
              Track goals together and let your familiar reflect on conversations in their diary.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
