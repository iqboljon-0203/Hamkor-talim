-- ============================================
-- profiles jadvali uchun INSERT Policy Tuzatish
-- ============================================

-- MUAMMO: "new row violates row-level security policy for table \"profiles\""
-- SABAB: INSERT policy yo'q yoki noto'g'ri

-- ============================================
-- 1. Hozirgi policy'larni ko'rish
-- ============================================

SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- 2. Mavjud INSERT policy'ni o'chirish (agar bor bo'lsa)
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles: user can insert own profile" ON profiles;
DROP POLICY IF EXISTS "users can insert own profile" ON profiles;

-- ============================================
-- 3. To'g'ri INSERT policy yaratish
-- ============================================

-- Bu policy foydalanuvchilarga faqat o'z profilini yaratishga ruxsat beradi
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. Boshqa kerakli policy'larni tekshirish va yaratish
-- ============================================

-- SELECT policy (agar yo'q bo'lsa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
    AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

-- UPDATE policy (agar yo'q bo'lsa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
    AND cmd = 'UPDATE'
  ) THEN
    CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================
-- 5. O'qituvchilar uchun SELECT policy (agar yo'q bo'lsa)
-- ============================================

-- O'qituvchilar barcha talabalarning profil ma'lumotlarini ko'ra olishi uchun
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Teachers can view all student profiles'
  ) THEN
    CREATE POLICY "Teachers can view all student profiles"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (
      -- O'z profilini ko'ra oladi
      auth.uid() = id
      OR
      -- Yoki o'qituvchi bo'lsa, barcha talabalarning profil ma'lumotlarini ko'ra oladi
      (
        -- O'qituvchi ekanligini JWT dan olamiz (recursion bo'lmasligi uchun)
        COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'teacher'
        AND role = 'student'
      )
    );
  END IF;
END $$;

-- ============================================
-- 6. TEKSHIRISH
-- ============================================

-- Barcha policy'larni ko'rish
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname, cmd;

-- RLS yoqilganligini tekshirish
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Agar RLS yoqilmagan bo'lsa, yoqish:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

