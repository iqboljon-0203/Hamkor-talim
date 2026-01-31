-- ============================================
-- group_members jadvali uchun RLS Policy'larni tuzatish
-- ============================================

-- 1. MAVJUD POLICY'LARNI O'CHIRISH
-- Rasmda ko'rsatilgan barcha policy'larni o'chirish

DROP POLICY IF EXISTS "Group members: teacher can manage membership" ON group_members;
DROP POLICY IF EXISTS "Group members: user can view membership" ON group_members;
DROP POLICY IF EXISTS "Students can join groups" ON group_members;
DROP POLICY IF EXISTS "Group members: teacher can manage r" ON group_members;
DROP POLICY IF EXISTS "Group members: user can view memb" ON group_members;

-- Boshqa mavjud policy'larni ham o'chirish (agar bor bo'lsa)
DROP POLICY IF EXISTS "Users can view own group memberships" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
DROP POLICY IF EXISTS "Teachers can view their group members" ON group_members;
DROP POLICY IF EXISTS "Teachers can add members to their groups" ON group_members;

-- ============================================
-- 2. TO'G'RI POLICY'LARNI YARATISH
-- ============================================

-- POLICY 1: Talabalar o'zlarini guruhga qo'sha olishi uchun
-- Bu policy talabalarga o'zlarini guruhga qo'shish imkoniyatini beradi
CREATE POLICY "Students can join groups"
ON group_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- POLICY 2: Foydalanuvchilar o'z guruhlarini ko'ra olishi uchun
-- Talabalar faqat o'zlarining guruhlarini ko'ra oladi
CREATE POLICY "Users can view own memberships"
ON group_members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- POLICY 3: O'qituvchilar o'z guruhlaridagi barcha a'zolarni ko'ra olishi uchun
-- Bu policy o'qituvchilarga o'z guruhlaridagi barcha talabalarni ko'rish imkoniyatini beradi
-- EHTIYOT: Bu policy'da EXISTS ishlatilgan, lekin groups jadvalida RLS bo'lmasligi kerak
-- yoki groups jadvalidagi policy rekursiyaga olib kelmasligi kerak
CREATE POLICY "Teachers can view their group members"
ON group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);

-- POLICY 4: O'qituvchilar o'z guruhlariga talabalarni qo'sha olishi uchun
-- Bu policy o'qituvchilarga o'z guruhlariga talabalarni qo'shish imkoniyatini beradi
CREATE POLICY "Teachers can add members to their groups"
ON group_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);

-- POLICY 5: Foydalanuvchilar o'zlarini guruhdan chiqara olishi uchun
CREATE POLICY "Users can leave groups"
ON group_members
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);

-- ============================================
-- 3. TEKSHIRISH
-- ============================================

-- Policy'larni ko'rish
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'group_members'
ORDER BY policyname;

-- ============================================
-- ESLATMA: groups jadvali uchun ham RLS tekshirish kerak
-- ============================================

-- Agar groups jadvalida ham RLS policy'lar bo'lsa va ular rekursiyaga olib kelsa,
-- quyidagi policy'larni yarating:

-- Groups jadvali uchun SELECT policy (o'qituvchilar o'z guruhlarini ko'ra oladi):
-- CREATE POLICY "Users can view groups"
-- ON groups
-- FOR SELECT
-- TO authenticated
-- USING (
--   created_by = auth.uid()
--   OR
--   EXISTS (
--     SELECT 1 FROM group_members
--     WHERE group_members.group_id = groups.id
--     AND group_members.user_id = auth.uid()
--   )
-- );

-- Lekin bu ham rekursiyaga olib kelishi mumkin!
-- Yaxshiroq yechim: groups jadvalida faqat created_by tekshiruvi bo'lsin:

-- CREATE POLICY "Users can view groups"
-- ON groups
-- FOR SELECT
-- TO authenticated
-- USING (created_by = auth.uid());

-- Va talabalar uchun alohida policy yoki function ishlatish kerak.

