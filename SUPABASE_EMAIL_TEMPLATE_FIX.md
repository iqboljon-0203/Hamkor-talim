# Supabase Email Template To'g'ri Sozlash

## Muammo

Console'da quyidagi xatolik ko'rsatilmoqda:
```
Token Hash: undefined
Type: undefined
Email: undefined
```

Bu shuni anglatadiki, Supabase email'dagi link to'g'ri formatda kelmayapti.

## Yechim

### Variant 1: Supabase Email Template'ni To'g'ri Sozlash (Tavsiya etiladi)

1. **Supabase Dashboard'ga kiring**
2. **Authentication** > **Email Templates** > **Confirm signup** ga o'ting
3. **Redirect URL** ni quyidagicha o'zgartiring:

```
{{ .SiteURL }}/email-confirmation?token_hash={{ .TokenHash }}&type={{ .Type }}&email={{ .Email }}
```

**Muhim:** `{{ .SiteURL }}` o'rniga to'liq web sahifangiz URL'ini qo'ying:

```
https://hamkor-talim-email.vercel.app/email-confirmation?token_hash={{ .TokenHash }}&type={{ .Type }}&email={{ .Email }}
```

### Variant 2: Supabase'ning Default Flow'ini Ishlatish

Agar yuqoridagi variant ishlamasa, Supabase'ning default flow'ini ishlating:

1. **Supabase Dashboard'da:**
   - **Authentication** > **Email Templates** > **Confirm signup**
   - **Redirect URL** ni quyidagicha qoldiring:
     ```
     {{ .ConfirmationURL }}
     ```

2. **Supabase'ning default verify endpoint'i:**
   - Supabase avtomatik ravishda email'ni tasdiqlaydi
   - Keyin sizning redirect URL'ingizga yo'naltiradi
   - Lekin bu holda token hash URL'da bo'lmaydi

3. **Yechim:** Web sahifangizni Supabase'ning verify endpoint'idan keyin ochish:
   - Supabase verify endpoint: `https://your-project.supabase.co/auth/v1/verify`
   - Bu endpoint email'ni tasdiqlaydi va keyin redirect qiladi
   - Sizning web sahifangiz Supabase'ning redirect URL'i bo'lishi kerak

### Variant 3: Supabase Edge Function Ishlatish (Eng yaxshi yechim)

1. **Supabase Dashboard'da:**
   - **Edge Functions** ga o'ting
   - Yangi function yarating: `email-confirmation`

2. **Function kodi:**
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

   serve(async (req) => {
     const url = new URL(req.url);
     const tokenHash = url.searchParams.get('token_hash');
     const type = url.searchParams.get('type');
     const email = url.searchParams.get('email');

     // Supabase'da email'ni tasdiqlash
     // Keyin web sahifangizga redirect qilish
     
     return new Response(null, {
       status: 302,
       headers: {
         'Location': `https://your-web-domain.com/email-confirmation?token_hash=${tokenHash}&type=${type}&email=${email}`
       }
     });
   });
   ```

3. **Email template'da:**
   ```
   https://your-project.supabase.co/functions/v1/email-confirmation?token_hash={{ .TokenHash }}&type={{ .Type }}&email={{ .Email }}
   ```

## Tekshirish

1. Yangi foydalanuvchi ro'yxatdan o'tkazish
2. Email'dagi linkni browser'da oching
3. Browser console'ni tekshiring (F12)
4. URL parametrlarini ko'ring

Agar hali ham `undefined` bo'lsa, email template'ni qayta tekshiring.

## Qo'shimcha: Browser'da To'g'ridan-To'g'ri Test Qilish

Test uchun browser'da quyidagi URL'ni oching (o'z qiymatlaringiz bilan):

```
https://your-web-domain.com/email-confirmation?token_hash=test123&type=signup&email=test@example.com
```

Agar bu ishlasa, muammo Supabase email template'da.

