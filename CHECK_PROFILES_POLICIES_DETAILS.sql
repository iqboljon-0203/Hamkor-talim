-- ============================================
-- profiles jadvali policy'larining to'liq ma'lumotlarini ko'rish
-- ============================================

-- Barcha policy'larning to'liq ma'lumotlarini ko'rish
SELECT 
  policyname,
  cmd,
  roles,
  qual as USING_condition,
  with_check as WITH_CHECK_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname, cmd;

-- ============================================
-- Muammo: "Users can update own profile" va "Users can view own profile" 
-- {public} rolida, lekin {authenticated} bo'lishi kerak
-- ============================================

