# Auditoria de dependencias - 2026-09-05

## Resultado

- `npm audit --audit-level=moderate`: **0 vulnerabilidades**.
- Se retiro `xlsx@0.18.5`, que tenia avisos altos de Prototype Pollution y
  ReDoS sin parche oficial.
- Se agrego `write-excel-file@4.1.1` como generador de archivos `.xlsx` para
  navegador.
- Se declararon `jspdf` y `jspdf-autotable` como dependencias directas porque
  ya eran utilizadas por las exportaciones del Dashboard.
- El toolchain se actualizo a `vite@7.3.6`, `@vitejs/plugin-vue@6.0.8` y
  `postcss@8.5.28` junto con las actualizaciones transitivas auditadas.

## Superficie de exportacion

Las exportaciones de Dashboard, Reportes y Caja generan hojas internas a partir
de datos ya consultados por la aplicacion. No se aceptan planillas subidas, no
se leen workbooks y no se ejecutan funciones de parseo como `readFile`, `read`
o `sheet_to_json`.

El contrato estatico de seguridad verifica que estas rutas no vuelvan a
importar `xlsx` ni incorporen lectura de archivos. La aceptacion manual
pendiente es descargar una exportacion de cada modulo y abrirla en Excel o
LibreOffice con una cuenta de recepcion.
