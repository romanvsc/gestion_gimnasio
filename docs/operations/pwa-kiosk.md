# PWA y modo kiosco

## Instalación

La aplicación publica `manifest.webmanifest`, el logo SVG de Yacyretá y un
service worker same-origin. El service worker no intercepta Supabase ni guarda
respuestas de autenticación o datos de socios.

La instalación precarga el shell de la aplicación (HTML, manifest, logo y assets
referenciados) para que la interfaz pueda abrirse sin red después de una visita
online. Todavía debe validarse desde un navegador de producción; la aplicación
continúa necesitando conexión para consultar y registrar datos.

## Puesto de ingreso

Abrir:

```text
/checkin?kiosk=1
```

Ese modo oculta la navegación global y deja disponible únicamente el flujo de
Check-in. El botón `Salir del kiosco` vuelve a `/checkin` sin el parámetro.

No se incorporan nombres, DNI ni respuestas de Supabase al caché del navegador.
