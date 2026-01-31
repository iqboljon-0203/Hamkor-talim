# 502 Bad Gateway Xatosini Tuzatish

## Muammo

**HTTP Status 502** - Bad Gateway xatosi
**Cloudflare Proxy Error:** `http_response_incomplete`

**Sabab:** Supabase URL hali ham placeholder qiymatda (`https://skmoaeimhufhetmntiie.supabase.co`)

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
   
   **⚠️ MUHIM:** `skmoaeimhufhetmntiie` emas, o'z loyihangizning to'g'ri URL'ini oling!

   **📌 anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Project API keys bo'limida, **anon public** key - uzoq matn)

### QADAM 2: email-confirmation.html Faylini O'zgartirish

1. `public/email-confirmation.html` faylini oching
2. **210-213 qatorlarni** toping:
   ```javascript
   const SUPABASE_URL = window.location.hostname.includes('localhost')
     ? 'https://skmoaeimhufhetmntiie.supabase.co' // Development
     : 'https://skmoaeimhufhetmntiie.supabase.co'; // Production
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

3. **O'z Supabase ma'lumotlaringizni qo'ying:**
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co'; // O'z URL'ingiz (skmoaeimhufhetmntiie emas!)
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // O'z key'ingiz
   ```

**Misol:**
```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co'; // O'z URL'ingiz
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

### QADAM 3: Faylni Saqlash va Deploy Qilish

1. **Faylni saqlang** (Ctrl+S)
2. **Vercel'ga qayta deploy qiling:**
   ```bash
   cd public
   vercel --prod
   ```

### QADAM 4: Test Qilish

1. Yangi foydalanuvchi ro'yxatdan o'tkazish
2. Email pochtangizni tekshiring
3. Email'dagi linkni bosing
4. Endi 502 xatosi bo'lmasligi kerak

## Tekshirish

Agar hali ham 502 xatosi bo'lsa:

1. **Supabase URL to'g'rimi?**
   - Supabase Dashboard > Settings > API > Project URL
   - `https://xxxxx.supabase.co` formatida bo'lishi kerak
   - `skmoaeimhufhetmntiie` emas!

2. **Vercel deployment muvaffaqiyatli bormi?**
   - Vercel Dashboard > Deployments bo'limida so'nggi deployment status'ni tekshiring

3. **Browser cache'ni tozalang:**
   - Browser'da `Ctrl+Shift+R` (yoki `Cmd+Shift+R`) bosing
   - Yoki incognito/private mode'da ochib ko'ring

## Muhim eslatma

**`skmoaeimhufhetmntiie.supabase.co` - bu placeholder URL, u ishlamaydi!**

O'z Supabase loyihangizning to'g'ri URL'ini ishlatishingiz kerak!

