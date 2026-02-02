# Gestión Gimnasio

PWA para la gestión de un gimnasio con Vue 3 y Supabase.

## Requisitos
- Node.js 18+
- Cuenta de Supabase

## Configuración
1. Copia el archivo de ejemplo de variables de entorno:
   - [.env.example](.env.example) -> `.env`
2. Completa:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Clonar y ejecutar en local
```sh
git clone <URL_DEL_REPO>
cd gestion_gimnasio
npm install
npm run dev
```

La app corre en modo local con Vite. El punto de entrada es [src/main.js](src/main.js).

## Scripts disponibles
Definidos en [package.json](package.json):
- `npm run dev`
- `npm run build`
- `npm run preview`

## Colaboración
- Crea una rama desde `main`:
  - `feat/<tema>` para nuevas features
  - `fix/<tema>` para correcciones
- Abre PR con descripción clara, pasos de prueba y capturas si aplica.
- Respeta las reglas de UI y datos:
  - Componentes base: [`BaseButton`](src/components/ui/BaseButton.vue), [`BaseInput`](src/components/ui/BaseInput.vue), [`StatusBadge`](src/components/ui/StatusBadge.vue)
  - Parámetros desde [`useParameters`](src/composables/useParameters.js)
  - Configuración global desde [`useSettings`](src/composables/useSettings.js)

## Características principales
- Gestión de socios (alta, edición, detalle) mediante [`useMembers`](src/composables/useMembers.js).
- Registro de pagos y planes (ver [src/views/Payments/NewPaymentView.vue](src/views/Payments/NewPaymentView.vue) y parámetros en [`useParameters`](src/composables/useParameters.js)).
- Check-in con control de acceso basado en estado de cuota (ver [`useAttendance`](src/composables/useAttendance.js)).
- Reportes y exportación a Excel/PDF (ver [`useReports`](src/composables/useReports.js) y [`useExport`](src/composables/useExport.js)).
- Caja diaria y exportación de movimientos (ver [`useCashRegister`](src/composables/useCashRegister.js)).

## Estructura de carpetas
- [src/views](src/views): pantallas principales.
- [src/components](src/components): componentes reutilizables.
- [src/composables](src/composables): lógica de negocio.
- [src/stores](src/stores): estado global con Pinia.

## Despliegue
Configuración para Vercel en [vercel.json](vercel.json).