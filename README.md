# Nexus

Your personal AI that actually knows you. A PKM (Personal Knowledge Management) system with an AI that has persistent memory and personality.

## Features

- **Save anything**: Text notes, YouTube videos (with transcripts), articles, Instagram/TikTok links, images
- **Chat with your AI**: Ask questions about your saved content
- **Semantic search**: Find things by meaning, not just keywords
- **Persistent memory**: Your AI remembers conversations and context
- **Personality**: Customize your AI's name and vibe

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Convex (real-time, vector search)
- **UI**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI (embeddings + chat)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Ishnoor-Singh/nexus.git
cd nexus
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex
- Create a new project
- Generate the `.env.local` file with your Convex URL

### 3. Add OpenAI API key

Add to `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nexus/
├── convex/           # Backend (Convex functions)
│   ├── schema.ts     # Database schema
│   ├── notes.ts      # Note CRUD operations
│   ├── messages.ts   # Chat history
│   └── settings.ts   # AI personality settings
├── src/
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   │   └── ui/       # shadcn/ui components
│   └── lib/          # Utilities
└── ...
```

## Roadmap

- [x] Project setup
- [ ] Note capture (text, URL detection)
- [ ] YouTube transcript extraction
- [ ] Chat UI
- [ ] Semantic search (RAG)
- [ ] AI personality settings
- [ ] Article extraction
- [ ] Instagram/TikTok oEmbed
- [ ] Image upload + AI description

## License

MIT
