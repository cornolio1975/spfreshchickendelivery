alter table shops
add column if not exists skin_choice_preference text default 'both';
