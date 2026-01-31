-- ============================================
-- groups jadvali uchun RLS Policy'larni tekshirish va tuzatish
-- ============================================

-- 1. Hozirgi policy'larni ko'rish
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'groups'
ORDER BY policyname;

-- ============================================
-- 2. AGAR RECURSION XATOSI BO'LSA, QUYIDAGI POLICY'LARNI YARATING
-- ============================================

-- Avval mavjud policy'larni o'chirish (rasmda ko'rsatilgan policy'lar)
DROP POLICY IF EXISTS "Groups: anyone with ID can verify group" ON groups;
DROP POLICY IF EXISTS "Groups: student can view joined groups" ON groups;
DROP POLICY IF EXISTS "Groups: teacher can insert own groups" ON groups;
DROP POLICY IF EXISTS "Groups: teacher can view own groups" ON groups;

-- Boshqa mavjud policy'larni ham o'chirish (agar bor bo'lsa)
DROP POLICY IF EXISTS "Users can view groups" ON groups;
DROP POLICY IF EXISTS "Teachers can view their groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can update their groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their groups" ON groups;

-- ============================================
-- 3. TO'G'RI POLICY'LARNI YARATISH
-- ============================================

-- POLICY 1: O'qituvchilar o'z guruhlarini ko'ra oladi
-- MUHIM: Bu policy'da group_members jadvaliga murojaat qilmaymiz!
CREATE POLICY "Groups: teacher can view own groups"
ON groups
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
);

-- POLICY 2: Talabalar o'z guruhlarini ko'ra oladi
-- Bu policy'da ham group_members ga to'g'ridan-to'g'ri murojaat qilmaymiz
-- Buning o'rniga, kodda alohida so'rov yuboriladi
-- Yoki quyidagi yechimni ishlatish mumkin (lekin ehtiyot bo'lish kerak):

-- Talabalar uchun alohida policy (agar kerak bo'lsa):
-- Bu policy'ni faqat agar talabalar to'g'ridan-to'g'ri groups jadvalini o'qishlari kerak bo'lsa ishlating
-- CREATE POLICY "Students can view their groups"
-- ON groups
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM group_members
--     WHERE group_members.group_id = groups.id
--     AND group_members.user_id = auth.uid()
--   )
-- );

-- LEKIN: Bu ham recursion yaratishi mumkin!
-- Yaxshiroq yechim: Talabalar uchun alohida function yoki view ishlatish

-- POLICY 3: O'qituvchilar o'z guruhlarini yarata oladi
CREATE POLICY "Groups: teacher can insert own groups"
ON groups
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
);

-- POLICY 4: Guruh ID orqali tekshirish (ixtiyoriy - agar kerak bo'lsa)
-- Bu policy har qanday foydalanuvchiga guruh ID orqali tekshirish imkoniyatini beradi
-- Lekin bu policy'da ham group_members ga murojaat qilmaymiz!
CREATE POLICY "Groups: anyone with ID can verify group"
ON groups
FOR SELECT
TO public
USING (true);  -- Yoki faqat ID bo'yicha tekshirish: id IS NOT NULL

-- POLICY 5: O'qituvchilar o'z guruhlarini yangilay oladi (agar kerak bo'lsa)
CREATE POLICY "Groups: teacher can update own groups"
ON groups
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
)
WITH CHECK (
  created_by = auth.uid()
);

-- POLICY 6: O'qituvchilar o'z guruhlarini o'chira oladi (agar kerak bo'lsa)
CREATE POLICY "Groups: teacher can delete own groups"
ON groups
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
);

-- ============================================
-- 4. TEKSHIRISH
-- ============================================

-- Policy'larni qayta ko'rish
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'groups'
ORDER BY policyname;

-- ============================================
-- ESLATMA
-- ============================================

-- MUHIM: 
-- 1. groups jadvalidagi SELECT policy'da group_members jadvaliga murojaat qilmaslik kerak
-- 2. group_members jadvalidagi policy'larda groups jadvaliga murojaat qilish mumkin,
--    chunki groups jadvalidagi policy'da group_members ga murojaat yo'q
-- 3. Agar talabalar groups jadvalini to'g'ridan-to'g'ri o'qishlari kerak bo'lsa,
--    alohida function yoki view ishlatish yaxshiroq

