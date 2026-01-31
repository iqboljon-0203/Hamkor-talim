-- ============================================
-- Trigger va Function'ni to'liq tekshirish
-- ============================================

-- 1. Trigger'ni ko'rish
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Function'ni ko'rish
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 3. Function'ning to'liq kodini ko'rish
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'handle_new_user';

