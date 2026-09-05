-- P0.6: ajuste administrativo de snapshots con atomicidad y auditoría.
-- Depende de 20260904150000_harden_rls_and_rpc_access.sql.

begin;

create table if not exists public.payment_adjustment_audit (
  id bigint generated always as identity primary key,
  payment_id uuid not null references public.payments(id),
  monto_anterior numeric not null check (monto_anterior > 0),
  monto_nuevo numeric not null check (monto_nuevo > 0),
  motivo text not null check (char_length(btrim(motivo)) >= 10),
  operador_id uuid not null,
  created_at timestamptz not null default now(),
  check (monto_anterior <> monto_nuevo)
);

alter table public.payment_adjustment_audit enable row level security;

drop policy if exists payment_adjustment_audit_select_admin
  on public.payment_adjustment_audit;

create policy payment_adjustment_audit_select_admin
  on public.payment_adjustment_audit for select to authenticated
  using (public.is_admin());

revoke all on table public.payment_adjustment_audit from public, anon, authenticated;
grant select on table public.payment_adjustment_audit to authenticated;

create or replace function public.admin_adjust_payment_snapshot(
  p_payment_id uuid,
  p_new_amount numeric,
  p_reason text
)
returns table (
  id bigint,
  payment_id uuid,
  monto_anterior numeric,
  monto_nuevo numeric,
  motivo text,
  operador_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_payment public.payments%rowtype;
  linked_transactions integer;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede ajustar snapshots de pago'
      using errcode = '42501';
  end if;

  if p_payment_id is null then
    raise exception 'El pago es obligatorio';
  end if;

  if p_new_amount is null or p_new_amount <= 0 then
    raise exception 'El nuevo monto debe ser mayor que cero';
  end if;

  if p_reason is null or char_length(btrim(p_reason)) < 10 then
    raise exception 'El motivo debe tener al menos 10 caracteres';
  end if;

  select *
    into current_payment
    from public.payments
   where id = p_payment_id
   for update;

  if not found then
    raise exception 'No se encontró el pago solicitado';
  end if;

  if current_payment.monto = p_new_amount then
    raise exception 'El nuevo monto coincide con el snapshot actual';
  end if;

  select count(*)
    into linked_transactions
    from public.transactions
   where payment_id = p_payment_id;

  if linked_transactions <> 1 then
    raise exception 'El pago debe tener exactamente un movimiento de caja vinculado';
  end if;

  update public.payments
     set monto = p_new_amount
   where id = p_payment_id;

  update public.transactions
     set monto = p_new_amount
   where payment_id = p_payment_id;

  return query
  insert into public.payment_adjustment_audit (
    payment_id,
    monto_anterior,
    monto_nuevo,
    motivo,
    operador_id
  ) values (
    p_payment_id,
    current_payment.monto,
    p_new_amount,
    btrim(p_reason),
    auth.uid()
  )
  returning
    payment_adjustment_audit.id,
    payment_adjustment_audit.payment_id,
    payment_adjustment_audit.monto_anterior,
    payment_adjustment_audit.monto_nuevo,
    payment_adjustment_audit.motivo,
    payment_adjustment_audit.operador_id,
    payment_adjustment_audit.created_at;
end;
$$;

revoke all on function public.admin_adjust_payment_snapshot(uuid, numeric, text)
  from public, anon;
grant execute on function public.admin_adjust_payment_snapshot(uuid, numeric, text)
  to authenticated;

commit;
