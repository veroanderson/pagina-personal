# Definition of Done — Portfolio Vero Anderson (MVP)

Checklist de aceptación del MVP descripto en `TECHNICAL-DESIGN.md`. Cada ítem tiene que poder verificarse concretamente (no "funciona bien", sino algo comprobable). Referencias a `.skills/arquitectura-monolitica/` para el detalle de cómo cumplir cada regla.

## Datos

- [ ] `db.ts` reemplaza el esquema de ejemplo (`profile`/`experience`/`tech_stack`) por `manifesto`, `series`, `artworks`, `bio`, tal como están definidas en `TECHNICAL-DESIGN.md` § 3.
- [ ] `contact_requests` y `settings` se mantienen sin cambios de esquema respecto al template.
- [ ] Todas las tablas de contenido (`series`, `artworks`) tienen `deletedAt DATETIME DEFAULT NULL`. Ninguna función usa `DELETE FROM` — todo borrado es `UPDATE ... SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?`.
- [ ] Todo `SELECT` de listado filtra `WHERE deletedAt IS NULL`.
- [ ] Todas las queries usan `db.prepare(...)` con placeholders `?`. Cero concatenación de strings en SQL.
- [ ] `journal_mode = WAL` sigue activo (no se tocó `db.ts` en ese punto).
- [ ] `artworks.seriesId` no permite crear una obra sin serie asociada (`NOT NULL REFERENCES series(id)`).
- [ ] `artworks.availability` solo acepta `disponible` / `coleccion_privada` / `no_disponible` (constraint o validación en el handler).
- [ ] No hay contenido inventado en el seed: si se deja seed de ejemplo, son placeholders genéricos explícitamente marcados como tales, nunca bio/obras reales de Vero inventadas.

## Panel `/admin`

- [ ] Tabs `Manifiesto`, `Series`, `Biografía`, `Contactos` agregadas al array `tabs` de `(panel)/layout.tsx`, junto a la tab `Uploads` ya existente.
- [ ] Toda página nueva del panel vive dentro de `src/app/admin/(panel)/` (nunca fuera del route group).
- [ ] Toda ruta nueva bajo `/api/admin/*` empieza con `requireSession()` como primera línea del handler — sin excepción, sin confiar en el middleware ni en la convención de nombre de carpeta.
- [ ] CRUD de Series: crear, editar, listar (incluye inactivas, con indicador visual), soft-delete. Reordenar por `displayOrder` (aunque sea con inputs numéricos simples, no hace falta drag&drop para el MVP).
- [ ] CRUD de Obras dentro de cada serie: crear, editar, listar, soft-delete. Formulario cubre todos los campos de § 3 del TDD.
- [ ] Subida de imagen de una obra usa `POST /api/admin/upload?entity=artwork&id=<id>` (endpoint genérico existente, sin modificarlo) y la `url` devuelta se guarda con `UPDATE artworks SET imageUrl = ? WHERE id = ?`.
- [ ] Edición del Manifiesto permite reemplazar `imageUrl1`/`imageUrl2` con el mismo endpoint genérico (`entity=manifesto`).
- [ ] Edición de Biografía: un textarea/editor de markdown que persiste `bioText`.
- [ ] Tab Contactos reutiliza el patrón ya existente del template (marcar leído, soft delete) sin reescribirlo desde cero.
- [ ] Medido con un cronómetro informal: cargar una obra nueva completa (crear + imagen + guardar) toma pocos clics/campos, sin pasos redundantes — es el punto de UX que la clienta pidió explícitamente.

## Sitio público

- [ ] `/` renderiza el Manifiesto (texto + imágenes), no un listado de obras.
- [ ] `/series` lista solo series con `isActive = 1` y `deletedAt IS NULL`, ordenadas por `displayOrder`.
- [ ] `/series/[slug]` muestra el ensayo de la serie y sus obras (ordenadas, con año/técnica/medidas en `tabular-nums`, badge de disponibilidad).
- [ ] Click en una obra muestra su detalle completo (imagen grande, microrrelato si existe) sin navegar a una URL nueva (modal/lightbox), según lo decidido en el TDD.
- [ ] `/biografia` renderiza `bioText`.
- [ ] `/contacto` postea a `POST /api/contact` existente; sigue rate-limitado (verificar que no se haya tocado ese límite).
- [ ] Ninguna página pública expone datos con `deletedAt` seteado.

## Diseño (gate obligatorio antes de dar por cerrado el MVP)

- [ ] No aparece ningún `zinc-*`/`slate-*`/`gray-*` de Tailwind sin modificar en el fondo o superficies — neutros con tinte propio configurados en Tailwind config.
- [ ] Ninguna lista de series/obras usa cards flotantes con `shadow-sm`/`rounded-xl` — layout de paneles con `divide-y`/`border-b` de baja opacidad.
- [ ] Títulos de series/obras en serif con tracking amplio; hay al menos un uso de tipografía gestual/cursiva para el manifiesto o la firma.
- [ ] Años, medidas (cm) y cualquier cifra numérica tienen `tabular-nums` aplicado.
- [ ] No hay íconos de Lucide (u otra librería genérica) sin criterio propio — si se usan íconos, están elegidos/adaptados a la simbología del proyecto, no puestos "porque sí" arriba de cada card.
- [ ] Revisión visual manual contra `.skills/trq-design-skill/SKILL.md` antes de considerar el frontend terminado — no alcanza con que compile, tiene que pasar el criterio de la skill de diseño.

### Layouts editoriales adaptativos (público)

- [ ] En desktop (`lg:` y superior), `/`, `/series`, `/series/[slug]` y `/biografia` usan estructura bifurcada: columna lateral izquierda fija con navegación + manifiesto/bio, lienzo amplio a la derecha con el contenido de series/obras.
- [ ] En mobile, la columna lateral no existe como tal — se reemplaza por header superior minimalista (menú desplegable o tabs), contenido en una sola columna, imágenes de obra a 100% de ancho del viewport.
- [ ] Probado (o al menos verificado por code review) que **ningún tamaño de fuente ni padding de estos layouts es estático** — todo título/sección relevante tiene un par de clases mobile/`lg:` distintas (ej. `text-xl lg:text-4xl`, `p-4 lg:p-12`), no un solo valor fijo que se herede en todos los breakpoints.
- [ ] Probado manualmente el sitio público abierto en un viewport angosto simulando el navegador in-app de Instagram (no solo el navegador de escritorio achicado) — sin scroll horizontal, sin elementos cortados.
- [ ] Probado manualmente en un viewport de escritorio ancho (≥1440px) que el layout no se ve como una versión estirada del mobile — hay uso deliberado del espacio horizontal (columna lateral + lienzo), no una sola columna centrada con márgenes gigantes.

### Admin táctil (mobile-first real)

- [ ] Todo `<input>`/`<textarea>` del admin mantiene fuente ≥16px (`text-base`), como ya exige `05-GOTCHAS-AND-TIPS.md` para evitar zoom de iOS Safari.
- [ ] El formulario de nueva obra en `/admin/series/[id]/obras` tiene botones y campos dimensionados para uso con el pulgar (no la densidad compacta típica de un admin de escritorio).
- [ ] El input de imagen del formulario de obra permite disparar la cámara del celular directamente (atributo `capture` en el `<input type="file">`), no solo elegir de galería.
- [ ] Probado manualmente el flujo completo "sacar foto → preview de compresión → guardar obra" en un viewport mobile — sin pasos que solo funcionen cómodos con mouse.
- [ ] Navegación del panel admin sigue siendo tabs simples, sin submenús anidados que requieran precisión de puntero.

## Seguridad e infraestructura (heredado, verificar que no se rompió nada)

- [ ] Login de admin sigue usando `ADMIN_PASSWORD_HASH` (scrypt) + `SESSION_SECRET` (HMAC), sin volver a un valor fijo ni a texto plano.
- [ ] Rate limiting de `/api/auth/login` y `/api/contact` intacto.
- [ ] Las variables secretas de Supabase solo se exponen al runtime server-side.
- [ ] `.env` real (con secretos) no está commiteado; `.env.example` refleja cualquier variable nueva que se haya agregado.
- [ ] Las imágenes se guardan y se pueden leer desde el bucket de Supabase Storage.

## Deploy

- [ ] `npm run build` y `npm start` levantan el sitio en un entorno nuevo con las variables configuradas.
- [ ] Las migraciones pendientes de Supabase fueron aplicadas y verificadas.

## Explícitamente fuera del Definition of Done (no bloquean el cierre del MVP)

- Cualquier integración con Alma de Cuadra / Tienda Nube.
- Checkout, pagos, carrito o gestión de stock.
- Más de un usuario admin.
- Notificaciones por email del formulario de contacto (los mensajes se leen desde `/admin`).
- Estructurar la Biografía como entradas tipadas (premio/exposición/formación) en vez de texto único — ver § 8 del TDD.
