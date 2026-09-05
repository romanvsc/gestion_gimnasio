# Auditoría UI y visual: separación mobile / navegador

Fecha: 2026-09-04  
Producto auditado: `https://gestion-gimnasio.vercel.app/`  
Estado evaluado: producción, sesión autenticada como `admin@gym.com`  
Tema: dark y light  
Alcance: layout responsive, jerarquía visual, componentes, paleta, densidad, tablas, formularios y modales.

## Conclusión ejecutiva

La aplicación funciona mejor como interfaz mobile que como aplicación de escritorio. El problema no es solamente que falten estilos para desktop: el shell cambia demasiado pronto a una composición de escritorio y, al mismo tiempo, las páginas activan grillas densas demasiado pronto. Entre 768 y 1023 px quedan apenas 512–768 px útiles después de reservar el sidebar de 256 px; aun así se muestran sidebar completo, tabla/grilla y hasta cuatro tarjetas en una fila.

La recomendación es separar tres modos visuales, manteniendo los mismos casos de uso y componentes de dominio:

| Modo | Viewport recomendado | Navegación | Composición |
|---|---:|---|---|
| Mobile | `< 768 px` | Bottom navigation | Una columna, cards, sheets y acciones fijas con espacio reservado |
| Tablet / navegador compacto | `768–1199 px` | Rail lateral de 72–84 px o drawer | Dos columnas cuando haya espacio; cards en vez de tablas; sin bottom nav |
| Desktop | `>= 1200 px` | Sidebar completo de 256 px | Layouts de trabajo, tablas y paneles laterales |

El salto a cuatro métricas, tabla y resumen lateral debería ocurrir únicamente cuando el contenido tenga ancho real suficiente, preferentemente en `xl` o con breakpoints de layout propios. El breakpoint `md` actual es demasiado agresivo para el shell.

## Evidencia capturada

Las imágenes siguientes pertenecen a esta auditoría y fueron capturadas sobre producción. En los viewports emulados se utilizó un recorte de viewport para conservar la escala correcta.

### Dashboard

- [Desktop cargado, 1912×866](./02-dashboard-desktop-loaded.png)
- [Navegador estándar, 1366×768](./26-dashboard-browser-1366.png)
- [Tablet, 1024×768](./03-dashboard-tablet-1024.png)
- [Breakpoint, 768×800](./21-dashboard-breakpoint-768.png)
- [Mobile, 390×844](./04-dashboard-mobile-390.png)
- [Light mode desktop](./22-dashboard-light-desktop.png)

### Flujos representativos

- [Socios desktop](./06-members-desktop.png) y [mobile](./05-members-mobile-390.png)
- [Registrar pago desktop](./09-payment-desktop.png), [tablet](./10-payment-tablet-1024.png), [mobile](./07-payment-mobile-390.png) y [cierre mobile](./08-payment-mobile-bottom-390.png)
- [Caja desktop](./12-cash-desktop.png), [mobile](./11-cash-mobile-390.png) y [tabla mobile](./13-cash-mobile-table-390.png)
- [Reportes desktop](./15-reports-desktop.png) y [mobile](./14-reports-mobile-390.png)
- [Check-in desktop](./17-checkin-desktop.png) y [mobile](./16-checkin-mobile-390.png)
- [Configuración desktop](./20-settings-desktop.png), [mobile](./18-settings-mobile-390.png) y [precios mobile](./19-settings-mobile-prices-390.png)
- [Menú Más mobile](./23-more-menu-mobile-390.png)
- [Modal de accesos desktop](./25-access-modal-desktop.png) y [mobile](./24-access-modal-mobile-390.png)

## Hallazgos priorizados

### P0 — corregir antes de considerar estable el layout

#### P0.1 — La bottom navigation tapa contenido

En mobile la producción tiene `main` con `padding-bottom: 64px`, mientras la barra fija mide 81 px. La medición runtime deja aproximadamente 17 px de contenido debajo de la navegación. Se observa en el Dashboard, Socios, Caja, Check-in y en el modal de accesos.

Impacto: el usuario no puede leer ni alcanzar de forma confiable el último contenido; en Caja la tabla queda cortada y en el Dashboard la tarjeta de cuotas vencidas comienza debajo de la barra.

Actualizar:

- definir una variable única `--mobile-nav-height`, incluyendo safe area;
- reservar exactamente ese espacio en el contenedor scrolleable;
- sumar margen inferior equivalente dentro de modales y hojas mobile;
- validar con 320, 360, 390 y 430 px, además de dispositivos con safe area.

#### P0.2 — Las tablas no tienen representación mobile segura

La tabla de Caja mide aproximadamente 671 px dentro de un viewport de 390 px y queda recortada; la tabla del modal de Últimos Accesos también corta DNI, fecha y hora. No hay indicación visible de desplazamiento horizontal ni una alternativa de card.

Actualizar:

- Caja: usar cards/list items en mobile con hora, concepto, tipo y monto; dejar la tabla para desktop;
- modales: usar filas apiladas en mobile o un `overflow-x-auto` claramente indicado;
- nunca ocultar columnas críticas por clipping;
- conservar headers sticky solo donde el scroll sea evidente.

#### P0.3 — El estado urgente pierde legibilidad en light mode

La tarjeta `Cuotas Vencidas` conserva un fondo rojo oscuro semitransparente (`bg-red-950/40`) pero hereda texto de título oscuro. En la captura light el fondo y el texto quedan demasiado próximos y el bloque parece deshabilitado.

Actualizar la variante semántica completa, no solamente el background:

- light: fondo rojo muy claro, texto rojo oscuro y borde rojo medio;
- dark: fondo rojo profundo, texto rojo claro y borde rojo visible;
- usar el mismo contrato visual en badges, tarjetas, alertas y gráficos.

## P1 — corregir en el siguiente ciclo de UX

#### P1.1 — El sidebar completo aparece demasiado temprano

El código actual muestra Sidebar desde `md` (`768 px`) y oculta BottomNav desde el mismo breakpoint. Esto transforma 768 px en un “desktop” de 512 px útiles. La captura de 768 px muestra el título partido, acciones en dos líneas y tarjetas muy comprimidas. En 1024 px el contenido útil es 768 px, pero Dashboard activa cuatro métricas y divide acciones/gráfico en dos columnas.

Actualizar:

- `md`: mantener un modo compacto o rail, sin sidebar completo;
- `lg`/`xl`: habilitar el layout de navegador según ancho real;
- Dashboard: `sm:grid-cols-2 xl:grid-cols-4` para métricas;
- Dashboard: `xl:grid-cols-2` para acciones + gráfico;
- pagos: apilar formulario y resumen hasta que el formulario pueda tener ancho cómodo;
- reportes: apilar gráficos hasta que cada gráfico tenga un ancho legible.

#### P1.2 — No existe una composición de navegador distinta de la mobile-first

Hay adaptaciones puntuales por clases Tailwind, pero no una estrategia de shell por modo. Se repite la misma página con más ancho, y los elementos que deberían cambiar de rol —tabla a card, bottom nav a sidebar, resumen de pago a panel sticky, feed a columna lateral— cambian solo por `display`.

La solución recomendada es un `AppShell` con tres modos visuales. Las vistas deben compartir datos y casos de uso, pero poder renderizar variantes:

- `MobileAppShell`: bottom nav, header compacto y sheets;
- `CompactAppShell`: rail/drawer, toolbar y contenido amplio;
- `DesktopAppShell`: sidebar, breadcrumbs opcionales y paneles laterales.

No hace falta duplicar lógica de negocio ni rutas.

#### P1.3 — Registrar pago funciona bien en desktop, pero se rompe como flujo intermedio

Desktop tiene una buena lectura de formulario 3/5 + resumen 2/5. A 1024 px esa relación deja el formulario angosto y el resumen consume demasiado espacio; el botón principal no aparece en el primer viewport. En mobile el resumen sticky queda sobre la secuencia de planes y el formulario exige mucho scroll.

Actualizar:

- no activar la composición 3/5 + 2/5 antes de `xl`;
- usar un stepper corto y visible: Socio → Plan → Medio → Confirmar;
- en mobile mostrar un resumen compacto con el siguiente paso faltante, sin tapar contenido;
- mantener una CTA primaria visible al final y, solo si hace falta, sticky con espacio seguro;
- unificar el precio a `$ 23.000`, `$ 14.000`, etc.

#### P1.4 — Caja desktop es clara; mobile no tiene un modelo de lectura propio

El desktop tiene cuatro tarjetas de resumen, filtros en línea y tabla amplia. En mobile los filtros apilados funcionan, pero la tabla conserva el modelo desktop y el footer fijo invade el contenido.

Actualizar:

- mobile: resumen en cards y movimientos como lista de transacciones;
- tablet: dos columnas para filtros/resumen solo cuando exista espacio;
- desktop: tabla con monto alineado, usuario truncado con tooltip y fecha/hora consistente;
- reemplazar `-0 movimientos` por `0 movimientos`.

#### P1.5 — Socios cambia a cards, pero el significado de los estados no cambia

En mobile se ven dos badges `Vencido` sin etiqueta; en desktop las columnas sí dicen `Cuota` y `Apto físico`. Al colapsar la tabla se pierde ese contexto.

Actualizar cada card con grupos explícitos: `Cuota: Vencida`, `Apto físico: Vencido`, `Estado: Activo`. Mantener el orden de prioridad: identidad, deuda, estado de acceso y acciones.

#### P1.6 — El Check-in necesita declararse como modo kiosk

Es la vista más coherente visualmente como operación de acceso: input grande, foco y feed lateral. En desktop queda demasiado espacio vacío alrededor del formulario; en mobile el feed pasa debajo y vuelve a quedar parcialmente oculto por la bottom nav.

Actualizar con una variante de layout explícita:

- kiosk desktop: centro limitado, input prominente y feed lateral fijo;
- mobile: input arriba, fecha secundaria y feed debajo con scroll propio;
- opcional: modo kiosk sin navegación global para el puesto de ingreso.

#### P1.7 — Los modales desktop no deben reutilizar tabla sin adaptación

El modal de accesos se ve bien en desktop, pero en 390 px el header y las columnas se recortan. El límite `max-h` no está coordinado con la barra fija mobile.

Actualizar el contrato común de modal: header fijo, body scrolleable, footer accesible, `dvh`, y variante `mobile-list` para datos tabulares.

## P2 — pulido visual y coherencia del sistema

#### P2.1 — La identidad visual del producto no coincide con la marca compartida

El sistema actual está construido alrededor de morado + teal + navy. La pieza compartida del Club Yacyretá/Gimnasio Pase Libre usa negro, naranja intenso, blanco y gris. Por eso el dashboard parece pertenecer a otro producto, aun cuando la UI sea prolija.

Recomendación de tokens de marca:

- `brand-500`: naranja principal para CTA y selección;
- `brand-600`: naranja oscuro para texto sobre fondo claro;
- `ink-950`: negro cálido para shell y fondos profundos;
- `surface-900` / `surface-800`: superficies oscuras diferenciadas;
- blanco cálido para títulos;
- verde, rojo y ámbar reservados para semántica, no para identidad.

El morado puede conservarse como acento secundario si el cliente lo pide, pero no debería dominar navegación, selección y CTA si la marca oficial es la del flyer.

#### P2.2 — Hay tres fondos oscuros y bordes de baja separación

Se mezclan `#0b1120`, `#0d1526`, `#0f1729`, `#151f32` y superficies semitransparentes. El resultado es consistente a primera vista, pero difícil de mantener y con poca separación entre shell, página, card y card elevada.

Actualizar a tokens semánticos únicos:

```text
page      → fondo de aplicación
surface   → card estándar
elevated  → card activa / modal / popover
border    → separación visible
muted     → texto secundario
```

En light mode el borde actual `#f1f5f9` es casi imperceptible sobre `#ffffff`; usar una separación base cercana a `#e2e8f0` y reservar el borde muy claro para divisores internos.

#### P2.3 — Contraste y lenguaje visual mezclados

La interfaz combina español con `Live Feed`, `Live`, `Urgent`, `Admin`, `Dashboard` y etiquetas en inglés. También usa uppercase con tracking amplio para labels, mientras otros bloques usan oración normal.

Actualizar:

- elegir español como idioma único del producto;
- usar `En vivo`, `Revisar`, `Administrador`;
- reservar uppercase para metadatos cortos, no para acciones;
- evitar depender únicamente de color para estados.

#### P2.4 — Formatos monetarios y numéricos inconsistentes

Se observan `$628.000`, `$ 10.761.000` y `$23000`. La inconsistencia es especialmente visible en Pagos y Caja.

Definir un único formatter regional para ARS, incluyendo espacio no separable entre símbolo y monto cuando corresponda, separador de miles y cero sin signos negativos artificiales.

#### P2.5 — Reportes usan demasiado canvas para pocos datos

El gráfico financiero ocupa un bloque muy alto tanto en desktop como en mobile, aunque solo hay un punto visible. La leyenda queda separada del dato y la superficie vacía domina la pantalla.

Actualizar:

- mostrar un estado “Hay pocos datos para comparar” junto al gráfico;
- adaptar la altura al contenido y al viewport;
- priorizar resumen numérico y lectura operativa;
- si hay un único período, usar KPI/empty state en vez de un gráfico de evolución.

#### P2.6 — Configuración necesita navegación por secciones en desktop

La vista mobile tiene cards claras y guardado fijo, pero el botón fijo puede tapar el campo actual durante el scroll. En desktop queda un formulario angosto centrado, con flecha de volver aunque la vista se alcanza desde navegación principal.

Actualizar a tabs/anchor navigation (`Identidad`, `Información`, `Horarios`, `Planes`, `Medios de pago`), estado de cambios sin guardar y botón de guardado fijo solamente cuando sea necesario.

## Sistema visual recomendado

### Shell y grid

- mobile: padding horizontal 16 px, gap 12–16 px, una columna;
- compact/tablet: rail de 72–84 px, contenido con padding 24 px, máximo dos columnas;
- desktop: sidebar de 256 px, contenido con máximo 1320–1440 px y padding 32 px;
- wide: no estirar cards indefinidamente; mantener lectura y jerarquía;
- usar `dvh` para overlays y reservar safe area en cualquier elemento fijo.

### Tipografía

- título de página mobile 28–32 px;
- título desktop 36–44 px, con ancho máximo para evitar saltos extraños;
- cuerpo 14–16 px;
- labels 11–12 px, con contraste suficiente y sin exceso de tracking;
- números KPI grandes, pero con ancho reservado para moneda y separadores.

### Componentes

- cards: radio 12 px estándar, 16 px para bloques destacados;
- controles: radio 8–10 px y altura táctil mínima 44 px;
- un solo tratamiento de foco visible;
- acciones icon-only con nombre accesible y tooltip visible en desktop;
- modal y sheet con el mismo header, close button, scroll body y footer;
- estado vacío con explicación y acción siguiente, no solamente un bloque sin datos.

## Orden recomendado de implementación

1. Corregir reserva de espacio mobile y tablas/modales que hoy cortan contenido.
2. Crear el shell compacto/tablet y mover las grillas densas a `xl`.
3. Implementar variantes responsive para Caja, Socios y modales.
4. Reestructurar Registrar Pago como flujo responsive con CTA y resumen coordinados.
5. Normalizar tokens de color, estados, contraste y formato monetario.
6. Alinear branding con Yacyretá/Gimnasio Pase Libre.
7. Pulir Reportes, Configuración, microcopy y estados vacíos.

## Criterios de aceptación visual

- 390×844: ningún contenido queda debajo de bottom nav; el último CTA es alcanzable.
- 768×800: no aparece sidebar completo ni grillas de cuatro columnas.
- 1024×768: no hay composición de pago 3/5 + 2/5 si el formulario queda comprimido; Dashboard conserva dos columnas legibles.
- 1366×768: sidebar, cards y tablas usan el ancho sin huecos excesivos.
- Modal mobile: todas las columnas críticas se leen como lista o tienen scroll horizontal anunciado.
- Light/dark: alertas, badges, borders y texto pasan revisión de contraste visual; no hay tarjeta urgente con texto ilegible.
- Pagos, Caja y Dashboard muestran exactamente el mismo formato ARS.
- La navegación, títulos y estados están completamente en español.

## Límites de esta revisión

Esto es una auditoría UI/visual basada en capturas y mediciones del flujo autenticado. No reemplaza una auditoría WCAG completa, pruebas con lector de pantalla, teclado, dispositivos físicos ni aceptación de usuarios.

El workspace contiene cambios locales P0–P2 de una tanda anterior —por ejemplo, reserva de espacio mobile, mejoras de modales y un stepper de pagos— que todavía no están reflejados en la URL de producción. Para evitar falsos positivos, este documento toma producción como fuente de verdad y marca como pendientes las mejoras que no están desplegadas.
