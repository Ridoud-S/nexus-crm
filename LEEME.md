# Nexus — MVP

Prototipo frontend del asistente visual de ventas: tablero Kanban, ficha de prospecto con mensaje de WhatsApp, cotización en PDF, métricas y agente de IA.

React 18 + Vite + Tailwind 3. Los datos viven en `localStorage`, no hay backend todavía.

## Correr en local

Necesitas Node 18 o superior.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. El build de producción es `npm run build` y queda en `dist/`.

## Desplegar en Vercel

Este repo está listo para Vercel sin configuración: detecta Vite solo. Si tienes que ponerlo a mano:

| Ajuste | Valor |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | (vacío, la raíz del repo) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Rutas que quedan publicadas:

- `/` — la landing con los precios.
- `/app` — la aplicación.

Los botones "Ver demo" y "Comenzar gratis" de la landing ya apuntan a `/app`.

## Estructura

```
index.html                   La landing (entrada de `/`)
app/index.html               Entrada de la aplicación (`/app`)
src/
├── main.jsx                 Punto de entrada
├── index.css                Tailwind + animaciones + estilos de impresión
├── lib/engine.jsx           Datos semilla y motor de reglas
└── components/
    ├── ui.jsx               Primitivos, chat y bloques del agente
    ├── board.jsx            Kanban, ficha del prospecto, cotización
    └── app.jsx              Dashboard, agente, sidebar y App
public/marca/                Ícono, logo, robot, banner y avatar en .webp
```

Las dos páginas se compilan juntas con `npm run build`; la configuración está en `vite.config.js`.

## Lo pendiente

- **Persistencia:** todo se guarda en `localStorage` con la llave `nexus-demo-v1` (constante `LS_KEY` en `engine.jsx`). Para conectar un backend, los puntos a cambiar son `loadState` y el `useEffect` que guarda en `App`.
- **IA:** el agente es un motor de reglas, no un modelo. `detect()` clasifica la pregunta y `answer()` arma la respuesta con los datos del tablero. `probOf`, `stats` y `rank` son los cálculos que le pasarías como contexto a un modelo real.
- **Cotización:** usa `window.print()` con una regla `@media print`. Si vas a generar PDFs en el servidor, ese es el punto de cambio.
