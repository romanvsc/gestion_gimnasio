-- MemberRegistry: preserve the deactivation date used by inactive-member views.
begin;

alter table public.members
  add column if not exists fecha_baja date;

create or replace function public.set_member_deactivation_date()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.activo = false and new.fecha_baja is null then
    new.fecha_baja := (now() at time zone 'America/Argentina/Buenos_Aires')::date;
  elsif new.activo = true then
    new.fecha_baja := null;
  end if;

  return new;
end;
$$;

drop trigger if exists members_set_deactivation_date on public.members;

create trigger members_set_deactivation_date
before insert or update of activo, fecha_baja on public.members
for each row
execute function public.set_member_deactivation_date();

revoke all on function public.set_member_deactivation_date() from public, anon, authenticated;
notify pgrst, 'reload schema';
commit;
