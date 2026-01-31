# Web Sahifa Yaratish va Sozlash - Qadamma-Qadam Qo'llanma

## 📋 Umumiy ko'rinish

Bu qo'llanmada email confirmation uchun web sahifani yaratish va sozlash jarayoni batafsil tushuntirilgan.

## 🎯 Qadam 1: Web Sahifani Tayyorlash

### 1.1. Supabase Ma'lumotlarini Olish

1. [Supabase Dashboard](https://app.supabase.com) ga kiring
2. Loyihangizni tanlang
3. **Settings** > **API** ga o'ting
4. Quyidagi ma'lumotlarni ko'chirib oling:
   - **Project URL** (masalan: `https://xxxxx.supabase.co`)
   - **anon public** key (Project API keys bo'limida)

### 1.2. Web Sahifani Sozlash

1. `public/email-confirmation.html` faylini oching
2. 130-131 qatorlarni toping:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. O'z Supabase ma'lumotlaringizni qo'ying:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co'; // O'z URL'ingiz
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // O'z key'ingiz
   ```

**⚠️ Eslatma:** Faylni saqlang!

---

## 🚀 Qadam 2: Web Sahifani Hosting Qilish

Sizga 3 ta variant taklif qilaman. Eng osonidan boshlaymiz:

### Variant A: Vercel (Tavsiya etiladi - Eng oson) ⭐

#### 2.1. Vercel Hisob Yaratish
1. [Vercel.com](https://vercel.com) ga kiring
2. **Sign Up** tugmasini bosing
3. GitHub, GitLab yoki Email orqali ro'yxatdan o'ting

#### 2.2. Vercel CLI O'rnatish
1. Terminal/PowerShell'ni oching
2. Quyidagi buyruqni bajaring:
   ```bash
   npm install -g vercel
   ```

#### 2.3. Web Sahifani Deploy Qilish
1. Terminal'da loyiha papkasiga kiring:
   ```bash
   cd "C:\Users\iqbol\OneDrive\Desktop\Hamkor talim mobil\Hamkor-talim"
   ```

2. `public` papkasiga kiring:
   ```bash
   cd public
   ```

3. Vercel'ga login qiling:
   ```bash
   vercel login
   ```
   - Browser ochiladi, Vercel'ga kirib oling

4. Deploy qiling:
   ```bash
   vercel
   ```
   - Bir nechta savollar beriladi:
     - **Set up and deploy?** → `Y` (Yes)
     - **Which scope?** → O'z hisobingizni tanlang
     - **Link to existing project?** → `N` (No)
     - **Project name?** → `hamkor-talim-email` (yoki istalgan nom)
     - **Directory?** → `.` (nuqta - joriy papka)
     - **Override settings?** → `N` (No)

5. Natija: Sizga URL beriladi, masalan:
   ```
   https://hamkor-talim-email.vercel.app
   ```

6. **Bu URL'ni yozib qo'ying!** Keyinroq ishlatamiz.

---

### Variant B: Netlify (Oson)

#### 2.1. Netlify Hisob Yaratish
1. [Netlify.com](https://netlify.com) ga kiring
2. **Sign up** tugmasini bosing
3. Ro'yxatdan o'ting

#### 2.2. Web Sahifani Deploy Qilish
1. Netlify Dashboard'da **Add new site** > **Deploy manually** ni tanlang
2. `public` papkasidagi `email-confirmation.html` faylini browser'ga sudrab tashlang (drag & drop)
3. Netlify avtomatik deploy qiladi
4. Sizga URL beriladi, masalan:
   ```
   https://random-name-123.netlify.app
   ```

#### 2.3. Custom Domain Sozlash (ixtiyoriy)
1. Netlify Dashboard'da **Site settings** > **Domain management**
2. **Add custom domain** ni bosing
3. O'z domain'ingizni kiriting (masalan: `hamkor-talim.com`)

---

### Variant C: Supabase Storage (Eng sodda)

#### 2.1. Supabase Storage'ga Fayl Yuklash
1. Supabase Dashboard'ga kiring
2. **Storage** > **Buckets** ga o'ting
3. **New bucket** tugmasini bosing:
   - **Name:** `public`
   - **Public bucket:** ✅ (yoqing)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** `text/html`
4. **Create bucket** ni bosing

5. **public** bucket'ni oching
6. **Upload file** tugmasini bosing
7. `email-confirmation.html` faylini yuklang
8. Fayl yuklangandan keyin, **Copy URL** tugmasini bosing
9. URL quyidagicha bo'ladi:
   ```
   https://xxxxx.supabase.co/storage/v1/object/public/public/email-confirmation.html
   ```

**⚠️ Eslatma:** Bu URL juda uzun. Agar qisqa URL kerak bo'lsa, Variant A yoki B ni tanlang.

---

## ⚙️ Qadam 3: Supabase'da Redirect URL Sozlash

### 3.1. Supabase Dashboard'ga Kirish
1. [Supabase Dashboard](https://app.supabase.com) ga kiring
2. Loyihangizni tanlang

### 3.2. Redirect URL Qo'shish
1. **Authentication** > **URL Configuration** ga o'ting
2. **Redirect URLs** bo'limini toping
3. **Add URL** tugmasini bosing
4. Quyidagi URL'larni qo'shing (har birini alohida):

   **Vercel yoki Netlify ishlatgan bo'lsangiz:**
   ```
   https://hamkor-talim-email.vercel.app/email-confirmation
   ```
   (yoki Netlify URL'ingiz)

   **Supabase Storage ishlatgan bo'lsangiz:**
   ```
   https://xxxxx.supabase.co/storage/v1/object/public/public/email-confirmation.html
   ```

5. **Deep linking** uchun ham qo'shing:
   ```
   hamkor-talim://email-confirmation
   ```

6. **Save** tugmasini bosing

---

## 📧 Qadam 4: Email Template Sozlash

### 4.1. Email Template'ni O'zgartirish
1. Supabase Dashboard'da **Authentication** > **Email Templates** ga o'ting
2. **Confirm signup** template'ni tanlang
3. **Subject** ni o'zgartiring (ixtiyoriy):
   ```
   Hamkor Talim - Email Tasdiqlash
   ```

4. **Body** ni o'zgartiring:
   ```html
   <h2>Hamkor Talim'ga xush kelibsiz!</h2>
   
   <p>Hisobingizni faollashtirish uchun quyidagi linkni bosing:</p>
   
   <p><a href="{{ .ConfirmationURL }}">Email Tasdiqlash</a></p>
   
   <p>Agar siz bu hisobni yaratmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
   ```

5. **Save** tugmasini bosing

### 4.2. Site URL Sozlash
1. **Authentication** > **URL Configuration** ga o'ting
2. **Site URL** ni o'zgartiring:
   - Vercel/Netlify ishlatgan bo'lsangiz: `https://hamkor-talim-email.vercel.app`
   - Supabase Storage ishlatgan bo'lsangiz: Supabase Storage URL'ingiz

---

## ✅ Qadam 5: Test Qilish

### 5.1. Yangi Foydalanuvchi Ro'yxatdan O'tkazish
1. Ilovangizni ishga tushiring
2. Yangi foydalanuvchi ro'yxatdan o'tkazish
3. Email pochtangizni tekshiring

### 5.2. Email'dagi Linkni Bosish
1. Email'dagi linkni bosing
2. Web sahifa ochilishi kerak
3. "Email tasdiqlandi!" xabari ko'rinishi kerak
4. "Mobil ilovani ochish" tugmasini bosing
5. Mobil ilova ochilishi kerak

### 5.3. Muammolarni Tekshirish
- Agar web sahifa ochilmasa: URL'ni tekshiring
- Agar email tasdiqlanmasa: Browser console'ni tekshiring (F12)
- Agar mobil ilova ochilmasa: Deep linking sozlamalarini tekshiring

---

## 🔧 Qadam 6: Production Sozlash (ixtiyoriy)

### 6.1. Custom Domain Qo'shish (Vercel)
1. Vercel Dashboard'da loyihangizni oching
2. **Settings** > **Domains** ga o'ting
3. O'z domain'ingizni kiriting (masalan: `hamkor-talim.com`)
4. DNS sozlamalarini qiling (Vercel ko'rsatadi)

### 6.2. HTTPS Sozlash
- Vercel va Netlify avtomatik HTTPS beradi
- Supabase Storage ham HTTPS ishlatadi

---

## 📝 Xulosa

✅ Web sahifa yaratildi va sozlandi
✅ Supabase'da redirect URL sozlandi
✅ Email template sozlandi
✅ Test qilindi

Endi foydalanuvchilar email'dagi linkni har qanday qurilmada ochib, email'larini tasdiqlay olishadi!

---

## 🆘 Yordam

Agar muammo bo'lsa:
1. Browser console'ni tekshiring (F12)
2. Supabase Dashboard'da **Logs** bo'limini tekshiring
3. Vercel/Netlify Dashboard'da **Deployments** ni tekshiring

