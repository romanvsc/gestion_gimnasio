-- Work Hours: una jornada por recepcionista y fecha.
-- Las horas son horarios locales del gimnasio, no instantes UTC.

begin;

create table if not exists public.staff_work_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete restrict,
  work_date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_work_hours_unique_staff_date unique (staff_id, work_date),
  constraint staff_work_hours_start_before_end check (start_time < end_time)
);

create index if not exists staff_work_hours_staff_date_idx
  on public.staff_work_hours (staff_id, work_date);

create or replace function public.business_today()
returns date
language sql
stable
security definer
set search_path = public
as $$
  select (now() at time zone 'America/Argentina/Buenos_Aires')::date;
$$;

create or replace function public.set_staff_work_hours_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists staff_work_hours_set_updated_at on public.staff_work_hours;
create trigger staff_work_hours_set_updated_at
  before update on public.staff_work_hours
  for each row
  execute function public.set_staff_work_hours_updated_at();

alter table public.staff_work_hours enable row level security;

drop policy if exists staff_work_hours_select on public.staff_work_hours;
drop policy if exists staff_work_hours_insert on public.staff_work_hours;
drop policy if exists staff_work_hours_update on public.staff_work_hours;

create policy staff_work_hours_select
  on public.staff_work_hours for select to authenticated
  using (
    (
      public.is_admin()
      and exists (
        select 1
        from public.staff target_staff
        where target_staff.id = staff_work_hours.staff_id
          and target_staff.rol = 'recepcion'
      )
    )
    or (
      staff_work_hours.staff_id = auth.uid()
      and exists (
        select 1
        from public.staff current_staff
        where current_staff.id = auth.uid()
          and current_staff.rol = 'recepcion'
          and current_staff.activo = true
      )
    )
  );

create policy staff_work_hours_insert
  on public.staff_work_hours for insert to authenticated
  with check (
    work_date <= public.business_today()
    and (
      (
        public.is_admin()
        and exists (
          select 1
          from public.staff target_staff
          where target_staff.id = staff_work_hours.staff_id
            and target_staff.rol = 'recepcion'
        )
      )
      or (
        staff_work_hours.staff_id = auth.uid()
        and exists (
          select 1
          from public.staff current_staff
          where current_staff.id = auth.uid()
            and current_staff.rol = 'recepcion'
            and current_staff.activo = true
        )
      )
    )
  );

create policy staff_work_hours_update
  on public.staff_work_hours for update to authenticated
  using (
    (
      public.is_admin()
      and exists (
        select 1
        from public.staff target_staff
        where target_staff.id = staff_work_hours.staff_id
          and target_staff.rol = 'recepcion'
      )
    )
    or (
      staff_work_hours.staff_id = auth.uid()
      and exists (
        select 1
        from public.staff current_staff
        where current_staff.id = auth.uid()
          and current_staff.rol = 'recepcion'
          and current_staff.activo = true
      )
    )
  )
  with check (
    work_date <= public.business_today()
    and (
      (
        public.is_admin()
        and exists (
          select 1
          from public.staff target_staff
          where target_staff.id = staff_work_hours.staff_id
            and target_staff.rol = 'recepcion'
        )
      )
      or (
        staff_work_hours.staff_id = auth.uid()
        and exists (
          select 1
          from public.staff current_staff
          where current_staff.id = auth.uid()
            and current_staff.rol = 'recepcion'
            and current_staff.activo = true
        )
      )
    )
  );

revoke all on table public.staff_work_hours from public, anon, authenticated;
revoke all on function public.business_today() from public, anon;
revoke all on function public.set_staff_work_hours_updated_at() from public, anon, authenticated;

grant execute on function public.business_today() to authenticated;
grant select, insert, update on table public.staff_work_hours to authenticated;

commit;
