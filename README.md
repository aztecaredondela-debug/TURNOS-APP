# Turnos (app personal)

Calendario de turnos configurable por cada usuario. Funciona sin cuenta y sin conexión: los datos se guardan en el móvil.

## Estructura
- `index.html`: pantalla base y orden de carga de los scripts.
- `style.css`: estilos.
- `js/`: el código, un archivo por responsabilidad (se cargan en este orden):
  `base` (utilidades y fechas) · `datos` (estado guardado) · `calculo` (turno de cada día, horas, jornada) ·
  `calendario` · `ciclo` (pantallas Ciclo y Turnos) · `resumen` · `permisos` · `festivos` ·
  `ui` (hojas inferiores y editor de turnos) · `acciones` (qué hace cada botón) · `main` (arranque).
- `sw.js`, `manifest.json`, `icon-*.png`: instalación como app y uso sin conexión. **Los iconos son provisionales.**
- `tests/prueba.js`: pruebas de la lógica. Se ejecutan con `node tests/prueba.js`.

Los archivos de `js/` son scripts normales que comparten variables (no módulos ES), porque algunos
controles usan atributos `onchange` que necesitan variables globales. Por eso el orden de `index.html` importa.

## Al cambiar el código
1. Ejecuta `node tests/prueba.js`.
2. Sube el número de versión: `?v=` en `index.html` y en la lista de `sw.js` (y el nombre de caché `turnos-app-N`).

## Datos (en el móvil)
`turnos` (tipos), `ciclo` + `ref` (patrón y día 1), `dias` (cambios sueltos), `hd` (horas de un día),
`cfg` (jornada), `pd` (cuándo se marcó un permiso), `cb` (cambios con compañeros), `nt` (notas), `fe` (festivos).
La copia de seguridad (pestaña Turnos) guarda todo en un archivo.

## Pendiente
Pro (widgets, alarmas avanzadas, varios calendarios, exportar PDF/.ics, informe anual), nube y equipos,
festivos de otros países, icono y nombre definitivos, política de privacidad, empaquetado para Play Store.
