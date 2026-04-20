# Portfolio V1

Single-page React + TypeScript portfolio built with Vite.

## Scripts

- `npm run dev` - Start Vite dev server.
- `npm run build` - Type-check and build for production.
- `npm run lint` - Run ESLint.
- `npm run preview` - Preview production build.

## Contact Messaging (No Redirect)

The contact form now submits to an API endpoint and does not open an email client.

Submission flow:
1. Browser posts to `/api/contact` (or `VITE_CONTACT_ENDPOINT` if set).
2. API validates and sanitizes payload.
3. API writes message to Supabase.
4. API sends notification email through Resend.

## Setup

### 1. Supabase table

Run SQL in your Supabase SQL editor:

- `supabase/contact_messages.sql`

### 2. Resend sender

Create a Resend API key and verify a sender/domain.

For quick testing, `onboarding@resend.dev` works in development.

### 3. Environment variables

Copy `.env.example` values into your environment.

Required server-side vars:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Optional vars:
- `SUPABASE_CONTACT_TABLE` (default: `contact_messages`)
- `CONTACT_RATE_LIMIT_WINDOW_MS` (default: `60000`)
- `CONTACT_RATE_LIMIT_MAX` (default: `8`)
- `VITE_CONTACT_ENDPOINT` (default: `/api/contact`)

## Local development notes

This repo uses Vite for frontend dev and Vercel Serverless format for API (`api/contact.ts`).

Recommended local full-stack test:
1. Add env vars to local environment.
2. Run with Vercel dev tooling so `/api/contact` is available.
3. Submit the contact form and verify:
   - no redirect happens
   - a row appears in Supabase
   - a notification email is delivered

If you only run `npm run dev`, Vite serves frontend assets but does not run Vercel serverless functions by itself.

## Deploy (Vercel)

1. Import repo into Vercel.
2. Add all required environment variables in project settings.
3. Deploy.
4. Smoke test form submission in production.

## Troubleshooting

- `Contact service is not configured yet`:
  Missing server env variables in Vercel.
- `Message failed to send`:
  Check function logs for Supabase or Resend API errors.
- Too many requests error (`429`):
  Rate limiter hit. Increase `CONTACT_RATE_LIMIT_MAX` for your needs.
