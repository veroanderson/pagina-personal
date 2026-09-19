# Technical Design Document — Portfolio Vero Anderson

Este documento define **qué** se va a construir y **cómo**, para que un agente de desarrollo (u otra persona) pueda implementarlo sin tener que rederivar contexto. Fuentes: `contexto-cliente-vero.md` (dominio y dirección creativa) y las skills instaladas en `.skills/` (arquitectura y patrones de diseño). Antes de escribir código, leer:

- `.skills/arquitectura-monolitica/SKILL.md` completo — Reglas de Oro no negociables, Fase 0 ya resuelta en este documento, mapa de `template/`.
- `.skills/arquitectura-monolitica/04-SECURITY-PATTERNS.md` — antes de tocar auth, uploads o el endpoint de contacto.
- `.skills/arquitectura-monolitica/07-ADMIN-PANEL-AND-UPLOADS.md` — estructura de tabs del panel, ya construida.
- `.skills/trq-design-skill/SKILL.md` — antes de escribir cualquier componente visual. Es la skill que evita el "síndrome shadcn"; ver § Dirección de Diseño abajo para el resumen aplicado a este proyecto.

---

## 1. Alcance

**Esto es el Portafolio personal de Vero Anderson.** Un sitio de contenido editorial (manifiesto, series, obras, biografía) para que pueda aplicar a becas/subsidios y presentarse ante curadores y galeristas. Prioridad alta — no tiene hoy ningún espacio digital consolidado.

**Fuera de alcance (no tocar en este proyecto):**
- "Alma de Cuadra", su tienda comercial, sigue en Tienda Nube. No hay integración entre ambos sitios ni en código ni en datos — es una decisión explícita de Vero ("dividir las aguas") para no mezclar el circuito artístico con el comercial.
- Cualquier lógica de venta, carrito, pago o stock. Este sitio no vende nada directamente; a lo sumo el formulario de contacto puede derivar un interés en una obra puntual, pero no hay checkout.
- Multi-usuario en el admin: un solo admin (Vero), como ya asume el template (`ADMIN_PASSWORD_HASH` único).

## 2. Stack

Stack actual: Next.js 14 (App Router) + Tailwind + Supabase Database/Storage. La aplicación no depende de infraestructura local ni de escritura persistente en el filesystem.

Este proyecto **es** la instancia concreta de la Fase 0 de descubrimiento de la skill — las respuestas ya están resueltas acá, no hace falta volver a preguntarlas:

| Pregunta de Fase 0 | Respuesta para este proyecto |
|---|---|
| Identidad / dominio | Vero Anderson, portfolio personal. Dominio real: pendiente de confirmar con la agencia (placeholder `verOANDERSON_DOMINIO` en `.env` hasta tenerlo). |
| Topología de despliegue | Hosting compatible con Next.js, con las variables de Supabase configuradas como secretos. |
| Dominio de negocio | Portfolio de artista visual. Entidades: Manifiesto, Series, Obras, Biografía. Ver § 3. |
| Contenido inicial | Placeholders genéricos hasta que Vero cargue contenido real desde `/admin`. **No inventar bio, obras ni textos de Vero.** |
| Uploads | Sí, centrales al proyecto — imágenes de obras y del manifiesto. Usa el endpoint genérico de uploads ya construido en el template (`/api/admin/upload`), sin modificarlo. |
| Autenticación | Un solo admin, como ya está el template. |
| Integraciones | Ninguna paga. El formulario de contacto no necesita email transaccional para el MVP (los mensajes se leen desde `/admin`); si más adelante se pide notificación por mail, evaluar en ese momento sin romper Regla de Oro #2. |

## 3. Modelo de Datos

Reemplaza el esquema de ejemplo de `template/src/lib/db.ts` (`profile`/`experience`/`tech_stack`) por el dominio real. Se conservan `contact_requests` y `settings` tal cual están (ya sirven para contacto y config de uploads). Todas las tablas de contenido llevan `deletedAt DATETIME DEFAULT NULL` y soft delete — nunca `DELETE FROM` (Regla de Oro #3).

```sql
-- Manifiesto: singleton, como "profile" en el template de ejemplo.
CREATE TABLE IF NOT EXISTS manifesto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  statementText TEXT NOT NULL,   -- markdown/texto enriquecido
  imageUrl1 TEXT,                -- imagen grande de textura/detalle (opcional)
  imageUrl2 TEXT                 -- segunda imagen opcional
);

-- Series: colecciones temáticas. De 6 a 60 filas esperadas.
CREATE TABLE IF NOT EXISTS series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,        -- para la URL pública /series/<slug>
  essayText TEXT,                   -- "ensayo de serie", opcional
  displayOrder INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1,   -- 0/1, oculta del sitio público sin borrarla
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME DEFAULT NULL
);

-- Obras: pertenecen obligatoriamente a una serie.
CREATE TABLE IF NOT EXISTS artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seriesId INTEGER NOT NULL REFERENCES series(id),
  title TEXT NOT NULL DEFAULT 'Sin título',
  year TEXT,                        -- texto libre: admite "2023" o "2022–2023"
  technique TEXT NOT NULL,          -- técnica y soporte combinados, ej: "Acuarela sobre papel de algodón 300g"
  heightCm INTEGER,
  widthCm INTEGER,
  availability TEXT NOT NULL DEFAULT 'disponible'
    CHECK (availability IN ('disponible', 'coleccion_privada', 'no_disponible')),
  imageUrl TEXT,                    -- se completa después del upload
  microstory TEXT,                  -- microrrelato/nota de obra, opcional
  displayOrder INTEGER NOT NULL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME DEFAULT NULL
);

-- Biografía / CV: singleton, un único bloque de texto editable.
CREATE TABLE IF NOT EXISTS bio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bioText TEXT NOT NULL   -- markdown: trayectoria, premios, exposiciones, formación
);
```

`contact_requests` y `settings` se copian tal cual del template (ver `template/src/lib/db.ts`), sin cambios de esquema.

**Nota sobre `contact_requests.requestType`**: el template lo trae genérico (pensado para sitios con varios tipos de consulta). Para Vero puede simplificarse a un único tipo implícito ("consulta desde portfolio") o conservarse por si después distingue "consulta por obra" vs "consulta institucional/curatorial" — decisión abierta, ver § 6.

Funciones a exponer desde `db.ts` (mismo patrón que `getProfile`/`updateProfile`/`deleteExperience` del template: `initDb()`, parametrizadas con `?`, filtro `WHERE deletedAt IS NULL` en los `SELECT`):
`getManifesto` / `updateManifesto`, `getSeries` / `getSeriesBySlug` / `createSeries` / `updateSeries` / `deleteSeries`, `getArtworksBySeries` / `createArtwork` / `updateArtwork` / `deleteArtwork`, `getBio` / `updateBio`.

## 4. Sitio Público

Rutas mínimas del App Router:

| Ruta | Contenido |
|---|---|
| `/` | Manifiesto: `statementText` + `imageUrl1`/`imageUrl2` a pantalla grande. Es la puerta de entrada conceptual, no un listado de productos (ver `contexto-cliente-vero.md` § 1: "no es un catálogo"). Incluye navegación a Series, Biografía, Contacto. |
| `/series` | Grid/listado de todas las `series` con `isActive = 1` y `deletedAt IS NULL`, ordenadas por `displayOrder`. Layout de galería (divider grid, sin cards con sombra — ver § 5). |
| `/series/[slug]` | Detalle de una serie: título, `essayText`, y sus `artworks` (ordenadas por `displayOrder`) en el mismo layout de galería. Cada obra muestra título, año, técnica, medidas (`tabular-nums`), estado de disponibilidad. Click en una obra abre el detalle (microrrelato incluido) — **decisión tomada**: como modal/lightbox en la misma página, no una ruta `/obras/[id]` aparte, para no multiplicar páginas de contenido delgado (ver § 6). |
| `/biografia` | Render del `bioText` (markdown). |
| `/contacto` | Formulario que postea a `POST /api/contact` (ya existe en el template, sin tocar su rate limiting ni validaciones — solo simplificar los campos del form si se resuelve la nota de `requestType` de § 3). |

## 5. Panel `/admin`

Se extiende el shell de tabs ya construido (`07-ADMIN-PANEL-AND-UPLOADS.md`), agregando una tab por entidad de dominio dentro de `src/app/admin/(panel)/`. **No crear páginas del panel fuera de `(panel)/`** — ahí es donde vive la protección por `hasValidSession()`, y toda ruta nueva bajo `/api/admin/*` arranca con `requireSession()` (Regla de Oro #8).

| Tab | Ruta | CRUD |
|---|---|---|
| Manifiesto | `/admin/manifiesto` | Editar el singleton: texto + subir/reemplazar hasta 2 imágenes vía `POST /api/admin/upload?entity=manifesto&id=1`. |
| Series | `/admin/series` | Listar/crear/editar/soft-delete series (título, slug, ensayo, orden, activa). Cada fila linkea a su listado de obras. |
| Obras | `/admin/series/[id]/obras` | Listar/crear/editar/soft-delete obras de esa serie. Form con los campos de § 3, upload de imagen vía `POST /api/admin/upload?entity=artwork&id=<artworkId>` (mismo endpoint genérico, sin tocarlo). |
| Biografía | `/admin/biografia` | Editar el `bioText` del singleton. |
| Contactos | `/admin/contactos` | Igual al patrón ya existente en el template para `contact_requests` (marcar leído, soft delete). |
| Uploads | `/admin/uploads` | **Ya construida, no tocar** — config de compresión WebP/calidad + preview. |

Prioridad de UX pedida por la clienta (`contexto-cliente-vero.md` § 1, punto 3): el flujo de carga de una obra nueva (crear → subir imagen → guardar) tiene que ser rápido, sin pasos de más — Vero va a cargar volumen alto de material digitalizado.

## 6. Dirección de Diseño

Resumen accionable — **consultar `.skills/trq-design-skill/SKILL.md` completo antes de construir cualquier componente**, esto es solo el punteo aplicado a este cliente:

- **Ancla**: "Editorial Warm Minimal se encuentra con la contemplación fría y desaturada de la Patagonia". Nada de look SaaS genérico.
- **Color**: fríos y desaturados (verdes fríos, celestes, azules, tierras, chocolate, bordó frío). Prohibido usar los neutros puros de Tailwind (`zinc-*`, `slate-*` sin modificar). Configurar neutros con tinte propio (3-5% de verde/tierra mezclado).
- **Layout**: paneles integrados continuos separados por líneas finas (`divide-y`/`border-b` de baja opacidad) en vez de cards flotantes con `shadow-sm`/`rounded-xl`. Aplica tanto a la grilla de series como a la de obras.
- **Tipografía**: serif con tracking amplio para títulos/series; una tipografía gestual/cursiva para firma y textos poéticos (manifiesto, microrrelatos). `tabular-nums` obligatorio en toda cifra (años, medidas en cm, tamaños de archivo en el admin).
- **Iconografía**: nada de Lucide por defecto sin criterio — íconos/símbolos propios y sutiles, coherentes con la fascinación de Vero por la simbología (va a enviar referencias propias).

### 6.1 Layouts editoriales adaptativos (no "mobile-first estirado" ni "desktop-first amontonado")

El sitio público tiene dos audiencias con requisitos opuestos, ambas críticas de negocio:

- **Mobile**: la entrada real. Vero va a poner el link en su bio de Instagram — la mayoría de los seguidores, artistas y contactos abren el sitio desde el navegador in-app de Instagram, en el celular. Si la experiencia ahí es mala, se van en segundos.
- **Desktop**: la pantalla de validación. Un galerista o un jurado de un concurso evalúa la obra en una computadora (probablemente una pantalla de alta resolución) para apreciar el detalle de las pinturas. Si desktop se ve como una app de celular estirada, se pierde el estatus de "artista consagrada" que busca el branding.

**No es un problema de breakpoints, es un problema de qué rol cumple cada elemento en cada tamaño.** La estructura cambia de forma, no solo de escala:

- **Desktop**: patrón de "estructura bifurcada". Columna lateral izquierda, angosta y fija, con navegación + manifiesto/bio; a la derecha, un lienzo amplio donde escrolean las series/obras. Sigue el patrón de paneles integrados (`divide-y`) de § 6, no cards.
- **Mobile**: la columna lateral desaparece. Pasa a un header superior minimalista (con menú desplegable o navegación inferior tipo tabs) y una sola columna vertical, donde cada imagen de obra ocupa el 100% del ancho del dispositivo para que "respire".
- **Tipografía y espaciado fluidos por breakpoint, nunca tamaños estáticos.** Ejemplo concreto para un título de serie: `text-xl tracking-wide` en mobile → `lg:text-4xl lg:tracking-widest` en desktop. Mismo criterio para padding: `p-4` en mobile (maximizar espacio de imagen) → `lg:p-12`/`lg:p-16` en desktop (sensación de "aire" de galería física, no de UI de celular estirada).
- Esto aplica principalmente a `/`, `/series`, `/series/[slug]` y `/biografia` — son las páginas que ve tanto el público de Instagram como un curador.

### 6.2 El admin sí es mobile-first — pero por uso táctil real, no por audiencia

A diferencia del sitio público, el panel `/admin` prioriza mobile porque Vero va a usarlo así en la práctica: sacar una foto a una acuarela recién terminada en el taller y cargarla en el acto desde el celular. `05-GOTCHAS-AND-TIPS.md` § UX Mobile-First ya cubre la base (inputs `text-base`/16px para evitar zoom de iOS, detalle a pantalla completa con `← Volver`) — para este proyecto se extiende a:

- Botones y áreas táctiles del CRUD de Obras dimensionados para pulgar (no el tamaño compacto típico de un admin de escritorio).
- El flujo "nueva obra + foto desde cámara" en `/admin/series/[id]/obras` optimizado como el camino principal, no como un caso secundario del formulario — el input de archivo debe aceptar directamente la cámara del celular (`capture` en el input de tipo file), y el flujo de compresión/upload ya existente (`upload-preview` → `upload`) tiene que sentirse instantáneo en una conexión de datos móvil, no solo en WiFi de escritorio.
- Navegación del panel por tabs simplificada, sin submenús anidados que requieran precisión de mouse.

## 7. Seguridad e Infraestructura

La seguridad usa sesión HMAC + contraseña hasheada con scrypt, rate limiting persistente en login y en `/api/contact`, `requireSession()` en cada handler de `/api/admin/*`, CSP y headers de seguridad. El único endpoint público que escribe en la base sigue siendo `/api/contact`.

## 8. Decisiones tomadas (y por qué)

- **Bio/CV como un único campo de texto (markdown), no entidades separadas por premio/exposición/formación.** Vero es "ultrapráctica" y quiere mantenerlo "medio actualizado siempre" — un textarea es más rápido de editar que un CRUD de entradas tipadas. Si más adelante pide filtrar/ordenar por tipo o año, se puede migrar a tabla estructurada sin romper lo demás.
- **Sin ruta dedicada por obra (`/obras/[id]`).** Las obras se muestran dentro de la página de su serie (con modal/lightbox para el detalle); evita multiplicar páginas de contenido delgado para un catálogo que puede llegar a cientos de piezas.
- **Manifiesto con máximo 2 imágenes como columnas fijas**, no una galería propia — el documento de contexto pide "una o dos imágenes de gran tamaño", no una colección.

## 9. Abierto / a confirmar antes o durante la implementación

- Dominio de producción real (hoy placeholder).
- Proveedor de hosting de producción y dominio definitivo.
- Si `contact_requests.requestType` se simplifica a un valor fijo o se mantiene genérico (ver § 3).
- Si Vero quiere distinguir explícitamente "obra disponible para consulta" en el formulario de contacto (ej. pre-completar el mensaje con el título de la obra al clickear "consultar" desde una obra) — no es parte del MVP pero es una extensión natural y barata sobre el mismo formulario existente.
