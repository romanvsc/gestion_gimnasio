-- Preserve the existing membership rules, columns, ownership and grants.
-- Add the overdue duration in the database, where membership status is owned.
begin;
do $$
declare
  existing_definition text;
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'v_socios_estado'
      and column_name = 'dias_vencido'
  ) then
    existing_definition := regexp_replace(
      pg_get_viewdef('public.v_socios_estado'::regclass, true), ';\s*$', ''
    );
    execute format(
      'create or replace view public.v_socios_estado as
       select original.*,
         case when original.estado_cuota = ''vencido''
                   and original.fecha_fin_cuota is not null
              then greatest(0, (now() at time zone ''America/Argentina/Buenos_Aires'')::date
                                - original.fecha_fin_cuota::date)
              else 0 end as dias_vencido
       from (%s) original', existing_definition
    );
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
