# Guided Deployment Lab (75 minutes)

## Learning outcome

By the end, every team should have a repository, a connected persistent database and a public starter deployment. This is setup evidence, not completion of the assessment.

## Before the session

- Students can access GitHub, Supabase and Vercel.
- Each team has agreed who will operate the shared screen.
- Every member uses an individual GitHub identity.

## Activity sequence

### 0–10 minutes: establish ownership

- Confirm team number and repository name: `DG4AGA-TeamXX`.
- Invite all team members.
- Add a Planner card called `Deploy and verify starter foundation` with named contributors.

### 10–25 minutes: create the database

- Create a Supabase project.
- Run `supabase/schema.sql`.
- Use Table Editor to confirm categories and products exist.
- Identify why the public publishable/anon key may be used by the browser but the service-role key must not be exposed.

### 25–40 minutes: run locally

- Clone the repository.
- Create `.env.local` from `.env.example`.
- Run `npm install`, `npm run lint`, `npm run build` and `npm run dev`.
- Confirm that the catalogue shows database products rather than setup-mode products.

### 40–55 minutes: deploy

- Import the repository into Vercel.
- Add both public Supabase environment variables.
- Deploy and open the URL in an incognito window.

### 55–65 minutes: verify

- Check desktop and narrow/mobile layouts.
- Attempt sign-in with invalid details and inspect the feedback.
- Confirm that `.env.local` is not visible in GitHub.
- Save the deployed link in README and Planner.

### 65–75 minutes: define next work

- Create one user story and acceptance criteria for search/filtering.
- Add the remaining mandatory requirements to Planner.
- Assign research, design, data and development tasks across the team.
- Record one technical risk and one mitigation.

## Exit evidence

- Repository accessible to all team members
- Public deployment URL
- Connected Supabase tables
- No secret keys committed
- Planner setup card and next tasks
- One screenshot or short checkpoint note recording successful deployment
