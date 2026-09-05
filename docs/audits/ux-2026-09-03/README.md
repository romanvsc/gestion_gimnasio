# Auditoría UX — Gestión Gimnasio

Fecha: 3 de septiembre de 2026  
Superficie: aplicación web autenticada de gestión de gimnasio  
Entorno: producción (`https://gestion-gimnasio.vercel.app/`)  
Usuario de prueba: cuenta administrativa ya autenticada en el navegador

## Alcance y objetivo

Se recorrieron los flujos de Dashboard, Socios, alta de socio, Pagos, Caja, Check-In, Reportes, Configuración y Usuarios. También se revisaron Dashboard en móvil (390 × 844 px), modo claro y estados sin resultados. El objetivo fue detectar fricciones, inconsistencias visuales, riesgos de accesibilidad y oportunidades para que el personal pueda operar más rápido y con menos errores.

La auditoría es heurística y basada en capturas actuales. No se enviaron formularios, no se registraron pagos/movimientos ni se modificaron datos de producción.

## Evidencia capturada

| Paso | Flujo | Evidencia |
| --- | --- | --- |
| 1 | Dashboard desktop oscuro | [01-dashboard.png](./01-dashboard.png) |
| 2 | Lista de Socios | [02-socios-lista.png](./02-socios-lista.png) |
| 3 | Alta de socio | [03-socio-formulario.png](./03-socio-formulario.png) |
| 4 | Pago vacío | [04-pago-vacio.png](./04-pago-vacio.png) |
| 5 | Pago con plan y medio seleccionados | [05-pago-seleccion-parcial.png](./05-pago-seleccion-parcial.png) |
| 6 | Caja | [06-caja.png](./06-caja.png) |
| 7 | Modal de movimiento de caja | [07-caja-modal.png](./07-caja-modal.png) |
| 8 | Check-In vacío | [08-checkin-vacio.png](./08-checkin-vacio.png) |
| 9 | Check-In sin resultados | [09-checkin-sin-resultados.png](./09-checkin-sin-resultados.png) |
| 10 | Reportes | [10-reportes.png](./10-reportes.png), [11-reportes-inferior.png](./11-reportes-inferior.png) |
| 11 | Configuración | [12-configuracion-inicial.png](./12-configuracion-inicial.png), [12-configuracion-superior.png](./12-configuracion-superior.png) |
| 12 | Usuarios | [15-usuarios.png](./15-usuarios.png) |
| 13 | Dashboard móvil | [16-dashboard-mobile.png](./16-dashboard-mobile.png) |
| 14 | Dashboard en modo claro | [20-dashboard-claro-estable.png](./20-dashboard-claro-estable.png) |

## Resumen ejecutivo

La aplicación tiene una base visual consistente, una navegación comprensible y buenos patrones de operación rápida. El mayor problema no es la falta de funciones sino la falta de contexto en momentos de decisión: el sistema muestra números y estados importantes, pero no siempre explica qué significan, qué tan actuales son o cuál es la siguiente acción.

Prioridad recomendada:

1. Corregir el solapamiento de contenido con la navegación inferior en móvil.
2. Hacer explícitas y accesibles las acciones iconográficas de Usuarios, Configuración y listados.
3. Unificar moneda, estados y nomenclatura de negocio.
4. Mejorar los estados vacíos, los gráficos con pocos datos y la recuperación ante búsquedas sin resultados.
5. Convertir formularios largos y modales en flujos más seguros para teclado, lectores de pantalla y pérdida accidental de contexto.

## Hallazgos priorizados

### P0 — Riesgo de operación o bloqueo

#### P0.1 — La barra inferior tapa contenido en móvil

**Evidencia:** [16-dashboard-mobile.png](./16-dashboard-mobile.png). El bloque de alerta queda parcialmente oculto detrás de la navegación fija inferior.

**Causa probable confirmada en código:** `main` usa `pb-16`, mientras el contenedor de `BottomNav` tiene `h-20` más el área segura del dispositivo.

**Impacto:** el usuario puede no percibir el final de una tarjeta, una acción o un mensaje; el problema se repite potencialmente en todas las vistas móviles.

**Recomendación:** reservar el alto real de la barra (`5rem + env(safe-area-inset-bottom)`), validar cada pantalla en 360–430 px y asegurar que modales/menús no queden debajo de ella.

#### P0.2 — Acciones críticas representadas solo con íconos

**Evidencia:** [15-usuarios.png](./15-usuarios.png), y acciones de la lista de Socios. Editar, activar/desactivar, ver detalle e historial dependen del reconocimiento del ícono.

**Evidencia DOM:** en Usuarios hay botones sin texto visible, `aria-label` ni `title`.

**Impacto:** baja descubribilidad, operación más lenta y navegación deficiente con lector de pantalla; las acciones peligrosas pueden confundirse.

**Recomendación:** agregar nombre accesible siempre; en desktop mostrar etiqueta o tooltip persistente al foco/hover; usar una acción explícita para activar/desactivar y mantener confirmación antes de cambiar el estado.

#### P0.3 — El modal de Caja no usa el componente modal común

**Evidencia:** [07-caja-modal.png](./07-caja-modal.png).

**Evidencia de código:** `src/views/Cash/TransactionModal.vue` implementa un `div` fijo propio; no tiene `role="dialog"`, `aria-modal`, título asociado ni gestión común de foco. `BaseModal.vue` sí tiene parte de esa semántica, por lo que hay una inconsistencia de componentes.

**Impacto:** el usuario de teclado puede salir del modal; un lector de pantalla puede no identificar el contexto modal; el foco no necesariamente vuelve al botón que lo abrió.

**Recomendación:** reutilizar `BaseModal` o extraer un patrón único con `role="dialog"`, `aria-labelledby`, foco inicial, trampa de foco, Escape, cierre seguro y retorno del foco.

### P1 — Fricción frecuente o riesgo de error

#### P1.1 — Precios con formatos incompatibles

**Evidencia:** [05-pago-seleccion-parcial.png](./05-pago-seleccion-parcial.png) muestra `$14000`; Configuración muestra `$14.000` y `$25.000` en [12-configuracion-superior.png](./12-configuracion-superior.png).

**Impacto:** parece que son valores distintos y dificulta leer montos grandes en recepción.

**Recomendación:** centralizar el formateador ARS y usarlo en todos los módulos, idealmente con el mismo patrón visual (`$ 14.000` o `$14.000`). Informar claramente tarifa de socio, tarifa general y ahorro cuando corresponda.

#### P1.2 — Estados de socio y cuota no explican la regla de negocio

**Evidencia:** [02-socios-lista.png](./02-socios-lista.png) combina `Estado: Activo` con `Cuota: Vencido`; Dashboard y Reportes repiten `291` como deuda urgente.

**Impacto:** “Activo” puede significar que la persona sigue registrada, que puede ingresar o que está habilitada administrativamente. Sin una leyenda, recepción puede tomar una decisión incorrecta.

**Recomendación:** separar estados: `Socio activo`, `Acceso habilitado/bloqueado` y `Cuota al día/vencida`; añadir fecha de vencimiento y una acción principal (`Cobrar`, `Ver deuda`, `Habilitar excepción`). Validar con el negocio si la combinación observada es válida antes de cambiar la lógica.

#### P1.3 — Dashboard y Reportes muestran alertas sin suficiente contexto

**Evidencia:** [01-dashboard.png](./01-dashboard.png) y [11-reportes-inferior.png](./11-reportes-inferior.png).

**Impacto:** el número de morosos domina visualmente, pero no se indica antigüedad, monto total, fecha de actualización ni segmentación. El usuario no sabe si debe cobrar hoy, contactar o revisar datos.

**Recomendación:** incluir `actualizado hace...`, total adeudado, rangos de vencimiento y distribución por acción; mantener un CTA contextual como `Ver morosos de mayor deuda`.

#### P1.4 — Los estados vacíos no siempre ofrecen recuperación

**Evidencia:** Check-In sin resultados muestra solo `No se encontraron resultados` en [09-checkin-sin-resultados.png](./09-checkin-sin-resultados.png). En Reportes, `Socios Inactivos: 0` deja un CTA deshabilitado.

**Impacto:** el usuario queda sin saber si debe corregir DNI, buscar por nombre, crear un socio o simplemente esperar datos.

**Recomendación:** dar una siguiente acción: `Revisá el DNI o buscá por nombre`, `Nuevo socio` y `Limpiar búsqueda`. Para cero inactivos, reemplazar el botón deshabilitado por una explicación positiva (`No hay bajas en el período`).

#### P1.5 — Pago correcto en apariencia, pero con demasiadas decisiones simultáneas

**Evidencia:** [04-pago-vacio.png](./04-pago-vacio.png) y [05-pago-seleccion-parcial.png](./05-pago-seleccion-parcial.png).

**Impacto:** se presentan búsqueda de socio, plan, medio y fecha a la vez; el resumen muestra fechas aun sin socio seleccionado; el botón queda deshabilitado sin explicar qué falta.

**Recomendación:** convertirlo en una progresión visible: `1. Socio → 2. Plan → 3. Medio y fecha → 4. Confirmar`. En el CTA o resumen indicar faltantes (`Falta seleccionar un socio`) y mostrar siempre el tipo de tarifa aplicada.

#### P1.6 — Alta de socio demasiado larga para una operación de recepción

**Evidencia:** [03-socio-formulario.png](./03-socio-formulario.png).

**Impacto:** los datos de salud quedan lejos de la acción final; el usuario debe desplazarse y no ve un progreso ni una acción persistente. Los campos sensibles no explican por qué se solicitan ni quién los verá.

**Recomendación:** dividir en bloques con progreso (`Datos personales`, `Salud`, `Membresía`), mantener `Guardar socio` accesible en móvil, marcar claramente obligatorios/opcionales y añadir una nota breve de privacidad. Corregir la duplicación visual de asteriscos en `Nombre` y `Apellido`.

#### P1.7 — Caja mezcla período seleccionado con saldo actual

**Evidencia:** [06-caja.png](./06-caja.png) muestra `Saldo Final` con el subtítulo `En caja ahora`.

**Impacto:** “saldo final del período” no es necesariamente “efectivo actual”. Puede inducir a comparar períodos como si fueran una fotografía actual.

**Recomendación:** rotular por separado `Saldo al cierre del período` y `Saldo actual`; explicar si el cálculo incluye todos los movimientos o solo los filtrados. Cambiar `-0 movimientos` por `0 movimientos`.

#### P1.8 — La interfaz expone identificadores técnicos en Caja

**Evidencia:** [06-caja.png](./06-caja.png) muestra fragmentos de UUID en la columna Usuario.

**Impacto:** no ayudan al personal y agregan ruido técnico; pueden exponer datos internos.

**Recomendación:** mostrar nombre y rol del operador, o `Sistema` para movimientos automáticos; reservar el UUID para una vista técnica o auditoría avanzada.

### P2 — Calidad, confianza y escalabilidad

#### P2.1 — Reportes visuales pero poco interpretables

**Evidencia:** [10-reportes.png](./10-reportes.png) y [11-reportes-inferior.png](./11-reportes-inferior.png). Los gráficos tienen mucho espacio vacío, pocos puntos/barras y etiquetas pequeñas.

**Impacto:** el usuario debe interpretar el gráfico sin una conclusión clara; con pocos datos puede parecer que el sistema está roto.

**Recomendación:** sumar KPIs y frases de lectura (`Ingresos subieron 12%`, `Día de mayor asistencia`), mostrar estado de datos insuficientes y permitir tooltip/tabla accesible. Añadir rango personalizado y exportación si el uso administrativo lo requiere.

#### P2.2 — Configuración extensa y persistencia poco evidente

**Evidencia:** [12-configuracion-inicial.png](./12-configuracion-inicial.png) y [12-configuracion-superior.png](./12-configuracion-superior.png).

**Impacto:** la pantalla concentra identidad, horarios, planes y medios de pago; no queda claro en el primer viewport si los cambios se guardan automáticamente o mediante un botón al final.

**Recomendación:** dividir en pestañas o navegación interna, mostrar estado `Sin guardar / Guardado`, fijar la acción de guardar cuando haya cambios y advertir antes de abandonar con cambios pendientes.

#### P2.3 — Navegación móvil oculta funciones administrativas bajo “Más”

**Evidencia:** [16-dashboard-mobile.png](./16-dashboard-mobile.png). Usuarios, Reportes y Configuración no están en la barra principal.

**Impacto:** es razonable por espacio, pero el acceso depende de descubrir “Más”; además agrega una interacción adicional a tareas administrativas frecuentes.

**Recomendación:** ordenar el menú “Más” por frecuencia/rol, mostrar un indicador cuando hay una sección activa y considerar un acceso contextual desde Dashboard para Reportes, Caja y Configuración.

#### P2.4 — Actualización al volver a la pestaña puede interrumpir el trabajo

**Evidencia de código:** `src/App.vue` ejecuta `window.location.reload()` cuando la pestaña estuvo oculta al menos tres segundos; `MainLayout.vue` además fuerza el remontaje de la vista al retomar.

**Impacto potencial:** se puede perder una búsqueda, un formulario incompleto o el scroll actual al cambiar temporalmente a WhatsApp, una planilla o una pestaña de pagos.

**Recomendación:** refrescar datos de forma incremental; conservar estado de formularios y scroll; avisar si hay cambios sin guardar y ofrecer `Actualizar datos` cuando no sea seguro refrescar automáticamente.

#### P2.5 — Inconsistencias de idioma y densidad

**Evidencia:** Check-In usa `Live Feed` dentro de una interfaz mayormente en español; algunas tablas y acciones requieren leer muchas columnas pequeñas.

**Recomendación:** unificar idioma (`Actividad en vivo`), priorizar datos accionables en móvil y pasar tablas densas a tarjetas con detalles expandibles.

## Fortalezas

- Jerarquía general clara: sidebar desktop, navegación inferior móvil y títulos consistentes.
- Dashboard con accesos rápidos bien orientados a la recepción: Nuevo Socio, Registrar Pago, Check-In y Últimos Accesos.
- Pago con resumen lateral: el total, plan, fechas y medio quedan visibles antes de confirmar.
- Check-In con foco de búsqueda grande, apropiado para una operación tipo kiosco.
- Confirmación existente para activar/desactivar usuarios y cierre de sesión.
- Modo oscuro y claro visualmente coherentes en términos generales.
- Foco visible en el campo de Check-In; la búsqueda sin resultados es reconocible y no falla silenciosamente.
- Sin errores de consola observados durante la muestra de navegación.

## Plan de mejora recomendado

### Iteración 1 — Seguridad operativa y accesibilidad

Corregir el espacio de la navegación móvil, etiquetar acciones iconográficas, unificar modales y resolver foco/teclado. Validar con teclado completo y lector de pantalla.

### Iteración 2 — Claridad de negocio

Unificar moneda, redefinir estados de socio/cuota/acceso, separar saldo de período y saldo actual, ocultar UUIDs y agregar fecha de actualización a KPIs.

### Iteración 3 — Flujos de recepción

Simplificar Pago y Alta de Socio con pasos, faltantes explícitos, CTA persistente y recuperación clara en búsquedas vacías.

### Iteración 4 — Inteligencia y escala

Mejorar interpretación de reportes, configuración con estado de guardado, tablas responsive y filtros/rangos más explícitos.

## Límites de esta auditoría

- No se completaron acciones con impacto en datos reales.
- No se hizo una auditoría WCAG automatizada completa ni una prueba exhaustiva con lector de pantalla.
- No se midieron rendimiento, red ni disponibilidad del backend.
- Las cifras y combinaciones de estados observadas pueden ser datos reales, de prueba o históricos; las recomendaciones de negocio deben validarse con el equipo del gimnasio.
- Las capturas móviles de módulos distintos del Dashboard presentaron una limitación del capturador del navegador y no se usaron como evidencia visual; requieren una segunda pasada en un viewport móvil confiable.
