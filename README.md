# DG4AGA E-commerce Starter

This is a deliberately incomplete teaching scaffold for the 2026/27 DG4AGA Group Portfolio. It gives teams a common, free deployment route without completing the assessed e-commerce work.

## What is included

- A responsive Next.js starting interface
- A sample product catalogue
- Supabase connection helpers
- Basic sign-in plumbing
- A minimal database schema with Row Level Security
- A Vercel-compatible deployment structure

## What is not included

The team must design, implement, test, explain and evaluate the assessed work. This includes the business identity and full catalogue; search and filters; registration and account management; basket and simulated checkout; orders, returns and reviews; contact handling; administrator controls; inventory rules and summaries; testing; accessibility; security; responsible-practice evaluation; and any AI-enabled extension.

## Quick start

1. Create one team repository from this folder/template.
2. Create a free Supabase project and run `supabase/schema.sql` in its SQL Editor.
3. Copy `.env.example` to `.env.local` and enter the project URL and public publishable/anon key.
4. Run `npm install`, `npm run lint`, `npm run build` and then `npm run dev`.
5. Follow `docs/STUDENT_GUIDE.md` before changing the code.
6. Import the repository into Vercel and add the same two environment variables.

Keep the environment-variable name `NEXT_PUBLIC_SUPABASE_ANON_KEY`, even when Supabase labels the copied value as a publishable key. Never commit `.env.local`, passwords, service-role keys or real personal/payment data.

## Important assessment boundary

Using this scaffold earns no credit by itself. Marks depend on the team’s justified choices, implementation, testing, evaluation, project evidence and individual contribution. Every team member remains responsible for understanding submitted code, including AI-assisted code.
