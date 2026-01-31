-- ============================================
-- profiles jadvali uchun O'QITUVCHILAR uchun qo'shimcha RLS Policy
-- ============================================

-- MUAMMO: O'qituvchilar boshqa talabalarning profil ma'lumotlarini ko'ra olmayapti
-- SABAB: Hozirgi policy faqat o'z profilini ko'rishga ruxsat beradi

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
-- 2. O'QITUVCHILAR uchun qo'shimcha SELECT policy yaratish
-- ============================================

-- Bu policy o'qituvchilarga barcha talabalarning profil ma'lumotlarini ko'rish imkoniyatini beradi
-- Bu submissions jadvalidan talabalar ismlarini ko'rsatish uchun kerak

-- MUHIM: Recursion bo'lmasligi uchun JWT dan role olamiz
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

-- ============================================
-- ALTERNATIV YECHIM (Agar yuqoridagi ishlamasa):
-- ============================================

-- Agar yuqoridagi policy ishlamasa, quyidagi yechimni ishlating:

-- 1. Avval mavjud policy'ni o'chirish
-- DROP POLICY IF EXISTS "Teachers can view all student profiles" ON profiles;

-- 2. Function yaratish (SECURITY DEFINER bilan - recursion bo'lmasligi uchun)
-- CREATE OR REPLACE FUNCTION is_current_user_teacher()
-- RETURNS boolean AS $$
-- BEGIN
--   RETURN EXISTS (
--     SELECT 1 FROM profiles
--     WHERE id = auth.uid()
--     AND role = 'teacher'
--   );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Policy yaratish (function ishlatib)
-- CREATE POLICY "Teachers can view all student profiles"
-- ON profiles
-- FOR SELECT
-- TO authenticated
-- USING (
--   auth.uid() = id
--   OR
--   (is_current_user_teacher() AND role = 'student')
-- );

-- ============================================
-- YANA BIR YECHIM (Eng sodda):
-- ============================================

-- Agar yuqoridagilar ham ishlamasa, quyidagi yechimni ishlating:
-- Bu yechimda o'qituvchilar barcha profillarni ko'ra oladi (lekin faqat SELECT uchun)

-- DROP POLICY IF EXISTS "Teachers can view all student profiles" ON profiles;

-- CREATE POLICY "Teachers can view all student profiles"
-- ON profiles
-- FOR SELECT
-- TO authenticated
-- USING (
--   auth.uid() = id
--   OR
--   (
--     -- O'qituvchi ekanligini tekshirish (recursion bo'lmasligi uchun)
--     -- Bu yerda profiles jadvaliga qayta murojaat qilmaymiz
--     (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
--     AND role = 'student'
--   )
-- );

-- ============================================
-- 3. TEKSHIRISH
-- ============================================

-- Policy'larni qayta ko'rish
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test so'rovi (o'qituvchi sifatida barcha talabalarni ko'rish)
-- SELECT id, full_name, email, role 
-- FROM profiles 
-- WHERE role = 'student';

