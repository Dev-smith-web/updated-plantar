# Migration Plan: plant-explorer-ar + plantar-3d → Unified Next.js App

## Technology Choices

| Concern | Choice | Why |
|---------|--------|-----|
| **Database** | Turso (managed SQLite) | Free tier: 9GB, 25M reads/mo. No server. Works with React Native via HTTP. |
| **ORM** | Drizzle | Lightweight, no binary engine, native Turso support, serverless-friendly |
| **Auth** | Auth.js v5 (NextAuth) | Google OAuth + credentials fallback. Free. Role injection via session callback. |
| **File Storage** | Uploadthing | Free tier: 2GB. First-class Next.js integration. Simple setup. |
| **LLM** | OpenAI gpt-4o-mini via Vercel AI SDK | Cheapest multimodal model. `generateObject()` returns typed JSON via Zod schema. |
| **Hosting** | Vercel (free hobby plan) | Zero-config Next.js deploy. Serverless API routes. Preview deploys. |

### Why not Cloudflare/Railway?
- **Cloudflare Pages**: Next.js support requires `@opennextjs/cloudflare` adapter, still experimental — issues with middleware, ISR, image optimization
- **Railway**: Works but requires server management; Vercel is zero-config for Next.js

---

## Project Structure (target)

```
plantar-3d/                          # Use plantar-3d as the base
  app/
    (auth)/
      login/page.tsx                 # Landing + login (merges Landing.jsx)
      register/page.tsx
    (app)/
      layout.tsx                     # Bottom nav (from Layout.jsx)
      page.tsx                       # Home dashboard
      library/page.tsx               # PlantLibrary
      explorer/[id]/page.tsx         # PlantExplorer (dynamic route)
      quiz/page.tsx                  # Quiz
      scanner/page.tsx               # PlantScanner
      settings/page.tsx              # Settings
      teacher/page.tsx               # TeacherDashboard (role-protected)
    api/
      auth/[...nextauth]/route.ts
      plants/route.ts                # GET list, POST create
      plants/[id]/route.ts           # GET, PUT, DELETE
      plant-parts/route.ts
      plant-parts/[id]/route.ts
      quiz-questions/route.ts
      quiz-questions/[id]/route.ts
      quiz-results/route.ts
      quiz-results/[id]/route.ts
      upload/route.ts                # Uploadthing
      identify-plant/route.ts        # LLM plant ID
    layout.tsx                       # Root layout (providers)
    globals.css                      # Keep plantar-3d OKLch theme
  components/
    ui/                              # shadcn (keep plantar-3d's 57)
    3d/                              # R3F viewer (from plantar-3d)
      plant-scene.tsx
      plant-explorer-3d.tsx
      plant-info.tsx
      plant-selector.tsx
    app/                             # Ported from plant-explorer-ar
      bottom-nav.tsx
      install-prompt.tsx
      plant-part-info.tsx
      manage-plants.tsx
      manage-quizzes.tsx
      view-results.tsx
  lib/
    db/schema.ts                     # Drizzle schema
    db/index.ts                      # Turso client
    auth.ts                          # Auth.js config
    api-client.ts                    # Typed fetch wrappers
    utils.ts
  hooks/
    use-plants.ts                    # React Query hooks
    use-plant-parts.ts
    use-quiz.ts
    use-mobile.ts
  middleware.ts                      # Route protection
```

---

## Phase 0: Preparation

- Create branch `feat/merge-apps`
- Install deps: `drizzle-orm @libsql/client next-auth@beta @tanstack/react-query uploadthing @uploadthing/react ai @ai-sdk/openai framer-motion react-hook-form @hookform/resolvers zod`
- Dev deps: `drizzle-kit`
- Remove premature RN deps from plantar-3d (`expo`, `react-native`, `expo-gl`, etc.)
- Create `.env.local` with: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, `UPLOADTHING_TOKEN`

## Phase 1: Database Schema

Create `lib/db/schema.ts` with Drizzle tables:
- **users**: id, name, email, emailVerified, image, role (student/teacher/admin), password
- **plants**: id, name, scientificName, description, funFacts (JSON), imageUrl, color, createdBy (FK), createdAt, updatedAt
- **plantParts**: id, plantId (FK), partName, description, funFact, function, createdAt
- **quizQuestions**: id, plantId (FK), question, options (JSON), correctAnswer, difficulty, createdByTeacher, createdAt
- **quizResults**: id, userId (FK), studentName, score, totalQuestions, createdAt

Create `lib/db/index.ts` — Turso client + Drizzle instance.
Run `drizzle-kit push` to sync.

## Phase 2: Authentication

- `lib/auth.ts`: Auth.js config with Google OAuth + Credentials provider, Drizzle adapter, session callback injecting `role`
- `app/api/auth/[...nextauth]/route.ts`: catch-all handler
- `middleware.ts`: protect `(app)/` routes, redirect unauthenticated to `/login`
- `app/(auth)/login/page.tsx` and `register/page.tsx`: merge Landing.jsx with auth forms

**Base44 → Auth.js mapping:**
| Base44 | Auth.js |
|--------|---------|
| `base44.auth.isAuthenticated()` | `auth()` server / `useSession()` client |
| `base44.auth.me()` | `session.user` |
| `base44.auth.redirectToLogin()` | middleware redirect / `redirect("/login")` |
| `base44.auth.logout()` | `signOut()` from `next-auth/react` |

## Phase 3: API Routes (CRUD)

For each entity, create route handlers following this pattern:

`app/api/plants/route.ts` → GET (list/filter), POST (create)
`app/api/plants/[id]/route.ts` → GET, PUT, DELETE

Repeat for plant-parts, quiz-questions, quiz-results.

Create `lib/api-client.ts` with typed fetch wrappers:
```ts
export const plantApi = {
  list: () => fetch('/api/plants').then(r => r.json()),
  create: (data) => fetch('/api/plants', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  // ... update, delete, filter
}
```

Create React Query hooks in `hooks/` wrapping the API client.

## Phase 4: File Upload + LLM

- `app/api/upload/route.ts`: Uploadthing file router (image uploads, 4MB limit)
  - Replaces `base44.integrations.Core.UploadFile({ file })`
- `app/api/identify-plant/route.ts`: Vercel AI SDK `generateObject()` with gpt-4o-mini
  - Replaces `base44.integrations.Core.InvokeLLM({ prompt, file_urls, response_json_schema })`
  - Uses Zod schema for typed response

## Phase 5: Port Pages

For each page: copy JSX → convert to TSX → replace react-router with Next.js → replace Base44 calls with hooks.

| Source (plant-explorer-ar) | Target (Next.js) | Key changes |
|----------------------------|-------------------|-------------|
| `Landing.jsx` | `app/(auth)/login/page.tsx` | Merge with auth UI |
| `Home.jsx` | `app/(app)/page.tsx` | `useSession()` replaces `auth.me()` |
| `PlantLibrary.jsx` | `app/(app)/library/page.tsx` | `usePlants()` hook |
| `PlantExplorer.jsx` | `app/(app)/explorer/[id]/page.tsx` | Use R3F viewer from plantar-3d; `params.id` |
| `Quiz.jsx` | `app/(app)/quiz/page.tsx` | `useQuizQuestions()` + `useCreateQuizResult()` |
| `PlantScanner.jsx` | `app/(app)/scanner/page.tsx` | Uploadthing + `/api/identify-plant` |
| `TeacherDashboard.jsx` | `app/(app)/teacher/page.tsx` | Role guard; port sub-components |
| `Settings.jsx` | `app/(app)/settings/page.tsx` | `useSession()` + `signOut()` |

Port `Layout.jsx` bottom nav → `app/(app)/layout.tsx` using `usePathname()` instead of `useLocation()`.

For PlantExplorer specifically: replace imperative `PlantViewer3D.jsx` with plantar-3d's R3F `PlantScene.tsx`, adapted to accept dynamic plant data from DB.

## Phase 6: UI Polish

- Keep plantar-3d's shadcn components (Tailwind v4 + OKLch)
- Add any missing shadcn components plant-explorer-ar uses
- Add `public/manifest.json` for PWA
- Port `InstallPrompt` component

## Phase 7: Test + Deploy

- Seed DB with sample plants, parts, quiz questions
- Test all flows: auth, library, 3D explorer, scanner, quiz, teacher dashboard
- Deploy to Vercel, configure env vars in dashboard

---

## React Native Migration Path (future)

The architecture above is designed for this:
- **Shared**: API routes serve as backend for both web and mobile
- **Shared**: React Query hooks + api-client work in React Native (just `fetch()`)
- **Shared**: Zod schemas and TypeScript types
- **Not shared**: R3F (needs `expo-gl`), shadcn (needs NativeWind/Gluestack), Next.js routing

Future monorepo structure:
```
plantar/
  apps/web/        # Next.js (current)
  apps/mobile/     # Expo/React Native
  packages/
    api-client/    # Shared fetch + React Query hooks
    types/         # Shared TS types from Drizzle schema
```

---

## Verification

1. `pnpm dev` starts without errors
2. Register/login works (Google OAuth + credentials)
3. Unauthenticated users redirected to login
4. CRUD: create/edit/delete a plant from teacher dashboard, verify it appears in library
5. 3D explorer loads plant with interactive parts
6. Plant scanner: upload image → AI identification → save to library
7. Quiz: take quiz → results saved → visible in teacher dashboard
8. Settings: view profile, sign out
9. `pnpm build` succeeds
10. Deploy to Vercel, verify all routes work on production URL
