-- Matriz manual reproducible para Supabase.
-- Ejecutar cada bloque por separado desde el SQL Editor y revisar que no haya
-- errores de permisos. No modifica datos.

-- 1) Anónimo: solo identidad pública.
begin;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select 'anon_config_read' as check_name, count(*) as visible_rows
from public.config;
-- Esperado: 1 fila de configuración.
rollback;

-- 2) Anónimo: estas consultas deben fallar con permisos insuficientes.
-- Ejecutar una por vez, en transacciones separadas si el editor aborta la actual.
begin;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select id from public.members limit 1;
rollback;

begin;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select id from public.payments limit 1;
rollback;

-- 3) Admin autenticado: reemplazar el sub por el UUID real de un admin activo.
begin;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'sub', (select id::text from public.staff where rol = 'admin' and activo = true limit 1)
  )::text,
  true
);
set local role authenticated;
select 'admin_members' as check_name, count(*) as visible_rows from public.members;
select 'admin_payments' as check_name, count(*) as visible_rows from public.payments;
select 'admin_transactions' as check_name, count(*) as visible_rows from public.transactions;
select 'admin_plans' as check_name, count(*) as visible_rows from public.plans;
rollback;

-- 4) Recepción autenticada: debe poder operar consultas diarias, pero no
-- modificar configuración, planes, métodos de pago ni staff.
begin;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'sub', (select id::text from public.staff where rol = 'recepcion' and activo = true limit 1)
  )::text,
  true
);
set local role authenticated;
select 'recepcion_members' as check_name, count(*) as visible_rows from public.members;
select 'recepcion_payments' as check_name, count(*) as visible_rows from public.payments;
select 'recepcion_transactions' as check_name, count(*) as visible_rows from public.transactions;
select 'recepcion_plans' as check_name, count(*) as visible_rows from public.plans;
-- Las siguientes sentencias deben fallar con RLS/privilegios; ejecutarlas
-- individualmente para no abortar las lecturas anteriores:
-- update public.config set nombre_gimnasio = nombre_gimnasio;
-- update public.plans set nombre = nombre;
-- update public.staff set activo = activo;
rollback;
