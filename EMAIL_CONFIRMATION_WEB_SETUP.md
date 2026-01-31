# Email Confirmation Web Sahifa Sozlash

## Muammo

Production'da email'dagi linkni foydalanuvchi har doim mobil qurilmada ochmaydi. Desktop kompyuterda yoki boshqa qurilmada ochilganda, deep linking ishlamaydi.

## Yechim

Web sahifa yaratish kerak, u:
1. Email confirmation'ni handle qiladi
2. Keyin mobil ilovaga redirect qiladi (deep linking orqali)
3. Yoki foydalanuvchiga xabar ko'rsatadi

## Qadam 1: Web Sahifa Yaratish

`public/email-confirmation.html` fayli yaratildi. Bu fayl:
- Email confirmation'ni handle qiladi
- Supabase API orqali email tasdiqlaydi
- Keyin mobil ilovaga redirect qiladi

## Qadam 2: Web Sahifani Hosting Qilish

### Variant 1: Supabase Storage (Eng oson)

1. Supabase Dashboard'ga kiring
2. **Storage** > **Buckets** ga o'ting
3. Yangi bucket yarating: `public` (agar yo'q bo'lsa)
4. `email-confirmation.html` faylini yuklang
5. Public URL oling

### Variant 2: Vercel/Netlify (Tavsiya etiladi)

1. Vercel yoki Netlify'ga kirib, yangi loyiha yarating
2. `public/email-confirmation.html` faylini yuklang
3. Domain sozlang (masalan: `https://hamkor-talim.vercel.app`)

### Variant 3: O'z Serveringiz

1. O'z web serveringizga `email-confirmation.html` faylini yuklang
2. Public URL oling

## Qadam 3: Supabase Redirect URL Sozlash

1. Supabase Dashboard'ga kiring
2. **Authentication** > **URL Configuration** ga o'ting
3. **Redirect URLs** ga quyidagilarni qo'shing:

```
https://yourdomain.com/email-confirmation
hamkor-talim://email-confirmation
exp://localhost:8081/email-confirmation
```

**Misol:**
```
https://hamkor-talim.vercel.app/email-confirmation
hamkor-talim://email-confirmation
```

## Qadam 4: Web Sahifani Sozlash

`public/email-confirmation.html` faylida quyidagilarni o'zgartiring:

```javascript
// Supabase konfiguratsiyasi
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

Yoki environment variable'lardan oling (production uchun yaxshiroq).

## Qadam 5: Email Template Sozlash

Supabase Dashboard'da:
1. **Authentication** > **Email Templates** > **Confirm signup** ga o'ting
2. **Redirect URL** ni o'zgartiring:

```
{{ .SiteURL }}/email-confirmation?token_hash={{ .TokenHash }}&type={{ .Type }}&email={{ .Email }}
```

## Qadam 6: Test Qilish

1. Web sahifani hosting qiling
2. Supabase'da redirect URL'ni sozlang
3. Yangi foydalanuvchi ro'yxatdan o'tkazish
4. Email'dagi linkni bosish
5. Web sahifada email tasdiqlanishini tekshiring
6. Mobil ilovaga redirect qilinishini tekshiring

## Alternativ Yechim: Supabase Edge Function

Agar web sahifa yaratishni xohlamasangiz, Supabase Edge Function ishlatishingiz mumkin:

1. Supabase Dashboard'da **Edge Functions** ga o'ting
2. Yangi function yarating: `email-confirmation`
3. Function kodini yozing
4. Redirect URL'ni function URL'iga o'zgartiring

## Qo'shimcha: Environment Variables

Production uchun environment variable'lardan foydalanish yaxshiroq:

```html
<script>
    const SUPABASE_URL = '<%= process.env.SUPABASE_URL %>';
    const SUPABASE_ANON_KEY = '<%= process.env.SUPABASE_ANON_KEY %>';
</script>
```

Yoki build vaqtida o'zgartirish:

```bash
# Build vaqtida
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_ANON_KEY=your-key \
npm run build
```

## Xavfsizlik

1. ✅ Supabase Anon Key public bo'lishi mumkin (faqat read operations uchun)
2. ✅ Token hash faqat bir marta ishlatilishi kerak
3. ✅ Email confirmation faqat signup type uchun ishlashi kerak
4. ✅ CORS sozlamalarini tekshiring

## Xulosa

**Production uchun web sahifa yaratish tavsiya etiladi**, chunki:
- ✅ Barcha qurilmalarda ishlaydi
- ✅ Foydalanuvchi tajribasi yaxshiroq
- ✅ Deep linking'ga qo'shimcha variant
- ✅ Xatoliklarni yaxshiroq handle qiladi

