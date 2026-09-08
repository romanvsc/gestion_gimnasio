-- Verificación de BillingCash antes y después de aplicar el trigger.
-- Solo lectura: no crea, corrige ni elimina movimientos históricos.

-- Pagos sin movimiento de caja asociado.
select
  p.id as payment_id,
  p.created_at,
  p.monto
from public.payments p
left join public.transactions t on t.payment_id = p.id
where t.id is null
order by p.created_at desc;

-- Movimientos duplicados para un mismo pago.
select
  payment_id,
  count(*) as transaction_count
from public.transactions
where payment_id is not null
group by payment_id
having count(*) > 1
order by transaction_count desc;

-- Trigger activo sobre payments.
select
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'payments'
  and trigger_name = 'payments_create_cash_transaction';
