-- Reset password for admin user using bcrypt (same hash Supabase Auth uses).
UPDATE auth.users
SET
  encrypted_password = crypt('12345678', gen_salt('bf')),
  updated_at = now()
WHERE email = 'opps003@gmail.com';