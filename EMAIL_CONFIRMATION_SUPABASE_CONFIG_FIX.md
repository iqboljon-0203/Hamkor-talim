# Email Confirmation - Supabase Konfiguratsiyasini To'g'rilash

## Muammo

Email tasdiqlashda xato: "Email tasdiqlashda xatolik yuz berdi"

**Sabab:** `email-confirmation.html` faylida Supabase URL va ANON KEY to'g'ri sozlangan emas.

## Yechim

### QADAM 1: Supabase Ma'lumotlarini Olish

1. [Supabase Dashboard](https://app.supabase.com) ga kiring
2. Loyihangizni tanlang
3. **Settings** (⚙️) > **API** ga o'ting
4. Quyidagi ma'lumotlarni ko'chirib oling:

   **📌 Project URL:**
   ```
   https://xxxxx.supabase.co
   ```
   (Masalan: `https://abcdefghijklmnop.supabase.co`)

   **📌 anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.xxxxx
   ```
   (Project API keys bo'limida, **anon public** key - uzoq matn)

### QADAM 2: email-confirmation.html Faylini O'zgartirish

1. `public/email-confirmation.html` faylini oching
2. **192-195 qatorlarni** toping:
   ```javascript
   const SUPABASE_URL = window.location.hostname.includes('localhost')
     ? 'YOUR_SUPABASE_URL' // Development
     : 'YOUR_SUPABASE_URL'; // Production - o'zgartiring!
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // O'zgartiring!
   ```

3. O'z Supabase ma'lumotlaringizni qo'ying:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co'; // O'z URL'ingiz
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // O'z key'ingiz
   ```

**Misol:**
```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

### QADAM 3: Faylni Saqlash va Deploy Qilish

1. **Faylni saqlang** (Ctrl+S yoki Cmd+S)
2. Vercel'ga qayta deploy qiling:
   ```bash
   cd public
   vercel --prod
   ```

### QADAM 4: Test Qilish

1. Yangi foydalanuvchi ro'yxatdan o'tkazish
2. Email pochtangizni tekshiring
3. Email'dagi linkni bosing
4. Endi xato bo'lmasligi kerak

## Muammo bo'lsa

Agar hali ham xato bo'lsa:

1. **Browser console'ni oching** (F12) va quyidagilarni tekshiring:
   - Supabase URL to'g'ri ko'rsatilganmi?
   - ANON KEY to'g'ri ko'rsatilganmi?
   - Network tab'da Supabase API so'rovi muvaffaqiyatli bormi?

2. **Supabase Logs'ni tekshiring:**
   - Supabase Dashboard > **Logs** > **API Logs**
   - Email confirmation so'rovi ko'rinadimi?

3. **Vercel deployment'ni tekshiring:**
   - Vercel Dashboard'da loyihangizni oching
   - **Deployments** bo'limida so'nggi deployment muvaffaqiyatli bormi?

## Muhim eslatmalar

1. **ANON KEY** - bu public key, lekin yaxshiroq xavfsizlik uchun uni environment variable sifatida ishlatish tavsiya etiladi (keyinroq).

2. **Supabase URL** - bu sizning loyihangiz URL'i, uni o'zgartirmang.

3. **Faylni saqlagandan keyin** Vercel'ga qayta deploy qilishni unutmang!

