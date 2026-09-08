-- Work Hours: varias jornadas no superpuestas por recepcionista y fecha.
-- La exclusión usa rangos [) para permitir intervalos contiguos.

begin;

create extension if not exists btree_gist;

alter table public.staff_work_hours
  drop constraint if exists staff_work_hours_unique_staff_date;

create index if not exists staff_work_hours_staff_date_start_idx
  on public.staff_work_hours (staff_id, work_date, start_time);

alter table public.staff_work_hours
  drop constraint if exists staff_work_hours_no_overlap;

alter table public.staff_work_hours
  add constraint staff_work_hours_no_overlap
  exclude using gist (
    staff_id with =,
    work_date with =,
    (tsrange(
      (work_date + start_time)::timestamp,
      (work_date + end_time)::timestamp,
      '[)'
    )) with &&
  );

grant select, insert, update on table public.staff_work_hours to authenticated;

commit;
