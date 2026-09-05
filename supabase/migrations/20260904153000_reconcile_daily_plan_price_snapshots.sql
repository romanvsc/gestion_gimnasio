-- Reconciliación administrativa, acotada e idempotente.
--
-- Alcance: pagos del plan "Todos los días" (id 18) creados entre
-- 2026-09-01 y 2026-09-04 inclusive. Solo corrige snapshots que todavía
-- conservan los importes anteriores; no toca otros planes ni fechas.
--
-- La tarifa actual vive en plans, pero los pagos históricos son snapshots.
-- Por eso esta operación explícita no debe convertirse en un trigger general
-- que reescriba el historial ante cada cambio de catálogo.

begin;

create temporary table _daily_plan_price_correction on commit drop as
select
  p.id,
  case when m.es_socio_club then 24000::numeric else 29000::numeric end as monto_corregido
from public.payments p
join public.members m on m.id = p.member_id
where p.plan_id = 18
  and p.created_at >= '2026-09-01 00:00:00-03'::timestamptz
  and p.created_at < '2026-09-05 00:00:00-03'::timestamptz
  and (
    (m.es_socio_club = true and p.monto = 20000)
    or (coalesce(m.es_socio_club, false) = false and p.monto = 25000)
  );

update public.payments p
set monto = c.monto_corregido
from _daily_plan_price_correction c
where p.id = c.id;

update public.transactions t
set monto = c.monto_corregido
from _daily_plan_price_correction c
where t.payment_id = c.id;

commit;
