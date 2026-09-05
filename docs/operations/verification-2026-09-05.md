# Verificacion P0-P2 - 2026-09-05

## Evidencia automatizada

- `npm test`: 32 pruebas pasando.
- `npm run build`: build de Vite completado correctamente.
- `git diff --check`: sin errores de whitespace.
- `npm audit --audit-level=moderate`: 0 vulnerabilidades; se reemplazo el
  parser vulnerable `xlsx` por un generador de escritura-only.
- Las lecturas de socios y estadisticas del dashboard usan campos explicitos;
  no dependen de `select('*')` en los flujos endurecidos.
- La carga de logos admite SVG y valida su contenido antes de publicarlo; se
  rechazan scripts, manejadores de eventos y referencias externas.
- `vercel.json` declara MIME y cache adecuados para `manifest.webmanifest` y
  `sw.js`, además de `nosniff`, protección contra clickjacking, política de
  referrer, permisos del navegador y HSTS; la respuesta de producción actual
  todavía requiere un deploy nuevo para que esos cambios sean servidos.
- La telemetría de errores quedó opt-in, limitada a 20 reportes por sesión y
  sin transmitir mensajes de error ni datos personales.
- Las modales de últimos accesos e historial consumen fachadas operativas; ya no
  consultan Supabase desde componentes ni usan `select('*')`.
- Los gráficos de ingresos y asistencia también consumen `useReports`; las
  consultas de presentación ya no cruzan directamente el límite de persistencia.
- El Service Worker precarga el shell y assets same-origin; no intercepta
  Supabase ni cachea respuestas de autenticación o datos operativos.
- Los tokens de texto para estados validan contraste AA sobre superficies claras.
- `StatusBadge` consume `UI_TOKENS` semánticos y no define colores cromáticos
  directamente en el componente transversal de estados.
- El modal base mantiene foco, Escape y `aria-modal`, y ahora relaciona el
  contenido mediante `aria-describedby`; los iconos decorativos no se anuncian.
- Se verifica automáticamente que los botones tengan `type` y las imágenes
  tengan `alt` en todos los componentes Vue.
- Produccion (lectura anonima, estados HTTP): `config` minimo `200`, `members`
  `401`, `payments` `401` y RPC financiero `401`.
- La matriz de autorización local confirma que `recepcion` tiene Caja en ruta,
  rail/tablet y navegación móvil, mientras las secciones administrativas
  permanecen restringidas.

## Evidencia local de arranque y responsive

- Una pestana nueva sin sesion ya no queda en blanco cuando falla o expira la
  consulta inicial de Supabase: despues del timeout llega a `/login`.
- La pantalla de login fue comprobada a `320x720`, `360x800`, `390x844`,
  `430x932`, `768x1024` y `1440x900`.
- En los seis tamanos no hubo overflow horizontal ni elementos esenciales
  ausentes; el logo y el formulario permanecieron presentes.
- El login local fue recorrido por teclado: email, contrasena, mostrar/ocultar,
  recordar correo y soporte tienen controles o nombres accesibles.

## Pendientes de aceptacion externa

- Repetir la matriz RLS con una cuenta real de rol `recepcion`.
- Validar subida y eliminacion de logo/avatar desde Storage.
- Ejercer un ajuste de pago autorizado y comprobar su auditoria en produccion.
- Validar visualmente en produccion despues del deploy del frontend.
- Confirmar instalacion offline de la PWA/kiosk despues del deploy y probar el
  endpoint de telemetria si se configura `VITE_ERROR_REPORT_URL`.
- Descargar y abrir una exportacion de cada modulo con una cuenta de recepcion.
