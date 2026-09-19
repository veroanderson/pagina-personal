# Portfolio Vero Anderson

Portfolio editorial construido con Next.js 14, React, Tailwind y Supabase.
La base de datos y las imágenes se almacenan en el proyecto Supabase configurado
en las variables de entorno del servidor.

## Desarrollo local

```bash
npm install
node scripts/hash-password.mjs
cp .env.example .env
# completar SUPABASE_SECRET_KEY, ADMIN_PASSWORD_HASH y SESSION_SECRET
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Migraciones de Supabase

Configurar la CLI de Supabase y aplicar las migraciones pendientes:

```bash
supabase db push
```

No ejecutar `supabase db reset` contra el proyecto productivo. El archivo
`supabase/seed.sql` contiene únicamente datos de ejemplo.

## Producción

El proyecto puede ejecutarse en cualquier hosting compatible con Next.js:

```bash
npm ci
npm run build
npm start
```

Configurar en el hosting las mismas variables de `.env.example`. Las variables
que contienen secretos deben quedar únicamente del lado del servidor.

## Comandos útiles

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm start         # servidor de producción
npx tsc --noEmit  # verificación de tipos
```
