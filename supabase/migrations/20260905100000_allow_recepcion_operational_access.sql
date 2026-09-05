-- P0: el rol real de recepción debe operar los contextos diarios.
-- No otorga permisos administrativos: solo amplía el helper usado por las
-- políticas operativas de socios, pagos, caja, asistencia y catálogo de lectura.

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
      and rol in ('admin', 'staff', 'recepcion')
  );
$$;

revoke all on function public.is_active_staff() from public, anon;
grant execute on function public.is_active_staff() to authenticated;

commit;
