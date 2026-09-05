-- P0: el cliente anónimo solo necesita identidad visual para iniciar sesión.
-- Los privilegios heredados de migraciones previas pueden sobrevivir a una
-- revocación sobre PUBLIC, por eso se revocan explícitamente por rol.

begin;

revoke all privileges on table public.config from anon;
revoke all privileges on table public.config from authenticated;

grant select (id, nombre_gimnasio, logo_url)
  on table public.config to anon;

grant select, update
  on table public.config to authenticated;

commit;
