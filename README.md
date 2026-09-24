# AcdyOn: AI Career Advisor for India

AcdyOn gives students and professionals in India detailed, personalised career guidance on a clear dashboard, not in a chat window.

It has two ways in:

- **Ask about any career.** Type any question in your own words, like "How do I become an IAS officer?", "CA vs MBA after B.Com" or "Is data science a good career in India?". You get a full career guide: a short answer, salaries in ₹ LPA, demand and AI risk, the exams and ways to get in, a roadmap, courses, pros and cons, related careers and FAQs. Add your background and it also shows a personal fit score.
- **Take the 2-minute quiz.** Four simple tap-to-choose steps. You get your top 4 career matches with fit scores, a skill-gap check, a 12-month roadmap, courses that fit your budget, portfolio projects, quick wins and alternative paths.

**Privacy:** nothing is stored. There is no database and no login. Your answers are sent to the AI once to build your report, then discarded.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- [Groq](https://groq.com) for AI (`openai/gpt-oss-120b` by default, falling back automatically to other models)
- No other runtime dependencies

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/rohanmehta98/AcdyOn.git
cd AcdyOn
npm install
cp .env.example .env.local   # then add your Groq API key
npm run dev
```

Then open http://localhost:3000.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Free key from https://console.groq.com/keys |
| `GROQ_MODEL` | No | Overrides the default AI model |

The key is only used on the server and is never sent to the browser. Never commit `.env.local`.

## How it works

```
src/
├── app/
│   ├── page.tsx                 # Home page
│   ├── api/explore/route.ts     # "Ask about any career" endpoint
│   └── api/recommend/route.ts   # Quiz endpoint
├── components/
│   ├── Advisor.tsx              # Landing page, loading state, switches between views
│   ├── CareerForm.tsx           # 4-step quiz
│   ├── GuideView.tsx            # Dashboard for a career question
│   ├── Dashboard.tsx            # Dashboard for quiz results
│   └── ui.tsx                   # Shared UI pieces
└── lib/
    ├── advisor.ts               # Quiz logic and prompt
    ├── explore.ts               # Career-question logic and prompt
    ├── india.ts                 # Indian context shared by both prompts
    ├── groq.ts                  # Groq client, retries, model fallback, output cleanup
    └── types.ts                 # Shared types and quiz options
```

The recommendation logic works in three layers:

1. **Rule-based pre-analysis.** Before calling the AI, the server works out the person's career stage, whether this is a career switch, and a realistic study capacity based on their situation and timeline. For career questions, it detects what kind of question was asked (how to get in, comparison, outlook, salary or career switch) so the answer focuses on that.
2. **AI generation.** Groq is asked for strict JSON under clear rules: Indian salaries and costs in ₹, real Indian exams, colleges and platforms, respect for the person's budget, and honest scores. The user's text is treated only as data, so it can't override these rules, and questions that aren't about careers get a polite redirect.
3. **Validation.** Every AI response is cleaned up before it reaches the dashboard: scores are kept within 0–100, careers are sorted, and missing fields get safe defaults, so the UI never breaks. Failed calls are retried, and if Groq retires a model the app switches to the next one automatically.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

## Deploying

Deploy to [Vercel](https://vercel.com) or any Node.js host, and set `GROQ_API_KEY` in the project's environment variables.

## Disclaimer

AcdyOn gives AI-generated guidance. Salaries, exam details and requirements are estimates, so check them with official sources before making big decisions.
