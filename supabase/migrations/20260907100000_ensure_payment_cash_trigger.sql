-- BillingCash: garantiza el movimiento de caja asociado a cada pago nuevo.
-- No reconstruye pagos históricos; la revisión de huérfanos se realiza por separado.

begin;

create or replace function public.handle_new_payment_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.transactions
    where payment_id = new.id
  ) then
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
  end if;

  return new;
end;
$$;

drop trigger if exists payments_create_cash_transaction on public.payments;
create trigger payments_create_cash_transaction
  after insert on public.payments
  for each row
  execute function public.handle_new_payment_transaction();

revoke all on function public.handle_new_payment_transaction() from public, anon, authenticated;

commit;
