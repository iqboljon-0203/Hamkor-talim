# Hamkor Ta'lim - Web Sayt va PWA Qo'llanmasi

Loyiha to'liq **Web Sayt** sifatida moslashtirildi va uning ichiga istalgan vaqtda telefon yoki kompyuterga **PWA (Progressive Web App)** ilova sifatida yuklab olish (o'rnatish) imkoniyati qo'shildi.

---

## 🌐 1. Sayt sifatida ishlashi

- **Barcha qurilmalarga mos:**
  - Kompyuter (Desktop / Laptop) brauzerlarida sayt ekranga cho'zilib ketmaydi, markazlashgan qulay web interfeysda ochiladi.
  - Mobil telefon va planshet brauzerlarida to'liq ekran moslashadi.
- **Ilovani o'rnatmasdan ham to'liq foydalanish:**
  - Foydalanuvchi ilovani o'rnatishi shart emas: to'g'ridan-to'g'ri sayt orqali ro'yxatdan o'tishi, tizimga kirishi, vazifalarni topshirishi, guruhlar va natijalarni ko'rishi mumkin.
- **Supabase bilan to'liq integratsiya:**
  - Web brauzer orqali fayl va rasm yuklash, avtorizatsiya va real-time xizmatlar to'liq ishlaydi.

---

## 📲 2. Sayt ichidan PWA ilovani yuklab olish imkoniyatlari

Sayt ichida foydalanuvchiga qulay bo'lishi uchun 4 xil joyda ilovani yuklab olish imkoniyati yaratilgan:

1. **Yuqori xabarnoma (Install Banner):**
   - Sayt ochilishi bilan tepada `"Hamkor Ta'lim Mobil Ilovasi"` va `"Yuklab olish"` tugmasi ko'rinadi.
2. **Kirish / Ro'yxatdan o'tish sahifasida:**
   - Asosiy kirish oynasi tagida `"Mobil ilovani telefonga o'rnatish"` tugmasi joylashtirilgan.
3. **Sahifalar yuqori qismida (AppHeader):**
   - Tizim ichida har bir sahifa sarlavhasida (qo'ng'iroqcha yonida) `"Ilova"` tugmasi doim mavjud.
4. **Profil sozlamalarida:**
   - Profil bo'limida `"Mobil ilovani o'rnatish (PWA)"` menyusi orqali istalgan vaqtda o'rnatish mumkin.

---

## 🎯 3. Yuklab olish oynasi (Install Modal) qanday ishlaydi?

Tugma bosilganda aqlli o'rnatish dialogi ochiladi:

- **Android telefonlarda (Chrome, Samsung Internet, Edge):**
  - Ekranda `"Telefonga yuklab olish (O'rnatish)"` tugmasi chiqadi.
  - Bir marta bosish bilan brauzer ilovani telefon bosh ekraniga o'rnatib beradi.
- **iOS / iPhone telefonlarda (Safari):**
  - Safari uchun qadamma-qadam ko'rsatma chiqadi:
    1. Pastdagi **Ulashish (Share)** tugmasini bosing.
    2. **"Asosiy ekranga qo'shish" (Add to Home Screen)** ni tanlang.
    3. **"Qo'shish" (Add)** ni bosing.
- **Kompyuterda ochilganda:**
  - Oynada **QR kod** paydo bo'ladi. Foydalanuvchi telefon kamerasini kompyuter ekraniga qaratib, saytni darhol o'z telefonida ochishi va o'rnatib olishi mumkin.
  - Xohlasa, kompyuter brauzeriga ham alohida desktop ilova qilib o'rnatishi mumkin.

---

## 🛠 Ishga tushirish va Deploy qilish buyruqlari

### Mahalliy kompyuterda saytni ochish:
```bash
npm run web
```

### Web export (Production build):
```bash
npm run build:web
```
Tayyor fayllar `dist/` papkasiga yig'iladi.

### Vercel'ga yuklash:
```bash
npx vercel --prod
```
yoki loyihani GitHub orqali Vercel/Netlify'ga ulab qo'yilsa, har safar avtomatik yangilanadi.
