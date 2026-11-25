/**
 * Kabinet (dashboard) uchun to'liq E2E test.
 *
 * Haqiqiy Supabase backend'ga qarshi ishlaydi, sinov hisoblari .env.test.local dan olinadi
 * (yaratish: `node e2e/create-test-users.mjs`, keyin email'lar SQL orqali tasdiqlanadi).
 * Test o'zi yaratgan guruh/topshiriq/javob/fayllarni oxirida o'chiradi.
 *
 * Ishga tushirish:  npm run build && npm run test:e2e
 */
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

// ---------- env ----------
function loadEnv(file: string): Record<string, string> {
  const p = path.join(__dirname, '..', file);
  if (!existsSync(p)) return {};
  return Object.fromEntries(
    readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  );
}
const env = { ...loadEnv('.env.local'), ...loadEnv('.env.test.local'), ...process.env } as Record<string, string>;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEACHER = { email: env.E2E_TEACHER_EMAIL, password: env.E2E_TEACHER_PASSWORD, name: 'E2E Ustoz' };
const STUDENT = { email: env.E2E_STUDENT_EMAIL, password: env.E2E_STUDENT_PASSWORD, name: "E2E O'quvchi" };

const RUN = Date.now().toString(36);
const GROUP_NAME = `E2E Guruh ${RUN}`;
const TASK_TITLE = `E2E Topshiriq ${RUN}`;
const TASK_DESC = 'Avtomatik test topshirig\'i — 3 ta misol yeching.';
const ANSWER_TEXT = `E2E javob matni ${RUN}`;
const ANSWER_TEXT_EDITED = `E2E tahrirlangan javob ${RUN}`;
const FEEDBACK = `A'lo ish! (${RUN})`;
const DUE_LOCAL = '2030-06-15T14:30'; // Asia/Tashkent => 09:30Z

const PDF = path.join(__dirname, 'fixtures', 'topshiriq.pdf');
const PNG = path.join(__dirname, 'fixtures', 'javob.png');

// ---------- helpers ----------
async function apiAs(user: { email: string; password: string }): Promise<SupabaseClient> {
  const c = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: user.email, password: user.password });
  if (error) throw new Error(`API login failed for ${user.email}: ${error.message}`);
  return c;
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|Failed to load resource.*(sw\.js|manifest)/i.test(m.text())) {
      errors.push(`console: ${m.text()}`);
    }
  });
  return errors;
}

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByPlaceholder('misol@gmail.com').fill(user.email);
  await page.getByPlaceholder('Parolingiz').fill(user.password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 30_000 });
  await expect(page.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
}

/** Toast ko'rinadi VA boshqa oynalar ostida qolmagan (haqiqatan eng ustda) */
async function expectToast(page: Page, text: string | RegExp) {
  const toast = page.getByText(text).first();
  await expect(toast).toBeVisible();
  const onTop = await toast.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
  });
  expect(onTop, `toast "${text}" boshqa element ostida qolgan`).toBeTruthy();
}

async function expectUrlOk(url: string) {
  expect(url, 'file url').toMatch(/^https:\/\/.+\/storage\/v1\/object\/public\//);
  const res = await fetch(url);
  expect(res.status, `GET ${url}`).toBe(200);
  return res;
}

// ---------- shared state ----------
let teacherApi: SupabaseClient;
let studentApi: SupabaseClient;
let groupId = '';
let taskId = '';
let taskFileUrl = '';
let submissionFileUrl = '';
let teacherCtx: BrowserContext;
let studentCtx: BrowserContext;
let teacher: Page;
let student: Page;
let teacherErrors: string[] = [];
let studentErrors: string[] = [];

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  expect(TEACHER.email && TEACHER.password && STUDENT.email && STUDENT.password, '.env.test.local').toBeTruthy();
  teacherApi = await apiAs(TEACHER);
  studentApi = await apiAs(STUDENT);
  teacherCtx = await browser.newContext();
  studentCtx = await browser.newContext();
  teacher = await teacherCtx.newPage();
  student = await studentCtx.newPage();
  teacherErrors = trackErrors(teacher);
  studentErrors = trackErrors(student);
});

test.afterAll(async () => {
  // Test yaratgan narsalarni tozalash (RLS ruxsat bergan qismi)
  try {
    if (submissionFileUrl) {
      const key = submissionFileUrl.split('/submission-files/')[1];
      if (key) await studentApi.storage.from('submission-files').remove([decodeURIComponent(key)]);
    }
    if (taskId) {
      await studentApi.from('submissions').delete().eq('task_id', taskId);
      await teacherApi.from('tasks').delete().eq('id', taskId);
    }
    if (taskFileUrl) {
      const key = taskFileUrl.split('/task-files/')[1];
      if (key) await teacherApi.storage.from('task-files').remove([decodeURIComponent(key)]);
    }
    if (groupId) {
      await studentApi.from('group_members').delete().eq('group_id', groupId).eq('user_id', env.E2E_STUDENT_ID);
      // groups jadvalida DELETE siyosati yo'q — guruh nomi bo'yicha SQL bilan tozalanadi
    }
  } finally {
    await teacherCtx?.close();
    await studentCtx?.close();
  }
});

// ================= TESTS =================

test('1. O\'qituvchi tizimga kiradi va ustoz kabineti ochiladi', async () => {
  await login(teacher, TEACHER);
  await expect(teacher.getByText('USTOZ KABINETI')).toBeVisible();
  await expect(teacher.getByRole('button', { name: /Yangi Topshiriq/ })).toBeVisible();
  await expect(teacher.getByRole('button', { name: /Guruh Yaratish/ })).toBeVisible();
});

test('2. O\'qituvchi guruh yaratadi', async () => {
  await teacher.getByRole('button', { name: /Guruh Yaratish/ }).first().click();
  await teacher.getByPlaceholder('Masalan: 10-A Sinf Matematika').fill(GROUP_NAME);
  await teacher.getByPlaceholder("Guruh maqsadi yoki dars vaqtlari...").fill('E2E test guruhi');
  await teacher.getByRole('button', { name: /Guruhni Saqlash/ }).click();
  await expectToast(teacher, 'Yangi guruh muvaffaqiyatli ochildi!');

  const { data } = await teacherApi.from('groups').select('id').eq('name', GROUP_NAME).single();
  expect(data?.id).toBeTruthy();
  groupId = data!.id;

  await teacher.getByRole('button', { name: /Guruhlar/ }).first().click();
  await expect(teacher.getByText(GROUP_NAME)).toBeVisible();
});

test('3. O\'qituvchi PDF fayl biriktirilgan topshiriq yaratadi (dedlayn to\'g\'ri saqlanadi)', async () => {
  await teacher.getByRole('button', { name: /Yangi Topshiriq/ }).first().click();
  await teacher.getByPlaceholder("Masalan: 12-Mavzu bo'yicha masalalar").fill(TASK_TITLE);
  await teacher.locator('select').filter({ hasText: 'Guruhni tanlang...' }).selectOption({ label: GROUP_NAME });
  await teacher.locator('input[type="datetime-local"]').fill(DUE_LOCAL);
  await teacher.getByPlaceholder('Vazifa shartlari va talablari...').fill(TASK_DESC);
  await teacher.locator('form input[type="file"]').setInputFiles(PDF);
  const submit = teacher.getByRole('button', { name: /Topshiriqni E'lon Qilish/ });
  await submit.click();
  // modal muvaffaqiyatli yopilishi va topshiriq bazada paydo bo'lishi kerak
  await expect(submit).toBeHidden({ timeout: 30_000 });
  await expect
    .poll(async () => (await teacherApi.from('tasks').select('id').eq('title', TASK_TITLE)).data?.length, {
      timeout: 15_000,
    })
    .toBe(1);
  await expect(teacher.getByText(/xatolik/i)).toHaveCount(0);

  const { data: task } = await teacherApi
    .from('tasks')
    .select('id, file_url, due_date, group_id')
    .eq('title', TASK_TITLE)
    .single();
  expect(task?.group_id).toBe(groupId);
  taskId = task!.id;
  taskFileUrl = task!.file_url;
  expect(taskFileUrl).toContain('/task-files/');
  const res = await expectUrlOk(taskFileUrl);
  expect((await res.text()).startsWith('%PDF')).toBeTruthy();
  // 14:30 Toshkent vaqti = 09:30 UTC
  expect(new Date(task!.due_date).toISOString()).toBe('2030-06-15T09:30:00.000Z');
});

test('4. O\'quvchi tizimga kiradi va guruhga ID orqali qo\'shiladi', async () => {
  await login(student, STUDENT);
  await expect(student.getByRole('button', { name: /Guruhga Qo'shilish/ }).first()).toBeVisible();
  // a'zo bo'lmagan guruhlarning topshirig'i ko'rinmasligi kerak
  await expect(student.getByText(TASK_TITLE)).toHaveCount(0);

  await student.getByRole('button', { name: /Guruhga Qo'shilish/ }).first().click();
  await student.getByPlaceholder('Masalan: c8a19283-...').fill(groupId);
  await student.getByRole('button', { name: /Guruhga A'zo Bo'lish/ }).click();
  await expectToast(student, "Guruhga muvaffaqiyatli a'zo bo'ldingiz!");
  await expect(student.getByText(TASK_TITLE).first()).toBeVisible();
});

test('5. O\'quvchi topshiriqni ochadi va ustoz biriktirgan faylni ko\'radi', async () => {
  await student.getByText(TASK_TITLE).first().click();
  await expect(student.getByText('Ustoz biriktirgan fayl yoki rasm:')).toBeVisible();
  await expect(student.getByText(TASK_DESC).last()).toBeVisible();
  const link = student.getByRole('link', { name: /Faylni yuklab olish \/ ko'rish/ });
  await expect(link).toBeVisible();
  expect(await link.getAttribute('href')).toBe(taskFileUrl);
});

test('6. O\'quvchi matn + rasm bilan javob yuboradi (fayl submission-files ga yuklanadi)', async () => {
  await student.getByPlaceholder("Bajargan ishingiz haqida qisqacha ma'lumot yozing...").fill(ANSWER_TEXT);
  await student.locator('form input[type="file"]').setInputFiles(PNG);
  await student.getByRole('button', { name: /Javobni Yuborish/ }).click();
  await expectToast(student, 'Topshiriq javobi muvaffaqiyatli yuborildi!');
  await expect(student.getByText(/Vazifa topshirilgan/)).toBeVisible();

  const { data: sub } = await studentApi
    .from('submissions')
    .select('id, content, file_url')
    .eq('task_id', taskId)
    .single();
  expect(sub?.content).toBe(ANSWER_TEXT);
  submissionFileUrl = sub!.file_url;
  expect(submissionFileUrl).toContain('/submission-files/');
  const res = await expectUrlOk(submissionFileUrl);
  expect(res.headers.get('content-type')).toContain('image/png');
});

test('7. O\'quvchi javobini tahrirlaydi (fayl saqlanib qoladi)', async () => {
  await student.getByRole('button', { name: /qayta yuborish \/ tahrirlash/ }).first().click();
  const area = student.getByPlaceholder("Bajargan ishingiz haqida qisqacha ma'lumot yozing...");
  await area.fill(ANSWER_TEXT_EDITED);
  await student.getByRole('button', { name: /Javobni Yuborish/ }).click();
  await expectToast(student, 'Topshiriq javobi muvaffaqiyatli yuborildi!');

  const { data: subs } = await studentApi.from('submissions').select('content, file_url').eq('task_id', taskId);
  expect(subs).toHaveLength(1);
  expect(subs![0].content).toBe(ANSWER_TEXT_EDITED);
  expect(subs![0].file_url).toBe(submissionFileUrl);
});

test('8. O\'qituvchi javobni ko\'radi, rasmni ochadi va 5 ball qo\'yadi', async () => {
  await teacher.reload();
  await expect(teacher.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
  await teacher.getByRole('button', { name: /Topshiriqlar/ }).first().click();
  await teacher.getByText(TASK_TITLE).first().click();
  await expect(teacher.getByText("O'quvchilar javoblari (1)")).toBeVisible();
  await expect(teacher.getByText(STUDENT.name).first()).toBeVisible();
  await expect(teacher.getByText(ANSWER_TEXT_EDITED).first()).toBeVisible();

  // rasm preview
  await teacher.getByRole('button', { name: /Javob fayli\/rasmini ochish/ }).first().click();
  const img = teacher.locator(`img[src="${submissionFileUrl}"]`);
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBeTruthy();
  await img.click(); // lightbox overlay bosilganda yopiladi
  await expect(img).toBeHidden();

  await teacher.getByRole('button', { name: /^Baholash$/ }).first().click();
  await teacher.getByRole('button', { name: /^5$/ }).click();
  await teacher.getByPlaceholder("A'lo ish, barcha misollar to'g'ri ishlangan...").fill(FEEDBACK);
  await teacher.getByRole('button', { name: /Bahoni Saqlash/ }).click();
  await expectToast(teacher, 'Baho va izoh muvaffaqiyatli saqlandi!');
  await expect(teacher.getByText('5 ball').first()).toBeVisible();

  const { data: sub } = await teacherApi.from('submissions').select('rating, feedback').eq('task_id', taskId).single();
  expect(sub).toEqual({ rating: 5, feedback: FEEDBACK });
});

test('9. O\'quvchi bahosini va ustoz izohini ko\'radi', async () => {
  await student.reload();
  await expect(student.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
  await student.getByText(TASK_TITLE).first().click();
  await expect(student.getByText(/5 ball/).first()).toBeVisible();
  await expect(student.getByText(FEEDBACK).first()).toBeVisible();
});

test('10. Guruh a\'zolari, natijalar va taqvim bo\'limlari ishlaydi', async () => {
  await teacher.reload();
  await expect(teacher.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
  await teacher.getByRole('button', { name: /Guruhlar/ }).first().click();
  const card = teacher.locator('div').filter({ hasText: GROUP_NAME }).filter({ has: teacher.getByRole('button', { name: /A'zolar/ }) }).last();
  await card.getByRole('button', { name: /A'zolar/ }).click();
  await expect(teacher.getByText(STUDENT.name).first()).toBeVisible();
  await teacher.keyboard.press('Escape');

  await teacher.goto('/dashboard');
  await expect(teacher.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
  await teacher.getByRole('button', { name: /Baholar & Natijalar/ }).first().click();
  await expect(teacher.getByText(TASK_TITLE).first()).toBeVisible();
  await teacher.getByRole('button', { name: /Taqvim/ }).first().click();
  await expect(teacher.getByText(TASK_TITLE).first()).toBeVisible();

  await student.goto('/dashboard');
  await expect(student.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
  await student.getByRole('button', { name: /Baholar & Natijalar/ }).first().click();
  await expect(student.getByText(/5 ball/).first()).toBeVisible();
});

test('11. Qidiruv va filtrlar', async () => {
  await student.goto('/dashboard');
  await expect(student.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
  await student.getByPlaceholder('Qidirish...').fill(RUN);
  await expect(student.getByText(TASK_TITLE).first()).toBeVisible();
  await student.getByPlaceholder('Qidirish...').fill('hech-qanday-bunday-topshiriq-yoq');
  await expect(student.getByText(TASK_TITLE)).toHaveCount(0);
  await student.getByPlaceholder('Qidirish...').fill('');
});

test('12. O\'qituvchi topshiriqni o\'chiradi', async () => {
  await teacher.goto('/dashboard');
  await expect(teacher.getByText('Tizimga kirish tekshirilmoqda...')).toBeHidden({ timeout: 30_000 });
  await teacher.getByText(TASK_TITLE).first().click();
  teacher.once('dialog', (d) => d.accept());
  await teacher.getByRole('button', { name: /Topshiriqni o'chirish/ }).click();
  await expectToast(teacher, "Topshiriq o'chirildi");

  const { data } = await teacherApi.from('tasks').select('id').eq('id', taskId);
  expect(data).toHaveLength(0);
  taskId = taskId; // afterAll still cleans submissions/files if any remain
});

test('13. Sahifalarda JavaScript xatolari bo\'lmadi', async () => {
  expect(teacherErrors, teacherErrors.join('\n')).toEqual([]);
  expect(studentErrors, studentErrors.join('\n')).toEqual([]);
});
