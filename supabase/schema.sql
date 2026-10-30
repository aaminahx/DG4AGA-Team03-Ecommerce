-- DG4AGA starter foundation. Run in a new Supabase project's SQL Editor.
-- It intentionally creates only categories, products and protected profiles.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  description text not null check (char_length(description) between 10 and 1000),
  price numeric(10,2) not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 2 and 80),
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;

-- Make the script safe to run again during setup or troubleshooting.
drop policy if exists "Public can view categories" on public.categories;
drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Public can view categories" on public.categories for select using (true);
create policy "Public can view active products" on public.products for select using (is_active = true);
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

-- Supabase API roles need table privileges as well as Row Level Security
-- policies. These grants permit only the starter's intended read access;
-- the policies above still determine which rows each role may see.
grant usage on schema public to anon, authenticated;
grant select on table public.categories, public.products to anon, authenticated;
grant select on table public.profiles to authenticated;

-- No profile update or administrator write policy is supplied. Teams must
-- design those operations without allowing customers to promote themselves.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'New customer'), 'customer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.categories (name) values
  ('Repair and reuse'), ('Low-waste essentials')
on conflict (name) do nothing;

insert into public.products (category_id, name, description, price, stock_quantity)
select c.id, p.name, p.description, p.price, p.stock_quantity
from (values
  ('Repair and reuse', 'Demonstration repair kit', 'Example test product for validating the initial catalogue connection.', 18.00::numeric, 10),
  ('Low-waste essentials', 'Demonstration refill pack', 'Example test product that must be replaced by the team’s justified catalogue.', 7.50::numeric, 4)
) as p(category_name, name, description, price, stock_quantity)
join public.categories c on c.name = p.category_name
where not exists (select 1 from public.products existing where existing.name = p.name);

-- STUDENT WORK: design and justify secure schemas, constraints, policies and
-- workflows for baskets, orders, order items, reviews, returns, enquiries and
-- administrator operations. Never put a service-role key in browser code.
