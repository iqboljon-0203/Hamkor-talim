# Supabase Email Template Redirect URL Tuzatish

## Muammo

Email'dagi link faqat root URL'ga (`https://hamkor-email-confirm.vercel.app/`) yo'naltirayapti, `/email-confirmation` path'i va parametrlar yo'q.

## Yechim

### QADAM 1: Supabase Dashboard'ga kiring

1. [Supabase Dashboard](https://app.supabase.com) ga kiring
2. Loyihangizni tanlang

### QADAM 2: Email Template'ni ochish

1. **Authentication** > **Email Templates** ga o'ting
2. **Confirm signup** template'ni tanlang

### QADAM 3: Redirect URL'ni to'g'rilash

**Body** qismida, link (`<a>` tag) ichida `href` atributini quyidagicha o'zgartiring:

**❌ Noto'g'ri (hozirgi holat):**
```html
<a href="{{ .ConfirmationURL }}">Email Tasdiqlash</a>
```

**✅ To'g'ri:**
```html
<a href="https://hamkor-email-confirm.vercel.app/email-confirmation?token_hash={{ .TokenHash }}&type={{ .Type }}&email={{ .Email }}">Email Tasdiqlash</a>
```

### QADAM 4: To'liq Email Template (nusxa olish uchun)

Quyidagi kodni **Body** maydoniga qo'ying:

```html
<h2>Hamkor Talim'ga xush kelibsiz!</h2>

<p>Salom,</p>

<p>Hisobingizni faollashtirish uchun quyidagi linkni bosing:</p>

<p style="margin: 20px 0;">
  <a href="https://hamkor-email-confirm.vercel.app/email-confirmation?token_hash={{ .TokenHash }}&type={{ .Type }}&email={{ .Email }}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Email Tasdiqlash
  </a>
</p>

<p>Agar siz bu hisobni yaratmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>

<p>Hurmat bilan,<br>Hamkor Talim jamoasi</p>
```

### QADAM 5: Save qilish

1. **Save changes** tugmasini bosing
2. "Template saved successfully" xabari ko'rinishi kerak

### QADAM 6: Test qilish

1. Yangi foydalanuvchi ro'yxatdan o'tkazish
2. Email pochtangizni tekshiring
3. Email'dagi linkni bosing
4. Endi URL quyidagicha bo'lishi kerak:
   ```
   https://hamkor-email-confirm.vercel.app/email-confirmation?token_hash=xxx&type=signup&email=xxx@example.com
   ```

## Muhim eslatmalar

1. **`{{ .TokenHash }}`**, **`{{ .Type }}`**, **`{{ .Email }}`** - bu Supabase'ning o'z o'zgaruvchilari, ularni o'zgartirmang!

2. **`https://hamkor-email-confirm.vercel.app`** - bu sizning web sahifangiz URL'i. Agar boshqa URL ishlatsangiz, uni o'zgartiring.

3. **`/email-confirmation`** - bu sizning web sahifangiz path'i. Agar boshqa path ishlatsangiz, uni o'zgartiring.

## Muammo bo'lsa

Agar hali ham ishlamasa:

1. **Browser console'ni oching** (F12) va quyidagilarni tekshiring:
   - URL to'g'ri kelayaptimi?
   - Parametrlar bor yoki yo'q?

2. **Supabase Logs'ni tekshiring:**
   - **Logs** > **Auth Logs** ga o'ting
   - Email yuborilganligini tekshiring

3. **Vercel routing'ni tekshiring:**
   - `vercel.json` faylida `/email-confirmation` path'i to'g'ri sozlanganligini tekshiring

