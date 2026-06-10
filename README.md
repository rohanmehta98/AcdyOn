# AcdyOn Academic Pathway Recommendation Engine

An AI-powered web application that analyses a user's academic background and career goals, then recommends the most suitable academic pathway — Certification Program, DBA, PhD, or Honorary Doctorate.

Built for the **AcdyOn Technical Internship Challenge**.

## Features

- AI-powered recommendations via **Groq (Llama 3.1)** with automatic rules-based fallback
- Multi-step form with real-time validation
- Submissions stored in **Supabase**
- Admin dashboard at `/submissions` with search and filter
- Fully responsive, mobile-friendly UI
- Loading states and comprehensive error handling

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| AI / Recommendations | Groq API — Llama 3.1 8B Instant |
| Deployment | Vercel |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
```

- **Supabase** — create a free project at [supabase.com](https://supabase.com)
- **Groq** — get a free API key at [console.groq.com](https://console.groq.com)

### 3. Set up the Supabase table

Run this SQL in your Supabase SQL editor:

```sql
create table submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  highest_qualification text not null,
  years_of_experience integer not null,
  current_profession text not null,
  career_goal text not null,
  recommendation text not null,
  recommendation_reason text not null,
  created_at timestamptz default now()
);
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── submit/route.ts       # POST — generate & store recommendation
│   │   └── submissions/route.ts  # GET — fetch all submissions
│   ├── form/page.tsx             # Recommendation form page
│   ├── submissions/page.tsx      # Admin submissions dashboard
│   ├── layout.tsx                # Root layout with nav & footer
│   ├── page.tsx                  # Homepage
│   └── globals.css
├── components/
│   ├── Form.tsx                  # Multi-field form with validation & result card
│   ├── RecommendationSection.tsx # Hero, How it works, Pathways sections
│   └── SubmissionsTable.tsx      # Filterable, searchable submissions table
└── lib/
    ├── ai-recommendation.ts      # Groq AI call with rules-based fallback
    ├── recommendation.ts         # Rules-based recommendation engine
    └── supabase.ts               # Supabase client + Submission type
```

## Recommendation Logic

The AI is prompted with the user's qualification, experience, profession, and career goal. It selects from four pathways:

| Pathway | Typical Profile |
|---|---|
| Certification Program | Early-career; skill-gap; practical credential needed |
| DBA | 5+ years experience; business/leadership goals |
| PhD | Research-oriented goals; Master's or above |
| Honorary Doctorate | 20+ years; distinguished career contributions |

If the Groq API is unavailable or the key is not set, the app falls back to the built-in rules engine automatically.

## Deployment

The app is configured for one-click deployment on **Vercel**. Set the four environment variables in the Vercel dashboard under Project → Settings → Environment Variables.
