
-- Check whether the signed-in user is an admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin()
from public, anon;

grant execute on function public.is_admin()
to authenticated;

-- Admins may view inactive products too.
drop policy if exists "Admins view products"
on public.products;

create policy "Admins view products"
on public.products
for select
to authenticated
using ((select public.is_admin()));

-- Admins can create products.
drop policy if exists "Admins create products"
on public.products;

create policy "Admins create products"
on public.products
for insert
to authenticated
with check ((select public.is_admin()));

-- Admins can edit products.
drop policy if exists "Admins update products"
on public.products;

create policy "Admins update products"
on public.products
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant insert, update on public.products
to authenticated;
