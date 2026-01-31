# Vercel'da Email Confirmation Path'ini Tuzatish

## Muammo

Vercel'da `/email-confirmation` path'i 404 xatosi beradi, chunki fayl `email-confirmation.html` sifatida mavjud.

## Yechim

### Variant 1: vercel.json Yaratish (Tavsiya etiladi)

1. **Loyiha root papkasida** `vercel.json` faylini yarating
2. Quyidagi kodni qo'ying:

```json
{
  "rewrites": [
    {
      "source": "/email-confirmation",
      "destination": "/email-confirmation.html"
    }
  ]
}
```

3. **Faylni saqlang**

4. **Vercel'ga qayta deploy qiling:**
   ```bash
   cd public
   vercel --prod
   ```

### Variant 2: Faylni Root Papkaga Ko'chirish

Agar `public` papkasidan deploy qilayotgan bo'lsangiz:

1. `email-confirmation.html` faylini `public` papkasida qoldiring
2. Vercel'da **Settings** > **General** ga o'ting
3. **Root Directory** ni `public` ga o'zgartiring
4. Yoki faylni root papkaga ko'chiring

### Variant 3: Vercel Dashboard'da Sozlash

1. Vercel Dashboard'da loyihangizni oching
2. **Settings** > **Rewrites** ga o'ting
3. **Add Rewrite** tugmasini bosing
4. Quyidagilarni kiriting:
   - **Source:** `/email-confirmation`
   - **Destination:** `/email-confirmation.html`
5. **Save** tugmasini bosing

## Test Qilish

1. Browser'da quyidagi URL'ni oching:
   ```
   https://hamkor-email-confirm.vercel.app/email-confirmation
   ```

2. Agar sahifa ochilsa, muammo hal qilindi!

## Qo'shimcha: Index.html Yaratish (ixtiyoriy)

Agar bosh sahifa ham kerak bo'lsa, `public/index.html` faylini yarating:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Hamkor Talim</title>
</head>
<body>
    <h1>Hamkor Talim</h1>
    <p>Email confirmation sahifasi: <a href="/email-confirmation">Bu yerga bosing</a></p>
</body>
</html>
```

