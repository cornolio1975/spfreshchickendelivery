-- 1. Profiles Table (Extends Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  phone text,
  role text default 'customer', -- 'admin' or 'customer'
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  price decimal not null,
  unit text not null,
  image text,
  description text,
  options text[], -- Array of strings
  in_stock boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  status text default 'pending', -- pending, processing, delivered, cancelled
  total decimal not null,
  delivery_fee decimal,
  delivery_address text not null,
  contact_number text,
  items jsonb, -- Store items snapshot
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- 5. Create Policies

-- Profiles: Users can read/update their own profile
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Products: Everyone can read, only Admins can modify
create policy "Public can view products" on public.products
  for select using (true);

create policy "Admins can insert products" on public.products
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update products" on public.products
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete products" on public.products
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Orders: Users can read their own, Admins can read all
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Admins can view all orders" on public.orders
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can create orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- 6. Storage (Optional - for Product Images)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
