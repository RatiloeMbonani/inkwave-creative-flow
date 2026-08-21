# INKWAVE AI

Where Ideas Make Waves.

INKWAVE AI is a full-stack, multi-modal AI content creation and automation platform. It takes a single idea and turns it into blogs, social posts, emails, images, videos, code, audio, and more—using a unified creative workflow: Idea → Prompt Optimization → AI Generation → Edit → Refine → Repurpose → Save → Export.

Built with [TanStack Start](https://tanstack.com/start), React 19, TypeScript, Tailwind CSS v4, and Lovable Cloud (Supabase).

**Live app:** https://inkwave-creative-flow.lovable.app

---

## Features

### Core Creation Tools
- **Blog Generator** — AI-generated blog posts with SEO title, headings, meta description, and suggested image prompts.
- **Social Media Generator** — Platform-specific content for LinkedIn, Instagram, TikTok, Facebook, and X.
- **Email Generator** — Professional, marketing, networking, follow-up, and custom emails.
- **Code Generator** — Generate, explain, debug, and improve code in JavaScript, TypeScript, React, Python, SQL, and more.
- **Image Generator** — Real AI image generation via a streaming gateway with tone, language, and platform presets.
- **Video Generator** — Real async video generation through Veo with job status polling and download.
- **Audio / Voice Generator** — Text-to-speech generation for narration, podcasts, and voiceovers.

### Workflow & Productivity
- **Prompt Optimizer** — Turn a basic idea into a structured, high-quality AI prompt.
- **Prompt Library** — Save, search, favorite, and reuse prompts with versioning.
- **Content Repurposing** — Transform one piece of content into multiple formats at once.
- **Project Management** — Organize all generated content into searchable, filterable projects.
- **Automation Workflows** — Build multi-step creative workflows and run them with status tracking.
- **Content Planner** — AI-generated content calendars for any niche and platform.
- **Analytics** — Real database-driven charts and stats across content types, platforms, and time ranges.
- **Global Search** — Search across projects, prompts, and generated content.
- **Notifications** — Toast feedback for saves, generations, and workflow events.

### UX
- **Dark & Light Mode** — Fully functional theme toggle with persistence and no hydration flash.
- **Responsive Design** — Works on desktop, laptop, tablet, and mobile.
- **Accessible Controls** — Semantic HTML, keyboard navigation, focus states, and labels.
- **Real AI, Real Data** — Every generation uses a backend AI gateway and persists to the database.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database / Auth | Lovable Cloud (Supabase) |
| Server Logic | `createServerFn` from `@tanstack/react-start` |
| Public API Routes | `src/routes/api/*` |
| AI Gateway | Lovable AI Gateway (text, image, video, audio) |
| UI Components | shadcn/ui |

---

## Project Structure

```
src/
  components/          # Reusable UI components (AppShell, ContentEditor, BrandMark, etc.)
  hooks/               # Custom hooks (useAuth, use-mobile)
  integrations/        # Supabase clients, auth middleware, attacher
  lib/                 # Application logic, server functions, prompts, markdown, export
  routes/              # TanStack file-based routes
    __root.tsx         # Root layout
    index.tsx          # Landing page
    auth.tsx           # Sign in / sign up / password reset
    _authenticated/    # Protected routes (requires auth)
      dashboard.tsx
      create.index.tsx
      create.$type.tsx
      studio.tsx
      prompts.tsx
      repurpose.tsx
      library.*.tsx
      projects.*.tsx
      analytics.tsx
      settings.tsx
      search.tsx
    api/               # Server-side API routes
      generate-image.ts
      generate-video.ts
styles.css             # Global theme tokens and Tailwind v4 config
supabase/              # Migrations and config
```

---

## Getting Started

### Prerequisites
- Node.js (v20+)
- `bun` or `npm`

### Install
```sh
git clone <repository-url>
cd inkwave-creative-flow
bun install
```

### Run Locally
```sh
bun run dev
```

Open http://localhost:8080.

### Environment Variables
The project expects a `.env` file at the root. Do not commit it to version control.

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

AI gateway and storage configuration are handled server-side; no frontend API keys are exposed.

---

## Key Workflows

1. **Create Content**
   - Click **Create** → choose a type (Blog, Social, Email, Image, Video, Code, Audio).
   - Enter your idea.
   - Click **Optimize Prompt** to refine it.
   - Click **Generate** to get AI output.
   - Edit, refine, repurpose, export, or save to a project.

2. **Generate Visuals**
   - Choose **Image** or **Video** from the Create page.
   - Select tone, language, and target platform.
   - Image generation streams a live preview; video generation polls job status.
   - Download the final asset or add it to a project.

3. **Repurpose**
   - Paste or select existing content.
   - Pick target formats (LinkedIn, Instagram, X, Email, Video Script, etc.).
   - Generate all variants at once and save them under a project.

4. **Automate**
   - Build workflows from a sequence of steps.
   - Run the workflow and track each step's status.
   - Retry any failed step.

---

## Database Schema

Core tables (managed via Lovable Cloud migrations):

- `profiles` — user profiles, linked to `auth.users`.
- `projects` — user-owned creative projects.
- `prompts` — saved and optimized prompts.
- `generated_content` — text, code, image, video, and audio outputs.
- `media` — metadata for generated images/videos/audio.
- `workflows` / `workflow_runs` — automation definitions and executions.
- `content_plans` — AI-generated content calendars.
- `notifications` — user notifications with read state.
- `usage` — analytics and usage tracking.

All tables use Row Level Security (RLS) so users can only access their own data.

---

## AI Provider Architecture

AI services are abstracted behind a provider-agnostic gateway:

- Text generation → configured via `src/lib/ai.server.ts`
- Image generation → `src/routes/api/generate-image.ts`
- Video generation → `src/routes/api/generate-video.ts`
- Audio generation → integrated via the same gateway pattern

This design allows swapping providers without changing route or component logic.

---

## Security & Best Practices

- Authentication and authorization via Supabase Auth + RLS.
- Password hashing handled by the auth provider.
- No API keys are exposed in the frontend.
- Server functions validate input with Zod.
- Confirmation dialogs for destructive actions.
- User data is strictly scoped per user.

---

## License

This project is built and owned by the creator. See the repository for license details.

---

Built with [Lovable](https://lovable.dev).
