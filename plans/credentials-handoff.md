# Credentials Handoff Checklist

> **All services below are currently using dev/personal accounts.**
> The Plantar team must create their own accounts and rotate these credentials before any production use.

## Services to transfer

- [ ] **Turso** — Database (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)
- [ ] **Google Cloud Console** — OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] **OpenAI** — Plant identification LLM (OPENAI_API_KEY)
- [ ] **Uploadthing** — Image uploads (UPLOADTHING_TOKEN)
- [ ] **Vercel** — Hosting (transfer project ownership)
- [ ] **NEXTAUTH_SECRET** — Regenerate with `openssl rand -base64 32`

## Steps for each service

1. Team signs up for their own account
2. Creates new project/API keys
3. Updates `.env.local` (local) and Vercel env vars (production)
4. Old dev credentials are revoked

## When

Before any real student/teacher data enters the system.
