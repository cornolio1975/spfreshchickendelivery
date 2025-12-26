-- Create shops table
create table if not exists public.shops (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    address text not null,
    lat text not null,
    lng text not null,
    is_active boolean default true
);

-- Enable RLS
alter table public.shops enable row level security;

-- Create policy to allow read access for everyone
create policy "Enable read access for all users" on public.shops
    for select using (true);

-- Create policy to allow insert/update/delete for authenticated users only (admins)
create policy "Enable write access for authenticated users only" on public.shops
    for all using (auth.role() = 'authenticated');

-- Seed default shops
insert into public.shops (name, address, lat, lng)
values 
    ('SP_FCD_SHOP01 (Kampung Jawa BT4)', 'Kampung Jawa BT4, Klang', '3.0286', '101.4892'), -- Approx lat/lng for Kg Jawa
    ('SP_FCD_SHOP02 (Jalan Jitu Sri Muda)', 'Jalan Jitu, Taman Sri Muda, Shah Alam', '3.0333', '101.5333'); -- Approx lat/lng for Sri Muda
