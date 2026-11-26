-- DG4AGA starter foundation. Run in a new Supabase project's SQL Editor.
-- It creates the catalogue, protected profiles and product review records.

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

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null check (char_length(user_name) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 3 and 120),
  comment text not null check (char_length(comment) between 10 and 2000),
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_created_idx
  on public.product_reviews (product_id, created_at desc);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 2 and 80),
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_reviews enable row level security;
alter table public.profiles enable row level security;

-- Make the script safe to run again during setup or troubleshooting.
drop policy if exists "Public can view categories" on public.categories;
drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Public can view product reviews" on public.product_reviews;
drop policy if exists "Guests can submit product reviews" on public.product_reviews;
drop policy if exists "Customers can submit product reviews" on public.product_reviews;
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Public can view categories" on public.categories for select using (true);
create policy "Public can view active products" on public.products for select using (is_active = true);
create policy "Public can view product reviews" on public.product_reviews
  for select using (true);
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

-- Supabase API roles need table privileges as well as Row Level Security
-- policies. These grants permit only the starter's intended read access;
-- the policies above still determine which rows each role may see.
grant usage on schema public to anon, authenticated;
grant select on table public.categories, public.products, public.product_reviews to anon, authenticated;
grant select on table public.profiles to authenticated;
revoke insert on table public.product_reviews from anon, authenticated;

create or replace function public.submit_product_review(
  p_product_id uuid,
  p_user_name text,
  p_rating smallint,
  p_title text,
  p_comment text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  is_verified_purchase boolean := false;
  inserted_review public.product_reviews;
begin
  if current_user_id is not null
    and pg_catalog.to_regclass('public.orders') is not null
    and pg_catalog.to_regclass('public.order_items') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'order_items'
        and column_name = 'product_id'
    ) then
      execute
        'select exists (
           select 1
           from public.orders o
           join public.order_items oi on oi.order_id = o.id
           where o.user_id = $1 and oi.product_id::text = $2::text
         )'
        into is_verified_purchase
        using current_user_id, p_product_id;
    else
      execute
        'select exists (
           select 1
           from public.orders o
           join public.order_items oi on oi.order_id = o.id
           where o.user_id = $1
             and oi.product_name = (
               select p.name from public.products p where p.id = $2
             )
         )'
        into is_verified_purchase
        using current_user_id, p_product_id;
    end if;
  end if;

  insert into public.product_reviews (
    product_id,
    user_id,
    user_name,
    rating,
    title,
    comment,
    verified_purchase
  )
  values (
    p_product_id,
    current_user_id,
    p_user_name,
    p_rating,
    p_title,
    p_comment,
    is_verified_purchase
  )
  returning * into inserted_review;

  return pg_catalog.to_jsonb(inserted_review);
end;
$$;

revoke all on function public.submit_product_review(uuid, text, smallint, text, text)
  from public;
grant execute on function public.submit_product_review(uuid, text, smallint, text, text)
  to anon, authenticated;

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
