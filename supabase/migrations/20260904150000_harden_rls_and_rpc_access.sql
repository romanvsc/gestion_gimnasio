-- P0: endurece autorización por Bounded Context.
--
-- IdentityAccess es la fuente de roles en public.staff.
-- Los contextos operativos consumen la política de personal activo; BillingCash
-- mantiene payments/transactions como historial append-only.

begin;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff
    where id = auth.uid()
      and activo = true
      and rol in ('admin', 'staff')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff
    where id = auth.uid()
      and activo = true
      and rol = 'admin'
  );
$$;

revoke all on function public.is_active_staff() from public;
revoke all on function public.is_active_staff() from anon;
grant execute on function public.is_active_staff() to authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Elimina políticas heredadas demasiado amplias. Las nuevas políticas se
-- asignan a roles concretos y no a PUBLIC.
drop policy if exists "Escritura total attendance" on public.attendance;
drop policy if exists "Lectura publica attendance" on public.attendance;
drop policy if exists "Lectura publica concepts" on public.concepts;
drop policy if exists "Admin modifica config" on public.config;
drop policy if exists "Lectura publica config" on public.config;
drop policy if exists "Permitir lectura pública de config" on public.config;
drop policy if exists "member_page_sizes_select_authenticated" on public.member_page_sizes;
drop policy if exists "Escritura total members" on public.members;
drop policy if exists "Lectura publica members" on public.members;
drop policy if exists "Lectura publica payment_methods" on public.payment_methods;
drop policy if exists "Escritura total payments" on public.payments;
drop policy if exists "Lectura publica payments" on public.payments;
drop policy if exists "Lectura publica planes" on public.plans;
drop policy if exists "plans_policy" on public.plans;
drop policy if exists "Lectura publica staff" on public.staff;
drop policy if exists "Solo admins pueden actualizar staff" on public.staff;
drop policy if exists "Usuarios autenticados pueden insertar staff" on public.staff;
drop policy if exists "Usuarios autenticados pueden ver staff" on public.staff;
drop policy if exists "Staff puede registrar movimientos" on public.transactions;
drop policy if exists "Staff puede ver caja" on public.transactions;

alter table public.attendance enable row level security;
alter table public.concepts enable row level security;
alter table public.config enable row level security;
alter table public.member_page_sizes enable row level security;
alter table public.members enable row level security;
alter table public.payment_methods enable row level security;
alter table public.payments enable row level security;
alter table public.payments_deletion_audit enable row level security;
alter table public.plans enable row level security;
alter table public.staff enable row level security;
alter table public.transactions enable row level security;

-- IdentityAccess
create policy staff_select_self_or_admin
  on public.staff for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy staff_insert_admin
  on public.staff for insert to authenticated
  with check (public.is_admin());

create policy staff_update_admin
  on public.staff for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- GymConfiguration
create policy config_select_public_business_identity
  on public.config for select to anon, authenticated
  using (true);

create policy config_update_admin
  on public.config for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- MemberRegistry
create policy members_select_active_staff
  on public.members for select to authenticated
  using (public.is_active_staff());

create policy members_insert_active_staff
  on public.members for insert to authenticated
  with check (public.is_active_staff());

create policy members_update_active_staff
  on public.members for update to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

create policy members_delete_admin
  on public.members for delete to authenticated
  using (public.is_admin());

-- PlansCatalog
create policy plans_select_active_staff
  on public.plans for select to authenticated
  using (public.is_active_staff());

create policy plans_insert_admin
  on public.plans for insert to authenticated
  with check (public.is_admin());

create policy plans_update_admin
  on public.plans for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy concepts_select_active_staff
  on public.concepts for select to authenticated
  using (public.is_active_staff());

create policy concepts_write_admin
  on public.concepts for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy payment_methods_select_active_staff
  on public.payment_methods for select to authenticated
  using (public.is_active_staff());

create policy payment_methods_write_admin
  on public.payment_methods for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy member_page_sizes_select_active_staff
  on public.member_page_sizes for select to authenticated
  using (public.is_active_staff());

create policy member_page_sizes_write_admin
  on public.member_page_sizes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- BillingCash: payments y transactions son append-only para la API.
create policy payments_select_active_staff
  on public.payments for select to authenticated
  using (public.is_active_staff());

create policy payments_insert_active_staff
  on public.payments for insert to authenticated
  with check (public.is_active_staff());

create policy transactions_select_active_staff
  on public.transactions for select to authenticated
  using (public.is_active_staff());

create policy transactions_insert_active_staff
  on public.transactions for insert to authenticated
  with check (public.is_active_staff());

-- AttendanceAccess
create policy attendance_select_active_staff
  on public.attendance for select to authenticated
  using (public.is_active_staff());

create policy attendance_insert_active_staff
  on public.attendance for insert to authenticated
  with check (public.is_active_staff());

-- La vista de lectura debe evaluar las políticas del invocador y no las del
-- propietario de la vista. No se expone a anon porque contiene datos personales.
alter view public.v_socios_estado set (security_invoker = true);
revoke all on table public.v_socios_estado from public;
revoke all on table public.v_socios_estado from anon;
grant select on table public.v_socios_estado to authenticated;

-- Privilegios de tablas: explícitamente no se concede acceso a anon/PUBLIC.
revoke all on table public.attendance from public, anon;
revoke all on table public.concepts from public, anon;
revoke all on table public.config from public;
revoke all on table public.member_page_sizes from public, anon;
revoke all on table public.members from public, anon;
revoke all on table public.payment_methods from public, anon;
revoke all on table public.payments from public, anon;
revoke all on table public.payments_deletion_audit from public, anon, authenticated;
revoke all on table public.plans from public, anon;
revoke all on table public.staff from public, anon;
revoke all on table public.transactions from public, anon;

grant select, insert, update on table public.attendance to authenticated;
grant select, insert, update on table public.concepts to authenticated;
grant select, update on table public.config to authenticated;
grant select on table public.config to anon;
grant select, insert, update, delete on table public.members to authenticated;
grant select, insert, update on table public.member_page_sizes to authenticated;
grant select, insert, update on table public.payment_methods to authenticated;
grant select, insert on table public.payments to authenticated;
grant select, insert, update on table public.plans to authenticated;
grant select, insert, update on table public.staff to authenticated;
grant select, insert on table public.transactions to authenticated;
grant usage, select on sequence public.plans_id_seq to authenticated;

-- Storage: logos solo para administradores; avatares para personal activo.
drop policy if exists "Admin sube logos" on storage.objects;
drop policy if exists "Anyone authenticated can upload avatars" on storage.objects;
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Logos publicos" on storage.objects;

create policy storage_config_public_read
  on storage.objects for select to public
  using (bucket_id = 'config');

create policy storage_avatars_public_read
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy storage_config_admin_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'config'
    and name like 'logo-%'
    and public.is_admin()
  );

create policy storage_config_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'config' and public.is_admin());

create policy storage_avatars_staff_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and public.is_active_staff());

create policy storage_avatars_staff_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and public.is_active_staff());

-- RPCs de BillingCash y ReportingAnalytics: solo personal activo y search_path
-- fijo para evitar resolución insegura dentro de SECURITY DEFINER.
create or replace function public.get_previous_balance(check_date timestamp with time zone)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_staff() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return (
    select coalesce(sum(
      case
        when tipo = 'INGRESO' then monto
        when tipo = 'EGRESO' then -monto
        else 0
      end
    ), 0)
    from public.transactions
    where created_at < check_date
  );
end;
$$;

create or replace function public.get_monthly_finance_stats(fecha_inicio date, fecha_fin date)
returns table(mes text, ingresos numeric, egresos numeric)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_staff() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
    select
      to_char(date_trunc('month', created_at), 'YYYY-MM') as mes,
      coalesce(sum(case when tipo = 'INGRESO' then monto else 0 end), 0) as ingresos,
      coalesce(sum(case when tipo = 'EGRESO' then monto else 0 end), 0) as egresos
    from public.transactions
    where created_at >= fecha_inicio::timestamptz
      and created_at < (fecha_fin + 1)::timestamptz
    group by 1
    order by 1;
end;
$$;

create or replace function public.get_daily_activity_stats(fecha_inicio date, fecha_fin date)
returns table(dia_semana integer, cantidad bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_staff() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
    select extract(dow from created_at)::integer as dia_semana, count(*)::bigint as cantidad
    from public.attendance
    where created_at >= fecha_inicio::timestamptz
      and created_at < (fecha_fin + 1)::timestamptz
    group by 1
    order by 1;
end;
$$;

create or replace function public.get_hourly_activity_stats(fecha_inicio date, fecha_fin date)
returns table(hora integer, cantidad bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_staff() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
    select extract(hour from created_at)::integer as hora, count(*)::bigint as cantidad
    from public.attendance
    where created_at >= fecha_inicio::timestamptz
      and created_at < (fecha_fin + 1)::timestamptz
    group by 1
    order by 1;
end;
$$;

create or replace function public.handle_new_payment_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.transactions (
    tipo,
    categoria,
    monto,
    descripcion,
    payment_id,
    created_by
  ) values (
    'INGRESO',
    'Cuota',
    new.monto,
    'Cobro automático de cuota',
    new.id,
    auth.uid()
  );

  return new;
end;
$$;

revoke execute on function public.get_previous_balance(timestamptz) from public, anon, authenticated;
grant execute on function public.get_previous_balance(timestamptz) to authenticated;
revoke execute on function public.get_monthly_finance_stats(date, date) from public, anon, authenticated;
grant execute on function public.get_monthly_finance_stats(date, date) to authenticated;
revoke execute on function public.get_daily_activity_stats(date, date) from public, anon, authenticated;
grant execute on function public.get_daily_activity_stats(date, date) to authenticated;
revoke execute on function public.get_hourly_activity_stats(date, date) from public, anon, authenticated;
grant execute on function public.get_hourly_activity_stats(date, date) to authenticated;

commit;
