# BrandAI — AI Marketing Assistant

> An AI-powered marketing content generator that helps brands create compelling marketing material from product images and brand details.

![BrandAI](https://img.shields.io/badge/AI-Powered-9f6eff?style=flat-square) ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square) ![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square) Gorq API

## Live Demo link

---

## Features

- **Product Upload** — Images (PNG, JPG, WebP) and videos with drag & drop support
- **AI Product Analysis** — Brand tone, category detection, audience insights, platform recommendations
- **Content Generation** — Instagram captions (3 styles), ad copy (3 platforms), 5 hooks, CTA suggestions, hashtag strategy
- **Creative Ideas** — Reel concepts with viral scoring, carousel breakdowns, full campaign strategies, content calendar
- **Dashboard** — All projects overview with stats, saved outputs management
- **Save & Export** — Bookmark content pieces, copy to clipboard, export all

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + custom CSS variables |
| Backend | Node.js + Express |
| AI | Groq (llama-3.3-70b-versatile) — Free tier available |
| File Handling | Multer (multipart uploads) |
| Fonts | Google Fonts (Syne + DM Sans) |

---

## Setup

### Prerequisites
- Node.js 18+
- A Groq API key — FREE at https://console.groq.com

### 1. Clone / Unzip the project

```bash
cd ai-marketing-agent
```

### 2. Setup the Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm start
```

The backend runs on **http://localhost:5000**

### 3. Setup the Frontend

```bash
cd frontend
cp .env.example .env.local
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

The frontend runs on **http://localhost:3000**

### 4. Open the app

Visit **http://localhost:3000** and start creating!

---

## AI Workflow

```
User Input (image + brand details)
          ↓
   POST /api/analyze
          ↓
   Claude Vision + Text Analysis
   → Product category detection
   → Brand tone profiling
   → Audience segmentation
   → Platform recommendations
   → Competitive advantage
   → Emotional triggers
          ↓
   Project stored in memory (projectId returned)
          ↓
   POST /api/generate-content
          ↓
   Claude Copywriting
   → 3x Instagram captions (Storytelling, Question, Bold)
   → 3x Ad copy (Facebook/Instagram, Google, LinkedIn)
   → 5x Hooks (Curiosity, Problem, Shock, Social Proof, Story)
   → CTA suggestions with urgency levels
   → Hashtag strategy (primary, niche, trending, brand)
          ↓
   POST /api/generate-creative
          ↓
   Claude Creative Director
   → 3x Reel ideas (with viral potential scoring)
   → 3x Carousel ideas (with slide breakdowns)
   → 3x Campaign strategies (with budget tiers)
   → 4-week content calendar
```

---

## Project Structure

```
ai-marketing-agent/
├── backend/
│   ├── server.js          # Express API + Claude integration
│   ├── package.json
│   ├── .env.example
│   └── uploads/           # Auto-created for uploaded files
│
└── frontend/
    ├── app/
    │   ├── page.tsx           # New Project form (homepage)
    │   ├── dashboard/
    │   │   └── page.tsx       # Dashboard + saved outputs
    │   ├── project/[id]/
    │   │   └── page.tsx       # Project detail (analysis, content, creative)
    │   ├── components/
    │   │   └── Sidebar.tsx    # Navigation sidebar
    │   └── globals.css        # Design system + custom styles
    ├── lib/
    │   └── api.ts             # Centralized API calls
    ├── .env.example
    └── next.config.ts
```

---

## Design System

The UI uses a luxury marketing aesthetic:
- **Color palette**: Deep navy backgrounds with violet, pink, gold, cyan, and green accents
- **Typography**: Syne (display) + DM Sans (body)
- **Gradient brand**: `135deg, #9f6eff → #ff4d8d → #f5c842`
- **Cards**: Subtle glass effect with glow on hover
- **Animated background blobs** for depth

---

## Future Improvements

- [ ] PostgreSQL / Supabase for persistent storage
- [ ] User authentication (Clerk / NextAuth)
- [ ] Video analysis support with frame extraction
- [ ] AI image generation for visual mockups
- [ ] Scheduled content publishing (Buffer / Hootsuite API)
- [ ] A/B testing framework for ad copy
- [ ] Multi-language content generation
- [ ] PDF export of full marketing kit
- [ ] Competitor analysis integration
- [ ] Performance analytics from connected ad platforms

---

## Built with Claude

This application uses Anthropic's Claude Sonnet model for all AI tasks. Claude analyzes product images using vision capabilities and generates contextually appropriate marketing content based on brand personality and target audience.

---

*Built for Vaij & Company Internship Assignment*
