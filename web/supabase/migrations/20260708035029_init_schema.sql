-- Core tables

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now()
);

create table drinks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id),
  name_ko text not null,
  name_en text,
  slug text not null,
  size text,
  temperature text check (temperature in ('hot','ice')),
  created_at timestamptz default now(),
  unique (brand_id, slug, size, temperature)
);

create table drink_nutrition (
  id uuid primary key default gen_random_uuid(),
  drink_id uuid references drinks(id),
  caffeine_mg numeric,
  calories_kcal numeric,
  sugar_g numeric,
  sodium_mg numeric,
  allergens text[],
  source_url text not null,
  checked_at date not null
);

create table user_drink_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  drink_id uuid references drinks(id),
  consumed_at timestamptz default now()
);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  drink_id uuid references drinks(id),
  created_at timestamptz default now()
);

create table user_settings (
  user_id uuid primary key references auth.users(id),
  daily_limit_mg numeric default 400,
  bedtime time default '23:00',
  sensitivity text default 'normal' check (sensitivity in ('low','normal','high'))
);

create table user_roles (
  user_id uuid primary key references auth.users(id),
  role text not null default 'member' check (role in ('member','admin'))
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Admin check helper (security definer so it can read user_roles regardless of caller's RLS)

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- RLS

alter table brands enable row level security;
alter table drinks enable row level security;
alter table drink_nutrition enable row level security;
alter table user_drink_logs enable row level security;
alter table favorites enable row level security;
alter table user_settings enable row level security;
alter table user_roles enable row level security;
alter table blog_posts enable row level security;

-- brands / drinks / drink_nutrition: public read, admin write
create policy "brands_public_read" on brands for select using (true);
create policy "brands_admin_write" on brands for all using (is_admin()) with check (is_admin());

create policy "drinks_public_read" on drinks for select using (true);
create policy "drinks_admin_write" on drinks for all using (is_admin()) with check (is_admin());

create policy "drink_nutrition_public_read" on drink_nutrition for select using (true);
create policy "drink_nutrition_admin_write" on drink_nutrition for all using (is_admin()) with check (is_admin());

-- user-owned tables
create policy "user_drink_logs_own" on user_drink_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "favorites_own" on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_settings_own" on user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_roles: users can read their own role, admins can read all; no client-side writes
-- (first admin is assigned manually in the Supabase dashboard using the service role)
create policy "user_roles_read_own_or_admin" on user_roles for select
  using (auth.uid() = user_id or is_admin());

-- blog_posts: public read of published posts, admins can read/write everything
create policy "blog_posts_public_read_published" on blog_posts for select
  using (status = 'published' or is_admin());
create policy "blog_posts_admin_write" on blog_posts for all
  using (is_admin()) with check (is_admin());
