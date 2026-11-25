// E2E sinov hisoblari yaratgan barcha ma'lumot va fayllarni o'chiradi (RLS ruxsat bergan qismi).
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries([...readFileSync('.env.local','utf8').split(/\r?\n/), ...readFileSync('.env.test.local','utf8').split(/\r?\n/)].filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')).trim(), l.slice(l.indexOf('=')+1).trim()]));
const mk = async (email, password) => { const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } }); const { error } = await c.auth.signInWithPassword({ email, password }); if (error) throw error; return c; };
const t = await mk(env.E2E_TEACHER_EMAIL, env.E2E_TEACHER_PASSWORD);
const s = await mk(env.E2E_STUDENT_EMAIL, env.E2E_STUDENT_PASSWORD);
const removeFolder = async (c, bucket, prefix) => { const { data } = await c.storage.from(bucket).list(prefix, { limit: 1000 }); const paths = (data||[]).map(f => `${prefix}/${f.name}`); if (paths.length) { const { error } = await c.storage.from(bucket).remove(paths); console.log(bucket, prefix, 'removed', paths.length, error?.message||''); } else console.log(bucket, prefix, 'empty'); };
await removeFolder(s, 'submission-files', `submissions/${env.E2E_STUDENT_ID}`);
await removeFolder(t, 'task-files', `tasks/${env.E2E_TEACHER_ID}`);
console.log('submissions', (await s.from('submissions').delete().eq('user_id', env.E2E_STUDENT_ID).select('id')).data?.length);
console.log('tasks', (await t.from('tasks').delete().eq('created_by', env.E2E_TEACHER_ID).select('id')).data?.length);
console.log('memberships', (await s.from('group_members').delete().eq('user_id', env.E2E_STUDENT_ID).select('id')).data?.length);
console.log('groups left (need SQL):', (await t.from('groups').select('id,name').eq('created_by', env.E2E_TEACHER_ID)).data?.map(g=>g.name));
