// Bir martalik: E2E uchun sinov o'qituvchi/o'quvchi hisoblarini ro'yxatdan o'tkazadi.
// Parollar .env.test.local ga yoziladi (gitignore). Email tasdiqlash SQL orqali qilinadi.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const outFile = new URL('../.env.test.local', import.meta.url);
if (existsSync(outFile)) { console.log('.env.test.local already exists — skipping'); process.exit(0); }

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const users = {
  TEACHER: { email: 'iqboljonyuldashev03+e2e-teacher@gmail.com', role: 'teacher', name: 'E2E Ustoz' },
  STUDENT: { email: 'iqboljonyuldashev03+e2e-student@gmail.com', role: 'student', name: "E2E O'quvchi" },
};
const lines = [];
for (const [key, u] of Object.entries(users)) {
  const password = 'E2e!' + randomBytes(9).toString('base64url');
  const { data, error } = await supabase.auth.signUp({
    email: u.email, password,
    options: { data: { full_name: u.name, role: u.role } },
  });
  if (error) { console.error(key, error.message); process.exit(1); }
  console.log(key, 'created', data.user?.id);
  lines.push(`E2E_${key}_EMAIL=${u.email}`, `E2E_${key}_PASSWORD=${password}`, `E2E_${key}_ID=${data.user?.id}`);
}
writeFileSync(outFile, lines.join('\n') + '\n');
console.log('saved .env.test.local');
