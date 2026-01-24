-- Create shop_products table to track availability
create table if not exists public.shop_products (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    shop_id uuid references public.shops(id) on delete cascade not null,
    product_id uuid not null, -- references products(id) but products table might be loosely defined if seeded from JSON, assuming UUID
    is_available boolean default true,
    unique(shop_id, product_id)
);

-- Enable RLS
alter table public.shop_products enable row level security;

-- Create policy to allow read access for everyone
create policy "Enable read access for all users" on public.shop_products
    for select using (true);

-- Create policy to allow write access for authenticated users (admins)
create policy "Enable write access for authenticated users only" on public.shop_products
    for all using (auth.role() = 'authenticated');
