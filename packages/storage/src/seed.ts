import { db } from './db'

const SEED_FLAG = 'micro-os-seeded'

export async function seedIfNeeded(): Promise<void> {
  if (localStorage.getItem(SEED_FLAG)) return

  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString()
  const dateStr = (n: number) =>
    new Date(now.getTime() - n * 86_400_000).toISOString().split('T')[0]!

  // ── Jobs ──────────────────────────────────────────────────────────────────
  await db.jobs.bulkAdd([
    {
      company: 'Stripe',
      role: 'Senior Full-Stack Engineer',
      status: 'applied',
      appliedAt: daysAgo(8),
      notes:
        '## Notes\n\nApplied via referral from a former colleague. Role focuses on the Payments API surface and internal tooling. Strong TypeScript culture.\n\n- Recruiter screen scheduled for next week\n- Prep: distributed systems, API design, React performance',
      url: 'https://stripe.com/jobs',
      salary: '$125k–$145k',
      contacts: [
        { name: 'Jordan Kim', linkedinUrl: 'https://linkedin.com/in/jordankim', role: 'Engineering Recruiter' },
      ],
    },
    {
      company: 'Vercel',
      role: 'Staff Engineer, Developer Experience',
      status: 'screen',
      appliedAt: daysAgo(14),
      notes:
        '## Notes\n\nFirst recruiter screen went well. Focused on DX philosophy and open-source contributions. Next step is a technical deep-dive with the DX team.\n\n- Prep: Next.js internals, edge runtime, Turborepo architecture',
      url: 'https://vercel.com/careers',
      salary: '$140k–$160k',
      contacts: [
        { name: 'Alex Rivera', linkedinUrl: 'https://linkedin.com/in/alexrivera', role: 'Talent Partner' },
        { name: 'Sam Chen', linkedinUrl: 'https://linkedin.com/in/samchen', role: 'Staff Engineer (interviewer)' },
      ],
    },
    {
      company: 'Anthropic',
      role: 'AI Application Engineer',
      status: 'technical',
      appliedAt: daysAgo(21),
      notes:
        '## Notes\n\nTwo rounds complete. Technical assessment involved building a streaming Claude integration with tool use. Final round is a system design interview.\n\n- Prep: Constitutional AI, RLHF concepts, production LLM patterns\n- Salary band confirmed at top of range',
      url: 'https://anthropic.com/careers',
      salary: '$150k–$175k',
      contacts: [
        { name: 'Morgan Lee', linkedinUrl: 'https://linkedin.com/in/morganlee', role: 'Recruiting Lead' },
        { name: 'Dr. Priya Nair', linkedinUrl: 'https://linkedin.com/in/priyanair', role: 'Senior Research Engineer' },
      ],
    },
  ])

  // ── Emails ────────────────────────────────────────────────────────────────
  await db.emails.bulkAdd([
    {
      subject: 'Re: Senior Full-Stack Engineer — Next Steps',
      from: 'jordan.kim@stripe.com',
      to: 'me@example.com',
      date: daysAgo(2),
      labels: ['recruiting', 'stripe'],
      threadId: 'thread-stripe-001',
      status: 'inbox',
      body: `Hi,\n\nThanks for applying to the Senior Full-Stack Engineer role at Stripe. I reviewed your application and I'd love to set up a 30-minute intro call to learn more about your background and share details about the team.\n\nAre you available any of these times next week?\n- Tuesday 10–11am PT\n- Wednesday 2–3pm PT\n- Thursday 11am–12pm PT\n\nLooking forward to connecting.\n\nBest,\nJordan Kim\nEngineering Recruiter, Stripe`,
    },
    {
      subject: 'Technical screen scheduled — Vercel Staff Engineer',
      from: 'recruiting@vercel.com',
      to: 'me@example.com',
      date: daysAgo(1),
      labels: ['recruiting', 'vercel'],
      threadId: 'thread-vercel-001',
      status: 'inbox',
      body: `Hi,\n\nGreat news — the team would like to move forward with a technical screen for the Staff Engineer, Developer Experience role.\n\nYour session is scheduled for:\nDate: ${dateStr(0)} at 2:00 PM PT\nDuration: 90 minutes\nFormat: Live coding + system design\n\nYou'll be working with Sam Chen and one other engineer from the DX team. The session will cover:\n1. A practical coding exercise (TypeScript, Node.js)\n2. System design: designing a build cache for a monorepo\n\nPlease confirm this time works for you.\n\nBest,\nAlex Rivera\nTalent Partner, Vercel`,
    },
  ])

  // ── Posts ─────────────────────────────────────────────────────────────────
  await db.posts.bulkAdd([
    {
      platform: 'linkedin',
      hook: 'I spent a weekend building a type-safe event bus in TypeScript. Here\'s what I learned about discriminated unions that changed how I think about inter-module communication.',
      content: `I spent a weekend building a type-safe event bus in TypeScript. Here's what I learned about discriminated unions that changed how I think about inter-module communication.\n\nThe problem: you have multiple modules that need to communicate without tight coupling. The naive solution is a string-keyed event emitter — but you lose all type safety at the call site.\n\nThe better approach: a discriminated union as your event contract.\n\n\`\`\`typescript\ntype AppEvent =\n  | { type: 'user:login'; userId: string }\n  | { type: 'cart:updated'; itemCount: number }\n  | { type: 'payment:complete'; orderId: string }\n\`\`\`\n\nNow your emit() and on() functions can be fully typed. The compiler tells you when you're emitting an event with the wrong payload shape — before it reaches production.\n\nThree things this pattern gives you:\n1. Autocomplete on event names — no more typos in string literals\n2. Payload type inference — the handler knows exactly what it receives\n3. Exhaustive handling — add a new event type and TypeScript flags every handler that doesn't account for it\n\nI've been using this pattern in a personal project and it's eliminated an entire class of runtime bugs.\n\nWhat patterns do you use for decoupled module communication?\n\n#TypeScript #SoftwareEngineering #WebDevelopment #JavaScript`,
      tags: ['typescript', 'software-engineering', 'patterns'],
      createdAt: daysAgo(3),
      status: 'draft',
      variants: [
        `TypeScript discriminated unions are underused for event systems.\n\nMost devs reach for string-keyed emitters and lose type safety at the boundary. Here's a pattern that keeps the compiler on your side throughout...\n\n[thread 🧵]`,
      ],
    },
  ])

  // ── Habits ────────────────────────────────────────────────────────────────
  const completionsForDaily = Array.from({ length: 4 }, (_, i) => dateStr(i + 1))
  const completionsForWeekly = [dateStr(7), dateStr(14)]

  await db.habits.bulkAdd([
    {
      name: 'Deep work block (2h)',
      frequency: 'daily',
      completions: completionsForDaily,
      streak: 4,
      createdAt: daysAgo(30),
    },
    {
      name: 'Weekly code review + refactor',
      frequency: 'weekly',
      completions: completionsForWeekly,
      streak: 2,
      createdAt: daysAgo(60),
    },
  ])

  localStorage.setItem(SEED_FLAG, 'true')
}
