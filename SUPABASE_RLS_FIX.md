# Supabase RLS Policy Xatosini Tuzatish

## Muammo

`infinite recursion detected in policy for relation "profiles"` xatosi Supabase Row Level Security (RLS) policy'larida cheksiz rekursiya borligini ko'rsatadi.

## Sabab

RLS policy'lar o'z-o'ziga yoki boshqa policy'ga murojaat qilganda cheksiz rekursiya yuzaga keladi.

## Yechim

### 1. Supabase Dashboard'ga kiring

1. [Supabase Dashboard](https://app.supabase.com) ga kiring
2. Loyihangizni tanlang
3. **Authentication** > **Policies** ga o'ting

### 2. `profiles` jadvali uchun RLS policy'larni tekshiring

**SQL Editor** da quyidagi so'rovlarni bajaring:

#### A. Hozirgi policy'larni ko'rish:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### B. Barcha policy'larni o'chirish (agar kerak bo'lsa):

**Rasmda ko'rsatilgan policy'larni o'chirish:**

```sql
-- Barcha mavjud policy'larni o'chirish
DROP POLICY IF EXISTS "Profiles: teacher can view group members" ON profiles;
DROP POLICY IF EXISTS "Profiles: user can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles: user can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles: user can view own profile" ON profiles;

-- Yoki barcha policy'larni bir vaqtda o'chirish (agar nomlar farq qilsa):
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
```

#### C. To'g'ri policy'larni yaratish:

**1. SELECT (O'qish) policy:**

```sql
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);
```

**2. INSERT (Yaratish) policy:**

```sql
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
```

**3. UPDATE (Yangilash) policy:**

```sql
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 3. Muammo bo'lishi mumkin bo'lgan policy'lar

Quyidagi kabi policy'lar rekursiyaga olib kelishi mumkin:

❌ **Noto'g'ri (Rekursiya yaratadi):**

```sql
CREATE POLICY "bad_policy"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
);
```

✅ **To'g'ri:**

```sql
CREATE POLICY "good_policy"
ON profiles
FOR SELECT
USING (auth.uid() = id);
```

### 4. RLS ni yoqish/yoqmaslik

Agar RLS kerak bo'lmasa (faqat development uchun):

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Lekin production'da RLS har doim yoqilgan bo'lishi kerak!

### 5. Tekshirish

Policy'larni yaratgandan keyin, quyidagi so'rov bilan tekshiring:

```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

Agar xato bo'lmasa, policy'lar to'g'ri ishlayapti.

## Qo'shimcha eslatmalar

1. **auth.uid()** funksiyasi policy ichida ishlatilganda, u yana policy'ni trigger qilmaydi
2. Policy'lar ichida `profiles` jadvaliga qayta murojaat qilmaslik kerak
3. Agar policy'lar murakkab bo'lsa, ularni soddalashtirish kerak

## `group_members` jadvali uchun RLS policy'lar

`group_members` jadvali uchun ham xuddi shu muammo bo'lishi mumkin. Quyidagi policy'larni yarating:

### 1. Mavjud policy'larni o'chirish:

```sql
-- Barcha mavjud group_members policy'larini o'chirish
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can insert group members" ON group_members;
DROP POLICY IF EXISTS "Users can delete group members" ON group_members;
DROP POLICY IF EXISTS "Teachers can manage group members" ON group_members;
-- Boshqa policy'lar ham bor bo'lsa, ularni ham o'chiring
```

### 2. To'g'ri policy'larni yaratish:

**1. SELECT (O'qish) - Foydalanuvchi o'z guruhlarini ko'ra oladi:**

```sql
CREATE POLICY "Users can view own group memberships"
ON group_members
FOR SELECT
USING (auth.uid() = user_id);
```

**2. INSERT (Yaratish) - Foydalanuvchi o'zini guruhga qo'sha oladi:**

```sql
CREATE POLICY "Users can join groups"
ON group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**3. DELETE (O'chirish) - Foydalanuvchi o'zini guruhdan chiqara oladi:**

```sql
CREATE POLICY "Users can leave groups"
ON group_members
FOR DELETE
USING (auth.uid() = user_id);
```

**4. O'qituvchilar o'z guruhlaridagi barcha a'zolarni ko'ra oladi (ixtiyoriy):**

```sql
CREATE POLICY "Teachers can view their group members"
ON group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);
```

**5. O'qituvchilar o'z guruhlariga talabalarni qo'sha oladi (ixtiyoriy):**

```sql
CREATE POLICY "Teachers can add members to their groups"
ON group_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);
```

## Kodda qilingan o'zgarishlar

### `hooks/useAuth.tsx`:

- RLS recursion xatosi (42P17) alohida handle qilinadi
- Xatolik bo'lsa, auth user ma'lumotlaridan fallback profil yaratiladi
- Xatolarni yaxshiroq handle qilish qo'shildi

### `hooks/useGroupStore.ts`:

- `joinGroup` funksiyasida RLS recursion xatosi handle qilinadi
- `fetchGroups` funksiyasida RLS recursion xatosi handle qilinadi
- `getGroupMembers` funksiyasida RLS recursion xatosi handle qilinadi
- Xatolik bo'lsa ham, ilova ishlashda davom etadi
