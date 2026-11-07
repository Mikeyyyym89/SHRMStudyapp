# SHRM Study Prep

A private study app for the **SHRM-CP** and **SHRM-SCP** certifications, built to share with friends. It helps you train with **flashcards**, a **question bank**, and **real-world HR scenario case studies** (situational-judgement style), each linked back to authoritative references.

> No backend, no database, no complex setup for your friends — it's a static site. Each person's progress is saved privately in their own browser.

## Courses included

| Exam | Certification |
|------|---------------|
| SHRM-CP | SHRM Certified Professional (operational HR) |
| SHRM-SCP | SHRM Senior Certified Professional (strategic HR) |

Both are organized around the six SHRM **BASK** study areas: **Leadership, Business, Interpersonal, People, Organization, Workplace**.

## Features

- **Home screen** — choose which certification you want.
- **Flashcards** — flip cards for key HR terms, mark the ones you know.
- **Question bank** — multiple-choice practice with instant feedback, explanations, and links to authoritative sources.
- **Case studies** — scenario-based situational-judgement questions, like the real exam.
- **Supporting docs** — curated references (SHRM, DOL, EEOC, NLRB, OSHA) per domain.
- **Progress tracking** — scores and "known" flashcards saved locally in the browser.
- **Access code gate** — the app is behind a shared code (see below).

## Quick start (local development)

```bash
npm install
npm run dev
```

Open http://localhost:3000 and enter the access code (default: `SHRMReady2026`).

To produce the static site locally:

```bash
npm run build   # outputs to ./out
```

## Deploying (free, easy, no server)

The app builds to a plain static site (`out/`), so it runs on any static host.

### Cloudflare Pages (recommended)

Direct upload from this machine:

```bash
npm run build
npx wrangler pages deploy out --project-name <project>
```

Or **connect to Git** in the Cloudflare dashboard (build command `npm run build`, output directory `out`) for auto-deploy on every push. Add **Cloudflare Access** if you want email/PIN invite gating on top of the built-in code.

### Vercel / Netlify

Vercel auto-detects Next.js. Netlify uses the included `netlify.toml` (build `npm run build`, publish `out`).

## The access code (shared-password gate)

Share **the link + the access code** with your friends. Default code: **`SHRMReady2026`**.

To change it, edit `src/lib/config.ts`:

1. Pick a new code, e.g. `StudyHR2026`.
2. Generate its hash: `printf 'StudyHR2026' | sha256sum`
3. Replace `ACCESS_CODE_HASH` with the hex output, then rebuild/redeploy.

> ⚠️ This is a **soft gate**, not real security. The content is bundled into the app, so a determined visitor can bypass it. For true privacy, put **Cloudflare Access** in front of the app.

## Keeping content up to date

All study content lives in **versioned JSON files** under `src/content/`. Updating is edit → commit → push (redeploys).

```
src/content/
├── courses.json            # course list & metadata
├── shrm-cp/
│   ├── flashcards.json     # { term, definition, domain }[]
│   ├── questions.json      # practice questions + explanations + reference links
│   ├── case-studies.json   # scenarios (situational judgement) + questions
│   └── docs.json           # supporting references grouped by domain
└── shrm-scp/  (same 4 files)
```

A question looks like:

```json
{
  "id": "shrm-cp-q21",
  "domain": "Workplace",
  "prompt": "Which law requires reasonable accommodation...?",
  "options": ["ADA", "FLSA", "COBRA", "HIPAA"],
  "answer": 0,
  "explanation": "The ADA requires...",
  "docs": [{ "label": "EEOC", "url": "https://www.eeoc.gov/" }]
}
```

- `answer` is the **zero-based index** of the correct option.
- `docs` are the supporting references shown when a user misses the question.

## Content sourcing

All questions are **original** and grounded in the publicly documented SHRM BASK and U.S. employment law (DOL, EEOC, NLRB, OSHA). No braindump or paid-prep content is reproduced.

## Tech

Next.js (App Router) + React + Tailwind CSS, exported as a fully static site.
