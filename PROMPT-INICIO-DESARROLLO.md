# Prompt: iniciar desarrollo — Portfolio Vero Anderson

Vas a implementar el MVP del portfolio web de la artista Vero Anderson en este repo. Antes de escribir una línea de código, leé en este orden:

1. `AGENTS.md` — convenciones del repo (un solo archivo de knowledge, skills instaladas como git submodules en `.skills/` con symlink en `.claude/skills/`).
2. `.skills/arquitectura-monolitica/SKILL.md` completo. Desde ahí, `04-SECURITY-PATTERNS.md` antes de tocar auth/uploads/cualquier endpoint público, y `07-ADMIN-PANEL-AND-UPLOADS.md` antes de tocar el panel admin.
3. `.skills/trq-design-skill/SKILL.md` completo, antes de escribir cualquier componente visual.
4. `docs/TECHNICAL-DESIGN.md` — qué se construye y cómo: modelo de datos, rutas públicas, tabs del admin, dirección de diseño aplicada a este proyecto, decisiones ya tomadas (y por qué), preguntas abiertas.
5. `docs/DEFINITION-OF-DONE.md` — checklist de aceptación del MVP. El trabajo no está terminado hasta que cada ítem se pueda tildar de verdad, no "debería andar".
6. `contexto-cliente-vero.md` — quién es la clienta y por qué se tomaron las decisiones de diseño/alcance. Usalo para resolver zonas grises que el TDD no cubra explícitamente.

## Reglas que no se negocian

- Las Reglas de Oro de `SKILL.md` (stack fijo, sin servicios en la nube pagos, soft delete siempre — nunca `DELETE FROM`, queries parametrizadas con `?`, sesión de admin firmada con HMAC + contraseña hasheada con scrypt, sin secretos con default, `requireSession()` como primera línea de cada handler bajo `/api/admin/*`).
- No inventes contenido real de Vero (bio, textos del manifiesto, obras). Placeholders genéricos y explícitos hasta que ella cargue contenido real desde `/admin`.
- No toques nada relacionado a "Alma de Cuadra" / Tienda Nube — está fuera de alcance de este proyecto, ver `docs/TECHNICAL-DESIGN.md` § 1.
- No modifiques los endpoints ya construidos por la skill (`/api/admin/upload`, `/api/admin/upload-preview`, `/api/admin/upload-settings`, `/api/auth/login`, `/api/auth/logout`, `/api/contact`) ni la tab `Uploads` del admin — son genéricos, ya cumplen los patrones de seguridad de la skill, y las tabs de dominio nuevas solo los consumen.
- Si algo del TDD queda ambiguo o falta un dato real, preguntá antes de asumir. No hay apuro que justifique inventar.

## Orden de trabajo sugerido

1. Bootstrap del proyecto Next.js y configuración de las variables de Supabase a partir de `.env.example`.
2. Generar `.env` local: `ADMIN_PASSWORD_HASH` con `node scripts/hash-password.mjs`, `SESSION_SECRET` con `openssl rand -hex 32`.
3. Reemplazar el esquema de ejemplo de `src/lib/db.ts` por el definido en `docs/TECHNICAL-DESIGN.md` § 3 (`manifesto`, `series`, `artworks`, `bio`), conservando `contact_requests` y `settings` tal cual están.
4. Sumar las tabs de dominio al panel admin (`Manifiesto`, `Series`, obras por serie, `Biografía`, `Contactos`) sobre el shell de tabs ya existente en `(panel)/layout.tsx` — `docs/TECHNICAL-DESIGN.md` § 5.
5. Construir las páginas públicas (`/`, `/series`, `/series/[slug]`, `/biografia`, `/contacto`) — `docs/TECHNICAL-DESIGN.md` § 4, aplicando la dirección de diseño y los layouts editoriales adaptativos de § 6 (estructura bifurcada en desktop, columna única en mobile, tipografía/espaciado fluidos, nada de tamaños estáticos).
6. Repasar `docs/DEFINITION-OF-DONE.md` ítem por ítem y tildar solo lo verificado.
7. Para un deploy real, configurar las variables de entorno del proveedor elegido y ejecutar `npm run build` antes de publicar.

## Al terminar

Repasá `docs/DEFINITION-OF-DONE.md` de punta a punta, sección por sección. Si algún ítem no se puede tildar honestamente, decilo explícitamente en vez de darlo por hecho.
