# Supabase Email Confirmation To'liq Qo'llanma

## 📋 Umumiy ko'rinish

Bu qo'llanmada Supabase loyihaga web sahifani bog'lash va email confirmation'ni yoqish jarayoni batafsil tushuntirilgan.

---

## 🎯 QADAM 1: Supabase Dashboard'ga Kirish

### 1.1. Supabase'ga Kirish
1. Browser'da [https://app.supabase.com](https://app.supabase.com) ga kiring
2. **Sign In** tugmasini bosing
3. Email va parol bilan kirib oling

### 1.2. Loyihani Tanlash
1. Dashboard'da loyihangizni tanlang
2. Agar loyiha yo'q bo'lsa, **New Project** tugmasini bosing va yangi loyiha yarating

---

## 🔗 QADAM 2: Web Sahifani Supabase'ga Bog'lash

### 2.1. Supabase Ma'lumotlarini Olish

1. Supabase Dashboard'da **Settings** (⚙️) tugmasini bosing (chap menuda)
2. **API** bo'limiga o'ting
3. Quyidagi ma'lumotlarni ko'chirib oling:

   **📌 Project URL:**
   ```
   https://xxxxx.supabase.co
   ```
   (Bu sizning Supabase loyihangiz URL'i)

   **📌 anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.xxxxx
   ```
   (Project API keys bo'limida, **anon public** key)

### 2.2. Web Sahifani Sozlash

1. `public/email-confirmation.html` faylini oching
2. **177-179 qatorlarni** toping:
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

4. **Faylni saqlang** (Ctrl+S yoki Cmd+S)

---

## 📧 QADAM 3: Email Confirmation'ni Yoqish

### 3.1. Authentication Settings'ga O'tish

1. Supabase Dashboard'da **Authentication** bo'limiga o'ting (chap menuda)
2. **Settings** tab'ini tanlang
3. **Email Auth** bo'limini toping

### 3.2. Email Confirmation'ni Yoqish

1. **Enable email confirmations** ni yoqing ✅
   - Bu toggle'ni o'ngga suring (yashil bo'lishi kerak)

2. **Confirm email** ni tanlang
   - Dropdown'dan **Confirm email** ni tanlang

3. **Secure email change** (ixtiyoriy)
   - Agar email o'zgartirishda ham tasdiqlash kerak bo'lsa, buni ham yoqing

### 3.3. Site URL Sozlash

1. **Site URL** bo'limini toping
2. O'z web sahifangiz URL'ini kiriting:
   ```
   https://hamkor-talim-email.vercel.app
   ```
   (yoki o'z web sahifangiz URL'i)

3. **Save** tugmasini bosing

---

## 🔗 QADAM 4: Redirect URL Sozlash

### 4.1. Redirect URLs Bo'limiga O'tish

1. **Authentication** > **URL Configuration** ga o'ting
2. **Redirect URLs** bo'limini toping

### 4.2. URL'larni Qo'shish

1. **Add URL** tugmasini bosing
2. Quyidagi URL'larni qo'shing (har birini alohida):

   **URL 1: Web sahifa (Production)**
   ```
   https://hamkor-talim-email.vercel.app/email-confirmation
   ```
   (o'z web sahifangiz URL'i)

   **URL 2: Deep linking (Mobil ilova)**
   ```
   hamkor-talim://email-confirmation
   ```

   **URL 3: Development (ixtiyoriy)**
   ```
   exp://localhost:8081/email-confirmation
   ```

3. Har bir URL'ni qo'shgandan keyin **Save** tugmasini bosing

---

## 📝 QADAM 5: Email Template Sozlash

### 5.1. Email Template'ga O'tish

1. **Authentication** > **Email Templates** ga o'ting
2. **Confirm signup** template'ni tanlang

### 5.2. Subject Sozlash

1. **Subject** maydonini toping
2. Quyidagicha o'zgartiring:
   ```
   Hamkor Talim - Email Tasdiqlash
   ```

### 5.3. Body (Email Matni) Sozlash

1. **Body** maydonini toping
2. Quyidagi HTML kodni qo'ying:

```html
<h2>Hamkor Talim'ga xush kelibsiz!</h2>

<p>Salom,</p>

<p>Hisobingizni faollashtirish uchun quyidagi linkni bosing:</p>

<p style="margin: 20px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Email Tasdiqlash
  </a>
</p>

<p>Agar siz bu hisobni yaratmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>

<p>Hurmat bilan,<br>Hamkor Talim jamoasi</p>
```

### 5.4. Redirect URL Sozlash (MUHIM!)

1. **Redirect URL** maydonini toping
2. Quyidagicha o'zgartiring:

```
https://hamkor-talim-email.vercel.app/email-confirmation?token_hash={{ .TokenHash }}&type={{ .Type }}&email={{ .Email }}
```

**⚠️ MUHIM:** 
- `hamkor-talim-email.vercel.app` o'rniga o'z web sahifangiz URL'ini qo'ying
- `{{ .TokenHash }}`, `{{ .Type }}`, `{{ .Email }}` ni o'zgartirmang - bu Supabase'ning o'z o'zgaruvchilari

### 5.5. Saqlash

1. **Save** tugmasini bosing
2. Xabarni tekshiring: "Template saved successfully"

---

## ✅ QADAM 6: Tekshirish va Test Qilish

### 6.1. Sozlamalarni Tekshirish

Quyidagilarni tekshiring:

- ✅ **Enable email confirmations** - yoqilgan
- ✅ **Site URL** - to'g'ri sozlangan
- ✅ **Redirect URLs** - qo'shilgan
- ✅ **Email Template** - to'g'ri sozlangan

### 6.2. Test Email Yuborish

1. **Authentication** > **Users** ga o'ting
2. **Add user** tugmasini bosing
3. Test email kiriting (masalan: `test@example.com`)
4. **Send magic link** ni tanlang
5. Email pochtangizni tekshiring

### 6.3. Ilovada Test Qilish

1. Ilovangizni ishga tushiring
2. Yangi foydalanuvchi ro'yxatdan o'tkazish
3. Email pochtangizni tekshiring
4. Email'dagi linkni bosing
5. Web sahifada "Email tasdiqlandi!" ko'rinishi kerak

---

## 🔧 QADAM 7: Muammolarni Hal Qilish

### Muammo 1: Email kelmayapti

**Yechim:**
1. Spam papkasini tekshiring
2. Supabase Dashboard > **Logs** > **Auth Logs** ni tekshiring
3. Email provider sozlamalarini tekshiring

### Muammo 2: URL parametrlar undefined

**Yechim:**
1. Email template'dagi Redirect URL'ni tekshiring
2. Browser console'ni tekshiring (F12)
3. URL formatini tekshiring

### Muammo 3: Email tasdiqlanmayapti

**Yechim:**
1. Web sahifadagi Supabase URL va Key'ni tekshiring
2. Browser console'dagi xatoliklarni tekshiring
3. Supabase Dashboard > **Logs** ni tekshiring

---

## 📋 Xulosa

✅ Supabase ma'lumotlari olingan
✅ Web sahifa sozlangan
✅ Email confirmation yoqilgan
✅ Redirect URL'lar qo'shilgan
✅ Email template sozlangan
✅ Test qilingan

Endi foydalanuvchilar email'dagi linkni bosib, email'larini tasdiqlay olishadi!

---

## 🆘 Yordam

Agar muammo bo'lsa:
1. Browser console'ni tekshiring (F12)
2. Supabase Dashboard > **Logs** ni tekshiring
3. Email template'dagi Redirect URL'ni qayta tekshiring

