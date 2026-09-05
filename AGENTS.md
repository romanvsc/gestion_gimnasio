# AGENTS.md — Gestión Gimnasio

Guía operativa obligatoria para las personas y agentes que modifican este repositorio.
Este archivo describe cómo evolucionar el sistema sin romper sus reglas de negocio,
su seguridad ni sus límites de dominio.

## 1. Alcance y forma de trabajo

- Leer este archivo antes de implementar cambios.
- Analizar primero el código, las rutas, los composables, las stores y el esquema real
  de Supabase relacionados con la tarea.
- Proponer un plan paso a paso antes de escribir código. El plan debe indicar el
  Bounded Context primario, los contextos impactados, los invariantes afectados y la
  evidencia de verificación prevista.
- Mantener los cambios acotados al pedido. No hacer refactors masivos, migraciones de
  infraestructura o cambios de producto no solicitados.
- Separar evidencia automatizada de aceptación manual: un build exitoso no prueba por
  sí solo el flujo autenticado, la experiencia móvil ni la autorización de Supabase.
- Antes de entregar, revisar `git diff --check`, el diff completo y el estado del
  repositorio. No incluir `.env`, claves ni datos reales en commits o documentación.

## 2. Contexto técnico actual

Este repositorio es un monolito modular de:

- Vue 3 con `<script setup>`.
- Vite, Vue Router, Pinia y Tailwind CSS.
- Supabase JS como cliente de autenticación, persistencia, storage y realtime.
- Vercel como despliegue del frontend.
- JavaScript, no TypeScript: usar JSDoc y contratos explícitos mientras no exista una
  migración aprobada a TypeScript.

La estructura actual concentra responsabilidades en:

```text
src/views/          pantallas y composición de flujos
src/components/     componentes visuales y de interacción
src/composables/    lógica de aplicación existente, en proceso de separación
src/stores/         estado global de sesión y dashboard
src/lib/            cliente Supabase, manejo de errores y utilidades técnicas
src/router/         navegación y guardas de presentación
supabase/           espacio reservado para funciones y artefactos de Supabase
```

La arquitectura objetivo se adopta de manera incremental. El código legado puede
permanecer donde está hasta que se toque, pero todo código nuevo debe respetar las
capas y los límites definidos aquí.

## 3. Regla arquitectónica obligatoria

### 3.1 Skill `clean-ddd-hexagonal`

La skill `clean-ddd-hexagonal` es obligatoria para cualquier cambio que incluya uno o
varios de estos elementos:

- dominio, reglas de negocio, entidades, value objects o aggregates;
- casos de uso, servicios de aplicación, repositorios o puertos;
- Supabase, SQL, RPC, RLS, storage, realtime o autenticación;
- contratos entre contextos, eventos, integraciones o nuevas rutas de API;
- refactors de arquitectura o extracción de lógica desde un composable/view.

Antes de implementar ese cambio, el agente debe leer y aplicar la skill completa. No
se debe mencionar la skill como una recomendación decorativa: sus decisiones sobre
dependencias, puertos, adaptadores, aggregates y límites son criterios de aceptación.

Para un cambio exclusivamente visual o de copy, no hace falta crear un modelo de
dominio; aun así, se debe respetar el Bounded Context propietario y no introducir
acoplamiento nuevo.

### 3.2 Regla de dependencias

Las dependencias apuntan hacia adentro:

```text
presentation → application → domain
infrastructure → application/domain ports
composition root → ensambla todo
```

Reglas concretas:

- `domain/` no importa Vue, Supabase, HTTP, Pinia, `localStorage`, fechas de UI ni
  librerías de infraestructura.
- `application/` coordina casos de uso y depende de puertos, no de `supabase` ni de
  componentes Vue concretos.
- `infrastructure/` implementa puertos: adaptadores Supabase, storage, realtime,
  RPC, HTTP o servicios externos.
- `presentation/` convierte interacción de usuario en comandos/casos de uso y
  muestra resultados; no decide reglas de negocio ni consulta tablas directamente.
- Un controlador, una vista o una store nunca llama a un repositorio concreto para
  saltarse el caso de uso.
- `src/lib/supabase.js` es un adaptador/composición técnica, no un lugar para reglas
  de negocio.

## 4. Bounded Contexts y agentes propietarios

Los siguientes agentes son roles lógicos de trabajo. No representan necesariamente
microservicios ni procesos separados. Cada cambio debe tener un agente propietario
primario; los demás participan como revisores cuando sus contratos son afectados.

### 4.1 `@IdentityAccessAgent` — Identity & Access

**Propósito:** identidad, autenticación, autorización y usuarios internos.

**Propietario de:**

- login, sesión, cierre de sesión y recuperación del estado autenticado;
- roles `admin` y `staff`, guardas de rutas y permisos;
- altas, edición y activación/desactivación de usuarios internos;
- `auth.users`, `staff` y el adaptador `supabaseGhost`.

**Superficies actuales:** `useAuth.js`, `userStore.js`, `useStaff.js`,
`LoginView.vue`, `StaffListView.vue`, `StaffFormModal.vue` y `router/index.js`.

**Invariantes:**

- una guarda de Vue mejora la UX, pero nunca reemplaza RLS o autorización en la base;
- operaciones administrativas deben verificar rol en servidor, RPC o política RLS;
- no exponer claves service-role ni crear usuarios desde una superficie sin control de
  privilegios;
- `supabaseGhost` no debe alterar accidentalmente la sesión del administrador.

**No debe decidir:** precios, vigencia de cuotas, cálculo de pagos, acceso por cuota
ni métricas del gimnasio.

### 4.2 `@MemberRegistryAgent` — Member Registry

**Propósito:** ciclo de vida y datos del socio.

**Propietario de:**

- alta, edición, consulta, inactivación y validación de socios;
- datos personales, contacto, apto físico, notas, avatar y clasificación de socio;
- `members` y el storage de `avatars`;
- referencias externas como `plan_id`, sin apropiarse del agregado `Plan`.

**Superficies actuales:** `useMembers.js`, `MembersListView.vue`,
`MemberFormView.vue`, `MemberDetailView.vue` y componentes de miembros.

**Invariantes:**

- DNI y las reglas de duplicidad definidas por el caso de uso deben validarse antes de
  guardar;
- un socio referencia un plan por ID; no copia ni modifica la entidad Plan;
- los datos personales no deben aparecer en logs, fixtures o documentación sin
  necesidad.

**No debe decidir:** cómo se calcula el estado de cuota, cómo se registra un pago o
  cómo se autoriza un check-in.

### 4.3 `@PlansCatalogAgent` — Plans & Parameter Catalog

**Propósito:** catálogo comercial y parámetros seleccionables del gimnasio.

**Propietario de:**

- planes, duración, precio regular, precio de socio y estado activo;
- conceptos, métodos de pago y tamaños de página configurables;
- reglas de disponibilidad del catálogo para formularios;
- `plans`, `concepts`, `payment_methods` y `member_page_sizes`.

**Superficies actuales:** `useParameters.js`, `PlanModal.vue` y la sección de planes
de `SettingsView.vue`.

**Implementación extraída:** `src/contexts/plans-catalog/`.

**Invariantes:**

- toda opción mostrada en un `<select>` o selector de parámetros debe provenir de la
  base y cargarse por `useParameters.js`; nunca crear arrays fijos para opciones de
  negocio;
- `precio_socio` es opcional; cuando no existe, el caso de uso de pago debe aplicar el
  precio regular;
- desactivar un plan evita nuevas asignaciones, pero no borra su historia;
- modificar un plan no reescribe pagos existentes ni cambia el monto histórico;
- cambios de precios requieren verificar el formulario de pagos y la resolución para
  socios del club.

**No debe decidir:** la identidad del usuario, el acceso físico, el cierre de caja ni
  las métricas.

### 4.4 `@BillingCashAgent` — Billing & Cash

**Propósito:** cobro de membresías y tesorería operativa.

**Propietario de:**

- creación y consulta de pagos;
- cálculo de fecha de finalización según el plan elegido;
- monto cobrado, método de pago y transacciones de caja;
- `payments`, `transactions` y RPCs de saldo/caja.

**Superficies actuales:** `usePayments.js`, `NewPaymentView.vue`,
`useCashRegister.js`, `CashView.vue`, `TransactionModal.vue` y `PaymentSummaryCard.vue`.

**Implementación extraída:** `src/contexts/billing-cash/`, con los agregados
`Payment` y `CashTransaction`, casos de uso para registrar/listar pagos y operar
la caja, puertos de repositorio, proveedor de usuario autenticado y adaptadores
Supabase/RPC. Los composables actuales son fachadas de compatibilidad.

**Invariantes:**

- `fecha_fin` se calcula automáticamente desde `fecha_inicio` y `dias_duracion` del
  plan seleccionado;
- el historial de pagos es inmutable: agregar nuevos registros, nunca editar o borrar
  pagos pasados como forma de corregir un precio;
- `monto` es el snapshot del importe cobrado al momento del pago; no recalcularlo con
  el precio actual del plan;
- guardar fechas en formato ISO compatible con Postgres;
- registrar un pago y una transacción de caja debe pasar por casos de uso explícitos,
  con manejo visible de errores.

**No debe decidir:** quién puede iniciar sesión, la definición de un plan, el estado de
  acceso o la presentación de gráficos.

### 4.5 `@AttendanceAccessAgent` — Attendance & Access Control

**Propósito:** control de acceso y registro de asistencia.

**Propietario de:**

- búsqueda de un socio para check-in;
- decisión de acceso permitido/denegado;
- registro de cada intento de acceso y suscripciones realtime;
- `attendance` y la lectura de `v_socios_estado`.

**Superficies actuales:** `useAttendance.js`, `CheckInView.vue`,
`AssistanceChart.vue`, `LastAccessModal.vue` y los bloques de asistencia del dashboard.

**Invariantes:**

- la fuente de verdad del estado de cuota es `v_socios_estado` o una función RPC; no
  duplicar la decisión calculando fechas en JavaScript;
- `estado_cuota == 'activo'` permite acceso y cualquier otro estado lo deniega;
- cada intento se registra con `acceso_permitido` coherente con la decisión tomada;
- fechas y zonas horarias deben convertirse de manera explícita y consistente.

**No debe decidir:** precios, edición de socios, roles ni resultados financieros.

### 4.6 `@ReportingAnalyticsAgent` — Reporting & Analytics

**Propósito:** consultas de lectura, indicadores y exportaciones.

**Propietario de:**

- reportes financieros y de actividad;
- métricas del dashboard, gráficos y alertas;
- exportación a Excel/PDF y modelos de lectura;
- RPCs de consulta como estadísticas mensuales, diarias y horarias.

**Superficies actuales:** `useReports.js`, `useExport.js`, `ReportsView.vue`,
`DashboardView.vue` y componentes de charts/reports.

**Invariantes:**

- los reportes leen modelos, vistas o RPCs; no mutan pagos, socios ni asistencia;
- no duplicar reglas de negocio críticas en un gráfico;
- si un indicador necesita una definición nueva, documentar su contrato y fuente de
  datos antes de implementarlo;
- distinguir estado de carga, error, vacío y datos reales.

**No debe decidir:** permisos, precios, acceso ni modificaciones de datos operativos.

### 4.7 `@GymConfigurationAgent` — Gym Configuration

**Propósito:** identidad configurable del gimnasio y configuración operativa no
  comercial.

**Propietario de:**

- nombre, contacto, WhatsApp, dirección y horarios;
- logo y su ciclo de vida en storage;
- tabla `config` y sus reglas de actualización.

**Superficies actuales:** `useSettings.js`, `SettingsView.vue` y el bloque de
identidad/configuración del login.

**Invariantes:**

- validar tipo y tamaño de imágenes antes de subirlas;
- una URL de logo debe corresponder al recurso realmente almacenado;
- configuración vacía debe tener un estado de fallback claro sin ocultar errores;
- esta área no puede modificar planes, pagos o roles como efecto lateral.

### 4.8 `@FrontendExperienceAgent` — User Experience & Presentation

**Propósito:** presentación, accesibilidad, responsive design, PWA y componentes
compartidos. Es un agente transversal de UI, no propietario de reglas de negocio.

**Propietario de:**

- `components/ui`, layouts, navegación, tema, responsive y estados visuales;
- labels, foco, teclado, mensajes de error y feedback de operaciones;
- experiencia mobile-first y targets táctiles de al menos 44 px;
- lenguaje claro para usuarios del gimnasio, sin exponer IDs, tablas o conceptos de
  API innecesarios.

**Reglas:**

- usar `<script setup>` y Composition API;
- reutilizar `BaseButton`, `BaseInput`, `BaseSelect`, `StatusBadge`, `BaseModal` y
  componentes equivalentes antes de crear controles paralelos;
- no colocar lógica de dominio dentro de una vista o componente;
- separar visualmente `cargando`, `error`, `vacío` y `datos`;
- mantener la UI usable en tablet y móvil, con foco visible y nombres accesibles;
- el agente de UX puede consumir casos de uso, pero no crear consultas Supabase para
  resolver reglas de negocio.

### 4.9 `@ArchitectureGuardian` — Architecture & Persistence Review

**Propósito:** revisión transversal de límites, contratos y seguridad técnica.

Este agente no es dueño de todas las tablas. Revisa junto al agente de contexto:

- aplicación obligatoria de `clean-ddd-hexagonal`;
- dirección de dependencias y ausencia de filtraciones de infraestructura;
- RLS, RPC, migraciones y adaptadores Supabase;
- contratos entre Bounded Contexts, SOLID y estrategia de pruebas;
- que el monolito siga siendo modular y no se convierta accidentalmente en una red de
  consultas cruzadas.

Una revisión de persistencia no autoriza a cambiar reglas comerciales sin el agente
propietario del contexto correspondiente.

## 5. Reglas de colaboración entre contextos

### 5.1 Propiedad y límites

- Nombrar un agente primario por tarea y uno o más revisores solo si existe impacto
  real.
- El agente primario es dueño de los invariantes de su contexto.
- Una tabla, aggregate o regla tiene un único contexto propietario. Otros contextos
  consumen un puerto, una vista de lectura, un DTO o una referencia por ID.
- No importar entidades de dominio entre contextos. Compartir únicamente tipos
  primitivos, IDs, contratos o eventos publicados.
- No crear un paquete `common` con lógica comercial. `shared/` queda reservado para
  utilidades técnicas, errores base, fechas y componentes sin significado de negocio.

### 5.2 Cambios que cruzan contextos

Cuando una tarea toca dos o más contextos:

1. documentar el flujo y el contexto propietario de cada dato;
2. definir el contrato de entrada/salida antes de modificar adaptadores;
3. usar puertos y casos de uso, o un modelo de lectura/ACL si es una consulta;
4. evitar transacciones que mezclen aggregates de contextos distintos;
5. verificar cada contexto por separado y luego el flujo integrado.

Ejemplo: registrar un pago puede leer un `Plan` por ID y emitir un resultado para
actualizar el estado de cuota, pero Billing no modifica el aggregate Plan ni Attendance
decide cuánto cobrar.

## 6. Estructura Clean DDD Hexagonal objetivo

Para código nuevo o extraído, usar esta forma dentro del contexto correspondiente:

```text
src/contexts/<bounded-context>/
├── domain/
│   ├── entities/          # identidad y comportamiento
│   ├── value-objects/     # valores inmutables
│   ├── aggregates/        # límites de consistencia
│   ├── services/          # lógica pura que no cabe en una entidad
│   ├── events/            # solo si el caso lo necesita
│   └── ports/             # interfaces de repositorio o servicios requeridos
├── application/
│   ├── commands/queries/  # entradas de casos de uso
│   ├── use-cases/         # orquestación
│   └── ports/             # puertos de entrada y dependencias externas
├── infrastructure/
│   ├── persistence/       # adaptadores Supabase/RPC/storage
│   ├── messaging/          # realtime/eventos si aplica
│   └── mapping/            # filas/DTOs ↔ modelo del contexto
└── presentation/
    ├── views/
    ├── components/
    └── composables/       # fachada de UI hacia casos de uso
```

Reglas de extracción incremental:

- Un composable existente puede actuar temporalmente como fachada, pero la lógica
  nueva debe separarse de la consulta Supabase cuando se toque ese flujo.
- Una vista nueva llama a un caso de uso o a una fachada del contexto, no a
  `.from('tabla')` directamente.
- El adaptador traduce `{ data, error }` de Supabase a resultados o errores del
  contexto; la vista no debe conocer códigos de Postgres.
- No mover archivos solo para simular arquitectura. Cada extracción debe mejorar un
  límite, una prueba o una dependencia concreta.

## 7. Building blocks y SOLID

### 7.1 DDD táctico

- **Entity:** tiene identidad y comportamiento; igualdad por ID.
- **Value Object:** describe un valor inmutable; igualdad por contenido.
- **Aggregate:** límite de consistencia; desde afuera se referencia únicamente su root.
- **Repository:** un puerto por aggregate root, no un repositorio genérico por tabla.
- **Domain Service:** lógica pura entre conceptos del mismo contexto que no pertenece a
  una entidad.
- **Application Service/Use Case:** coordina pasos, puertos y efectos; no contiene
  reglas de presentación.
- **Domain Event:** solo para un cambio relevante que necesite desacoplar procesos; no
  agregar eventos por moda.

### 7.2 SOLID obligatorio

- **S — Single Responsibility:** una vista presenta, un caso de uso coordina, un
  adaptador traduce persistencia y una entidad protege sus invariantes.
- **O — Open/Closed:** extender políticas mediante nuevos casos/adaptadores sin editar
  condicionales centrales interminables.
- **L — Liskov Substitution:** cualquier adaptador que implemente un puerto debe respetar
  sus precondiciones, resultados y errores.
- **I — Interface Segregation:** puertos pequeños orientados a casos de uso; evitar
  interfaces gigantes de Supabase.
- **D — Dependency Inversion:** el dominio y la aplicación dependen de abstracciones;
  la infraestructura las implementa.

No usar SOLID para fabricar capas vacías. Si el dominio es simple, mantener el diseño
simple y conservar solamente las fronteras que aportan testabilidad o seguridad.

## 8. Reglas de negocio transversales

- **Cuota:** consultar `v_socios_estado` o una RPC; no calcular vencimientos de manera
  independiente en cada pantalla.
- **Pago:** calcular automáticamente `fecha_fin`; guardar el monto cobrado; no editar
  ni borrar el historial como mecanismo de actualización.
- **Precio:** resolver precio regular o precio de socio en un único caso de uso; no
  repetir la misma regla en vistas distintas.
- **Listas de negocio:** planes, conceptos, métodos de pago y parámetros seleccionables
  salen de Supabase mediante `useParameters.js` o el puerto equivalente extraído.
- **Errores:** siempre leer `{ data, error }`; transformar y notificar el error sin
  ocultarlo. Los mensajes técnicos quedan en logs controlados, los usuarios reciben
  lenguaje claro.
- **Fechas:** enviar y persistir ISO/Postgres; convertir a formato humano únicamente
  en presentación.
- **Seguridad:** la UI no es una frontera de seguridad; las políticas RLS y controles
  de rol son obligatorios para datos y operaciones administrativas.

## 9. Flujo obligatorio para implementar

1. **Descubrir:** localizar ruta, vista, composable, store, tabla, vista SQL/RPC y
   configuración que son fuente de verdad.
2. **Delimitar:** elegir `@Agent` primario, Bounded Context propietario, contextos
   impactados e invariantes.
3. **Planificar:** escribir un plan corto con cambios, riesgos y verificación.
4. **Modelar:** si hay reglas de dominio, aplicar la skill `clean-ddd-hexagonal`,
   definir aggregate, caso de uso, puertos y contratos antes del adaptador.
5. **Implementar dominio/aplicación:** mantenerlos puros y testeables sin navegador ni
   Supabase.
6. **Implementar adaptadores:** agregar consultas, RPC, RLS o storage con mapeos
   explícitos y manejo de `{ data, error }`.
7. **Conectar presentación:** usar componentes existentes, feedback accesible,
   estados de carga/error/vacío/datos y responsive mobile-first.
8. **Verificar:** ejecutar pruebas disponibles, `npm run build`, `git diff --check` y
   las comprobaciones manuales o autenticadas que el flujo requiera.
9. **Revisar:** confirmar que no se cruzaron límites, no se modificó historia
   inmutable y no se incluyeron secretos o cambios ajenos.

## 10. Definition of Done

Una tarea está terminada cuando:

- tiene contexto propietario y agente primario identificados;
- conserva la dirección de dependencias y, si aplica, evidencia de uso de
  `clean-ddd-hexagonal`;
- las reglas de negocio viven en un caso de uso, entidad o servicio de dominio, no
  duplicadas en la UI;
- los adaptadores manejan errores y permisos de Supabase correctamente;
- las listas y parámetros de negocio no están hardcodeados;
- las pruebas automatizadas y el build pasan, indicando claramente cualquier warning;
- la aceptación manual, visual, móvil o con datos autenticados queda verificada o
  explícitamente pendiente;
- `git diff --check` no informa errores y el diff contiene únicamente el alcance pedido.

## 11. Prohibiciones

- No agregar lógica de negocio directamente en templates, handlers de click o stores
  globales.
- No consultar Supabase directamente desde una vista o componente nuevo.
- No crear arrays fijos para opciones que representan datos del negocio.
- No permitir que el dominio importe Supabase, Vue, Pinia o APIs del navegador.
- No crear repositorios por cada tabla ignorando aggregates.
- No modificar pagos históricos para reflejar un cambio de precios.
- No usar la guarda de frontend como único control de autorización.
- No introducir microservicios, CQRS, Event Sourcing, mensajería o un Unit of Work
  complejo sin una necesidad demostrada y una decisión documentada.
- No hacer un big-bang refactor del monolito. Extraer por flujo, contexto y riesgo.
- No mezclar cambios de formato, dependencias o estilos no relacionados con la tarea.

## 12. Comandos de verificación

```powershell
npm install
npm run dev
npm run build
git diff --check
git status --short
```

Si se agregan pruebas al proyecto, deben incorporarse como script explícito en
`package.json` y ejecutarse en la Definition of Done. Las validaciones contra Supabase
deben usar un entorno autorizado y nunca imprimir claves o datos sensibles.

## 13. Bonus opcional

Cuando el alcance lo justifique, proponer por separado —sin imponerlo—:

- `CONTEXT.md` con el mapa de contexto y decisiones de integración;
- ADRs para cambios que crucen contextos, esquema, RLS o contratos;
- pruebas de arquitectura que detecten imports prohibidos;
- tests unitarios de dominio sin Supabase ni navegador;
- una carpeta `supabase/migrations/` versionada para cambios de esquema y políticas;
- documentación de aceptación manual para flujos autenticados y responsive.
