# Fase 2: aplicación conectada al único Supabase de producción

La aplicación ya no abre SQLite ni ejecuta `initDb()`. Todas las operaciones
de contenido pasan por `src/lib/db.ts`, que ahora usa el cliente server-only
de `src/lib/supabase-server.ts` y transforma las columnas SQL `snake_case` a las
interfaces camelCase que consumen las páginas y APIs.

## Configuración requerida

En `.env` local o en las variables de Vercel del único proyecto productivo:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<secret-key>
```

La clave secreta solo se usa en Server Components y Route Handlers. No se debe
renombrar a `NEXT_PUBLIC_SUPABASE_SECRET_KEY` ni enviarla al cliente.

Durante esta fase el login todavía usa el guard HMAC existente, por lo que
también hay que conservar `ADMIN_PASSWORD_HASH` y `SESSION_SECRET`. Se retirarán
recién cuando se implemente la fase de Supabase Auth.

## Compatibilidad conservada

- Se mantienen las rutas `/api/admin/*` y sus respuestas JSON.
- Se mantienen los nombres de propiedades TypeScript (`statementText`,
  `seriesId`, `imageUrl`, etc.).
- El borrado sigue siendo lógico (`deleted_at`), no hay `DELETE FROM`.
- Una base vacía funciona: manifiesto y bio se crean con `upsert` al guardarlos
  desde el panel.
- Las páginas públicas siguen siendo dinámicas y consultan Supabase por request.

## Qué queda para la fase siguiente

- Migrar login/sesiones a Supabase Auth y hacer que `admin_users` sea el guard
  de autorización efectivo.
- Sustituir el upload a `public/uploads` por Supabase Storage.
- Mover el rate limiter en memoria al RPC `consume_rate_limit`.
- El despliegue final puede ejecutarse en cualquier hosting compatible con
  Next.js; el contenido y las imágenes ya no dependen del filesystem local.
