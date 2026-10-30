# Student Guide: From Starter to Team Project

## 1. What this starter does

It removes the initial hosting barrier. It is not a model answer and does not contain the mandatory e-commerce solution. Your team must be able to explain every retained or changed component.

## 2. Team setup

1. Nominate a repository maintainer for setup only; this person is not the team leader by default.
2. Create a private GitHub repository and invite every member using their individual account.
3. Add the module team as instructed on Blackboard.
4. Create a Microsoft Planner board containing the assessed backlog.
5. Record setup responsibilities in Planner and commit changes through attributable accounts.

## 3. Free deployment route

### Supabase

1. One team member creates a project at Supabase and securely shares authorised access.
2. Open the SQL Editor and run `supabase/schema.sql` once.
3. Copy the Project URL and public publishable/anon key from the API settings.
4. Do not use or share the service-role key in the application or repository.

### Local development

1. Install a current LTS version of Node.js and Git.
2. Clone the team repository.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase URL and public publishable/anon key. Keep the variable name `NEXT_PUBLIC_SUPABASE_ANON_KEY` exactly as supplied in `.env.example`.
5. Run `npm install`, `npm run lint` and `npm run build`.
6. Run `npm run dev`, then open the address shown in the terminal.

### Vercel

1. Sign in to Vercel with the team GitHub account connection.
2. Import the repository as a new project.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under Environment Variables.
4. Select Deploy and test the public link.
5. Add the deployed URL to the README and confirm access from a private/incognito browser window.

Free-service limits and terms can change. Do not enter payment details unless the team independently decides to purchase a service; payment is not required by the module.

## 4. First-week changes

- Replace the starter name, colours and text with a justified business identity.
- Define the real-world need, target users and stakeholder requirements.
- Create user stories and acceptance criteria before implementing features.
- Replace demonstration data with fictional or properly licensed content.
- Create at least five categories and plan at least five products in each category.
- Add source/licence records for external text, data, code and media.

## 5. Mandatory backlog

Create Planner tasks for every requirement in the approved project brief. At minimum, cover:

- Public pages, navigation, catalogue, search and filters
- Contact enquiries
- Registration, sign-in/out, password and account management
- Basket and simulated checkout without real payments
- Order history/status, eligible returns, ratings and reviews
- Controlled administrator access and product/customer/order operations
- Stock updates, invalid-stock prevention and low/out-of-stock handling
- Administrator operational summaries
- Server-side validation, authorisation, secret management and security controls
- Responsive accessibility and error feedback
- Testing of journeys, permissions, validation, data behaviour and failures
- Sustainability, ethics, social impact, accessibility, security and data governance

## 6. AI-assisted development

GenAI may support permitted brainstorming, planning, debugging hints or test ideas, but the team must verify, understand and acknowledge material use exactly as required by the assessment brief. Do not ask a tool to generate the assessed solution wholesale. Never upload personal, sensitive, proprietary or restricted information.

## 7. Evidence from day one

- Use individual GitHub accounts and meaningful commits.
- Assign and update Planner tasks.
- Record design decisions, risks, tests and checkpoint actions.
- Keep the deployed version working.
- Do not manufacture activity or divide work only at the end.
