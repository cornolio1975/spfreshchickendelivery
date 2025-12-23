-- 1. Find your user ID by email (replace 'your_email@example.com' with your actual login email)
-- Then update the profiles table.

-- Or, if you are the only user, you can just update all profiles to admin (for development only).
UPDATE public.profiles
SET role = 'admin';

-- Alternatively, specifically for one email:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your_email@example.com');
