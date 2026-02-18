alter table business_settings
add column if not exists skin_choice_preference text default 'both';
