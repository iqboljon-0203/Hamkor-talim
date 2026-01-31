-- ============================================
-- profiles jadvali uchun Database Trigger yaratish
-- ============================================

-- MUAMMO: signUp paytida profile yaratilayotganda auth.uid() null bo'lishi mumkin
-- YECHIM: Database trigger yordamida profile'ni avtomatik yaratish

-- ============================================
-- 1. Mavjud trigger'ni o'chirish (agar bor bo'lsa)
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- ============================================
-- 2. Function yaratish (profile'ni avtomatik yaratish uchun)
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Trigger yaratish (auth.users jadvalida yangi foydalanuvchi yaratilganda)
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 4. TEKSHIRISH
-- ============================================

-- Trigger'ni ko'rish
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Function'ni ko'rish
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

