# NEXUS — prototipo interactivo para presentar

**Proyecto:** NEXUS · CRM para Pymes de servicios  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS 3 + componentes estilo shadcn/ui (Button, Card, Badge, Input, Dialog, Textarea; Dialog utiliza Radix UI).  
**Objetivo:** mostrar la propuesta comercial y dos funcionalidades interactivas sin backend.

## Qué contiene

- **Landing page:** propuesta de valor, beneficios, funcionamiento, precios y CTA para abrir la demo.
- **Embudo Kanban:** cuatro etapas (Nuevo, En contacto, Propuesta, Ganado), tarjetas arrastrables, registro de prospectos y cambio de etapa también mediante un selector (para teléfonos).
- **Recordatorios:** crear tareas relacionadas con un prospecto, fechas y prioridades, marcar como realizadas, filtrar pendientes y todos.
- **Resumen:** indicadores dinámicos, progreso comercial y seguimientos prioritarios.
- **Modo demostración:** 9 prospectos y 5 recordatorios **ficticios** para enseñar inmediatamente. Los cambios se guardan en `localStorage`, solo en el navegador; el botón redondo con flecha arriba a la derecha restaura la demo.

No se hacen cobros, no existe autenticación real y no hay servidor de datos ni notificaciones push. La lógica es intencionalmente simulada, adecuada para exponer un prototipo y no un producto de producción.

## Iniciar en tu computadora

**Requisitos:** Node.js 20.19+ (recomendado Node.js 22), npm y conexión a Internet para instalar paquetes.

```bash
npm install
npm run dev
```

Abre la dirección que indique la terminal (normalmente `http://localhost:5173`).

Para generar el sitio estático:

```bash
npm run build
npm run preview
```

Vite crea la versión lista para publicar en `dist/`.

## Despliegue rápido en Vercel

1. Extrae este ZIP en una carpeta, súbela a un repositorio **GitHub** (por ejemplo `nexus-crm-demo`).
2. Entra a [vercel.com/new](https://vercel.com/new), importa el repositorio.
3. Vercel debería detectar **Vite**. Si necesitas configurarlo manualmente:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
4. Haz clic en **Deploy** y comparte la dirección que genere Vercel.

Alternativa: **Netlify** → importa el repositorio → build `npm run build` → publish `dist`.

> No necesitas claves API, base de datos, cuentas ni variables de entorno.

## Colores oficiales de la marca

| Aplicación | Color | HEX |
| --- | --- | --- |
| Primario / identidad | Azul Pizarra Oscuro | `#1B3F60` |
| Texto y complementos | Gris Humo Oscuro | `#1E293B` |
| Botones y llamadas a la acción | Naranja Vibrante | `#F37324` |
| Complemento del azul | Azul Oscuro | `#163D60` |

Los archivos de logotipo derivan de los originales proporcionados por el equipo de NEXUS (versiones claro/oscuro); se prepararon con transparencia para su uso web. Los archivos están en `public/`.

## Precios y texto

La landing utiliza los precios de **Entrega 2** y de la presentación: **Plan Esencial $380 MXN/mes**, **Plan Crecimiento $780 MXN/mes** y **prueba de 14 días**. Las capacidades detalladas de Crecimiento aún no están cerradas: el sitio las etiqueta como *proyectadas* para no ofrecer funciones que el prototipo no incluye.

**Slogan:** “Tus clientes en orden. Tu negocio en movimiento.”

## Guion sugerido (60–90 segundos)

1. **Landing** (15 s): “NEXUS es un CRM fácil de usar para Pymes que todavía organizan sus ventas en Excel o libretas.” Menciona el slogan.
2. **Entrar a la demo** (10 s): pulsa **Explorar demo gratis** para mostrar que el SaaS se usa directamente desde la web.
3. **Kanban** (25 s): entra a **Embudo de ventas**, crea un prospecto con “Nuevo prospecto”, muévelo de “Nuevo” a “En contacto” arrastrando o cambiando su etapa.
4. **Recordatorios** (20 s): selecciona un prospecto → **Crear recordatorio**, elige una fecha; después entra a **Seguimientos** y marca la tarea como realizada.
5. **Cierre** (10 s): vuelve a la landing, muestra los planes de $380 y $780 MXN y la prueba de 14 días. Recalca que es un prototipo funcional del MVP, no el producto terminado.

## Organización de archivos

```text
nexus-demo/
├── public/                 # Logotipos originales preparados para web
├── src/
│   ├── components/ui/      # Primitivas estilo shadcn/ui
│   ├── lib/demo-data.ts    # Datos ficticios y tipos
│   ├── lib/utils.ts        # Formato moneda/fecha, clases
│   ├── Landing.tsx         # Sitio comercial
│   ├── Dashboard.tsx       # CRM interactivo
│   ├── App.tsx             # Navegación y persistencia
│   ├── index.css           # Tailwind y estilos
│   └── main.tsx
├── package.json
└── README.md
```

## Antes de presentar

- **Abrir la URL desplegada** en la misma computadora y red en la que expondrán.
- **Probar los botones**: crear prospecto, cambiar etapa, crear recordatorio, marcar hecho y restablecer.
- **Mantener abierto el sitio** en otra pestaña por si la conexión falla o cambia.
- Para evitar sorpresas, lleva una **copia local** y ejecuta `npm run dev` como respaldo si ya instalaste dependencias.

> **Limitación de verificación:** este paquete se revisó sintácticamente en el entorno de generación, pero la instalación de dependencias y compilación completa no pudo ejecutarse aquí porque no había acceso al registro de npm. En tu equipo, ejecuta `npm install && npm run build` antes de desplegar.
