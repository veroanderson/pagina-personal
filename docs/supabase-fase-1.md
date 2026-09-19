# Fase 1: esquema de Supabase

Esta fase deja versionado el contrato de datos para la migración. La aplicación
ya consume este esquema mediante un único proyecto Supabase de producción; no
se crean ni se mantienen proyectos separados de desarrollo y producción.

## Qué se agregó

- `supabase/migrations/202609090001_initial_schema.sql`: tablas, índices,
  restricciones, RLS, `is_admin()`, el RPC atómico de rate limit y el bucket de
  Storage `portfolio-images`.
- `supabase/seed.sql`: datos mínimos opcionales para smoke tests. No debe
  ejecutarse en producción.

Las tablas públicas conservan el borrado lógico mediante `deleted_at`. Los
nombres SQL usan `snake_case`; `src/lib/db.ts` los mapea a las interfaces
camelCase existentes.

## Aplicación manual en el único proyecto de producción

1. Crear o seleccionar el proyecto Supabase que se usará en producción y
   guardar el `project ref`.
2. Instalar/login del Supabase CLI si todavía no está disponible.
3. Si el CLI todavía no creó `supabase/config.toml`, ejecutar una sola vez:

   ```text
   supabase init
   ```

   Esto solo crea la configuración del proyecto; no levanta contenedores.
4. Enlazar el repositorio con ese único proyecto:

   ```text
   supabase link --project-ref <PROJECT_REF>
   ```

5. Aplicar únicamente las migraciones:

   ```text
   supabase db push
   ```

6. No ejecutar `supabase start` ni `supabase db reset`: levantan infraestructura
   local basada en contenedores y este proyecto no la utiliza.
7. Crear y confirmar manualmente el usuario admin en **Authentication → Users**
   y luego insertar su UUID en `public.admin_users` desde el SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('<AUTH_USER_UUID>')
   on conflict (user_id) do nothing;
   ```

   Esta allowlist queda preparada para Supabase Auth; el login actual todavía
   valida `ADMIN_PASSWORD_HASH` y `SESSION_SECRET` hasta la fase siguiente.

8. No ejecutar `supabase/seed.sql` en este proyecto si se quiere mantener la
   producción vacía; el contenido real se cargará desde el panel admin.

## Variables de la aplicación

Configurar en el entorno de producción y en Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<server-only-secret-key>
```

La `SUPABASE_SECRET_KEY` no debe ir al navegador, a `NEXT_PUBLIC_*`, al repo ni
a logs. La integración actual usa esa clave solo desde route handlers y server
components.

## Verificaciones de salida

- Las ocho tablas existen y `artworks.series_id` tiene FK a `series.id`.
- Un anónimo puede leer solo manifiesto, bio, series activas y obras de series
  activas; no puede leer contactos, settings, admins ni rate limits.
- El usuario admin puede leer/escribir contenido y Storage.
- `select public.consume_rate_limit('contact', 'smoke-test', 60, 2)` devuelve
  `true`, `true`, `false` en tres llamadas consecutivas.
- Las páginas públicas y rutas API responden usando Supabase sin requerir
  `DATABASE_PATH` ni SQLite.
