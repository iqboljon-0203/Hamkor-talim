# Vercel Routing Muammosini Hal Qilish

## Muammo

`/email-confirmation` path'i 404 xatosi beradi, chunki Vercel oddiy HTML fayllar uchun routing'ni avtomatik qilmaydi.

## Yechim: Papka Strukturasini O'zgartirish

### Qadam 1: Yangi Papka Yaratish

1. Loyihangizda yangi papka yarating: `email-confirmation`
2. `index.html` faylini (yoki `email-confirmation.html`) `email-confirmation` papkasiga ko'chiring
3. Fayl nomini `index.html` ga o'zgartiring

**Natija:**
```
EMAIL-CONFIRM/
  ├── index.html (bosh sahifa)
  ├── email-confirmation/
  │   └── index.html (email confirmation sahifasi)
  └── vercel.json
```

### Qadam 2: Vercel'ga Qayta Deploy

1. Terminal'da loyiha papkasiga kiring
2. Deploy qiling:
   ```bash
   vercel --prod
   ```

### Qadam 3: Test Qilish

1. Browser'da quyidagi URL'ni oching:
   ```
   https://hamkor-email-confirm.vercel.app/email-confirmation
   ```

2. Endi ishlashi kerak!

## Alternativ: vercel.json To'g'ri Sozlash

Agar papka strukturasini o'zgartirmoqchi bo'lmasangiz, `vercel.json` ni quyidagicha sozlang:

```json
{
  "rewrites": [
    {
      "source": "/email-confirmation",
      "destination": "/email-confirmation.html"
    },
    {
      "source": "/email-confirmation/:path*",
      "destination": "/email-confirmation.html"
    }
  ]
}
```

Lekin bu holda `email-confirmation.html` fayli root papkada bo'lishi kerak.

