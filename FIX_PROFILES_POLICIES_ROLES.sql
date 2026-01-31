-- ============================================
-- profiles jadvali policy'larini to'g'rilash
-- ============================================

-- MUAMMO: 
-- 1. "Users can update own profile" va "Users can view own profile" 
--    {public} rolida, lekin {authenticated} bo'lishi kerak
-- 2. INSERT policy'ning WITH CHECK shartini tekshirish kerak

-- ============================================
-- 1. Hozirgi policy'larni o'chirish
-- ============================================

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- ============================================
-- 2. To'g'ri SELECT policy yaratish ({authenticated} bilan)
-- ============================================

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- 3. To'g'ri UPDATE policy yaratish ({authenticated} bilan)
-- ============================================

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. INSERT policy'ni tekshirish va qayta yaratish (agar kerak bo'lsa)
-- ============================================

-- Avval o'chirish
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- To'g'ri INSERT policy yaratish (WITH CHECK bilan)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. TEKSHIRISH
-- ============================================

-- Barcha policy'larni ko'rish
SELECT 
  policyname,
  cmd,
  roles,
  qual as USING_condition,
  with_check as WITH_CHECK_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname, cmd;

