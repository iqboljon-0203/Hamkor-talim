-- ============================================
-- profiles jadvali policy'larining to'liq tekshiruvi
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
-- MUHIM: INSERT policy'da WITH CHECK sharti bo'lishi kerak
-- ============================================
-- INSERT policy uchun WITH CHECK (auth.uid() = id) bo'lishi kerak
-- Bu foydalanuvchining faqat o'z profilini yaratishini ta'minlaydi

