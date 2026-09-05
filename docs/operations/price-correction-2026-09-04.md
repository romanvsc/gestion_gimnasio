# Operación de corrección de precios — 2026-09-04

## Alcance

Se corrigieron en producción los pagos registrados entre el 2026-09-01 y el
2026-09-04 para el plan `Todos los días` (id `18`) que conservaron el precio
anterior. La operación actualizó el snapshot del pago y su movimiento de caja
vinculado, sin crear pagos nuevos ni cambiar fechas.

## Resultado verificado

- 29 pagos con diferencia fueron corregidos.
- 29 transacciones de caja vinculadas fueron corregidas.
- Socios del club: `20.000 → 24.000`.
- No socios: `25.000 → 29.000`.
- Verificación posterior: todos los pagos y movimientos del rango coinciden con
  la tarifa vigente según la condición del socio.

## Invariantes preservados

- El monto histórico queda como snapshot del importe cobrado/corregido.
- No se reescribieron pagos fuera del rango ni otros planes.
- Cada pago corregido mantiene su transacción de caja asociada.
- La operación se ejecutó en una sesión autenticada del SQL Editor de Supabase.

## Trazabilidad técnica

La operación quedó reproducible en
`supabase/migrations/20260904153000_reconcile_daily_plan_price_snapshots.sql`.
La migración es idempotente: solo actúa sobre los importes antiguos dentro del
alcance exacto y actualiza también la transacción de caja vinculada.

El caso de uso administrativo y el RPC transaccional quedaron implementados en
el contexto `billing-cash`, junto con la migración
`supabase/migrations/20260904160000_add_payment_adjustment_audit_rpc.sql`.
La migración fue aplicada en producción y verificada: existe la tabla de
auditoría, la función es `SECURITY DEFINER`, el rol autenticado puede ejecutarla
y `anon` no tiene permiso de ejecución. El formulario administrativo ya está
conectado localmente al caso de uso y exige revisión explícita antes de invocar
la RPC. Falta ejercer un ajuste real autorizado desde producción. Los cambios
futuros de catálogo no deben modificar pagos históricos automáticamente.
