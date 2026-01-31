# Email Confirmation (Email Tasdiqlash) Qo'shish Qo'llanmasi

## ✅ Kodda qilingan o'zgarishlar

1. ✅ `hooks/useAuth.tsx` - Email confirmation qo'llab-quvvatlash qo'shildi
2. ✅ `app/(auth)/email-confirmation.tsx` - Email confirmation sahifasi yaratildi
3. ✅ `app/(auth)/signup.tsx` - Email confirmation flow qo'shildi
4. ✅ `app.config.js` - Deep linking sozlandi

## 1. Supabase Dashboard'da Email Confirmation Sozlash

### Qadam 1: Supabase Dashboard'ga kiring
1. [Supabase Dashboard](https://app.supabase.com) ga kiring
2. Loyihangizni tanlang

### Qadam 2: Authentication Settings
1. **Authentication** > **Settings** ga o'ting
2. **Email Auth** bo'limini toping

### Qadam 3: Email Confirmation Yoqish
1. **Enable email confirmations** ni yoqing ✅
2. **Confirm email** ni tanlang
3. **Secure email change** ni ham yoqishingiz mumkin (ixtiyoriy)

### Qadam 4: Email Template Sozlash (ixtiyoriy)
1. **Email Templates** > **Confirm signup** ga o'ting
2. Email matnini o'zgartirishingiz mumkin
3. **Confirm link** quyidagi formatda bo'lishi kerak:
   ```
   {{ .ConfirmationURL }}
   ```

**Misol email template:**
```
Sizning Hamkor Talim hisobingizni tasdiqlash uchun quyidagi linkni bosing:

{{ .ConfirmationURL }}

Agar siz bu hisobni yaratmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.
```

### Qadam 5: Redirect URL Sozlash
1. **Site URL** ni sozlang:
   - Development: `exp://localhost:8081`
   - Production: `hamkor-talim://`

2. **Redirect URLs** ga quyidagilarni qo'shing:
   ```
   hamkor-talim://email-confirmation
   exp://localhost:8081/email-confirmation
   ```

### Qadam 6: Email Provider Sozlash (Production uchun)
1. **SMTP Settings** ga o'ting
2. O'z SMTP serveringizni sozlang (Gmail, SendGrid, va h.k.)
3. Yoki Supabase'ning default email xizmatidan foydalaning

## 2. Kodda Qilingan O'zgarishlar

### ✅ `hooks/useAuth.tsx`
- `signUp` funksiyasi email confirmation qo'llab-quvvatlaydi
- `resendConfirmationEmail` funksiyasi qo'shildi
- Email confirmation kerak bo'lsa, avtomatik kirish o'chirildi

### ✅ `app/(auth)/email-confirmation.tsx`
- Email confirmation sahifasi yaratildi
- Email qayta yuborish funksiyasi qo'shildi
- Deep linking orqali email confirmation linkini handle qiladi

### ✅ `app/(auth)/signup.tsx`
- Email confirmation kerak bo'lsa, email-confirmation sahifasiga yo'naltiradi

### ✅ `app.config.js`
- Deep linking sozlandi: `scheme: 'hamkor-talim'`

## 3. Deep Linking Ishlashi

Expo Router avtomatik ravishda deep linking'ni handle qiladi. Email'dagi link quyidagi formatda bo'ladi:

```
hamkor-talim://email-confirmation?token_hash=xxx&type=signup&email=user@example.com
```

Ilova bu linkni ochganda, `email-confirmation` sahifasiga yo'naltiradi va email avtomatik tasdiqlanadi.

## 4. Test Qilish

### Development'da test qilish:
1. Ilovani ishga tushiring: `npm run dev`
2. Yangi foydalanuvchi ro'yxatdan o'tkazish
3. Email pochtangizni tekshiring
4. Email'dagi linkni bosish (browser'da ochiladi)
5. Deep linking orqali ilovaga qaytish

### Production'da test qilish:
1. Ilovani build qiling: `eas build`
2. Ilovani o'rnating
3. Yangi foydalanuvchi ro'yxatdan o'tkazish
4. Email'dagi linkni bosish
5. Ilovada email confirmation sahifasini ko'rish

## 5. Muammolarni Hal Qilish

### Email kelmayapti:
- Spam papkasini tekshiring
- Email provider sozlamalarini tekshiring
- Supabase Dashboard'da email xabarlarini tekshiring

### Deep linking ishlamayapti:
- `app.config.js` da `scheme` to'g'ri sozlanganligini tekshiring
- Ilovani qayta build qiling
- Expo Go'da test qilayotgan bo'lsangiz, deep linking ishlamasligi mumkin

### Email confirmation sahifasi ochilmayapti:
- `app/(auth)/_layout.tsx` da `email-confirmation` sahifasi qo'shilganligini tekshiring
- URL parametrlarini tekshiring

## 6. Qo'shimcha Funksiyalar

### Email qayta yuborish:
- Email confirmation sahifasida "Email qayta yuborish" tugmasi mavjud
- Foydalanuvchi email kelmagan bo'lsa, qayta yuborish mumkin

### Email tasdiqlanganligini tekshirish:
- `useAuth` hook'ida `user.email_confirmed_at` orqali tekshirish mumkin
- Agar email tasdiqlanmagan bo'lsa, maxsus sahifa ko'rsatish mumkin

## 7. Xavfsizlik

- Email confirmation majburiy bo'lishi kerak
- Email tasdiqlanmagan foydalanuvchilar tizimga kira olmasligi kerak
- Email confirmation token'lar faqat bir marta ishlatilishi kerak

## 8. Keyingi Qadamlar

1. Supabase Dashboard'da email confirmation'ni yoqing
2. Redirect URL'larni sozlang
3. Email template'ni o'zgartiring (ixtiyoriy)
4. Ilovani test qiling
5. Production'da email provider sozlang

