# AGENTS.md

## Convención de este repo: un solo archivo de knowledge

Este proyecto usa **`AGENTS.md`** como única fuente de verdad para instrucciones de proyecto, sin importar qué agente/IDE lo lea (Claude Code, Antigravity, opencode, etc.).

- **Editar siempre `AGENTS.md`**, nunca sus alias.
- `CLAUDE.md` es un **symlink** a `AGENTS.md` (`CLAUDE.md -> AGENTS.md`). Si tu agente busca otro nombre de archivo de contexto (p. ej. `.antigravityrules`, `GEMINI.md`), crear un symlink equivalente en vez de duplicar contenido.
- Motivo: evitar que las instrucciones se desincronicen entre agentes al mantenerse en un único lugar.

## Convención de skills: `.skills/` como fuente + symlink en `.claude/skills/`

Las skills (documentación estructurada que un agente carga bajo demanda) viven en **`.skills/<nombre>/SKILL.md`**, con frontmatter `name` + `description`.

- Claude Code únicamente descubre skills en `.claude/skills/<nombre>/SKILL.md`. Por eso cada skill tiene un **symlink** en `.claude/skills/<nombre>` que apunta a `../../.skills/<nombre>`.
- Otros agentes (Antigravity, opencode) que soporten leer reglas/contexto de proyecto deben apuntar directamente a `.skills/`.
- Si la skill es **reutilizable entre proyectos** (tiene su propio repo, ej. `arquitectura-monolitica`), `.skills/<nombre>` es un **git submodule** apuntando a ese repo, no una copia de archivos. Actualizarla es `cd .skills/<nombre> && git pull origin main` — no hay que volver a copiar/pegar contenido a mano. Agregar una así: `git submodule add <url-del-repo> .skills/<nombre>`, luego `ln -s ../../.skills/<nombre> .claude/skills/<nombre>`.
- Si la skill es específica de este proyecto (no tiene repo propio), es una carpeta real dentro de `.skills/`, versionada normal junto al resto del repo.

## ⚠️ IMPORTANTE: MCP `codebase-memory-mcp` — indexar y priorizar

Este proyecto tiene disponible el MCP server **`codebase-memory-mcp`** (configurado globalmente en esta máquina, para Claude Code y Antigravity — no es específico de este repo, pero el uso sí lo es). Indexa el código en un grafo de conocimiento persistente (funciones, clases, llamadas, rutas) y responde consultas estructurales con muchísimos menos tokens que leer archivos uno por uno.

**Al empezar a trabajar en este repo:**
1. Si todavía no está indexado (o el índice quedó desactualizado tras cambios grandes), indexarlo: pedirle al MCP `index_repository` sobre la raíz del proyecto.
2. **Priorizar las tools del grafo (`search_graph`, `query_graph`, `trace_path`, `get_architecture`, `search_code`, etc.) por sobre `Grep`/`Read` archivo por archivo** para preguntas de tipo "¿dónde está definido X?", "¿qué llama a esta función?", "¿qué rutas existen?", impacto de un cambio, o entender la arquitectura general. Es más barato en tokens y más preciso que grepear.
3. `Grep`/`Read` directos siguen siendo la herramienta correcta para leer el contenido exacto de un archivo puntual ya identificado, no para explorar/buscar.

## ⚠️ IMPORTANTE: Skill de Arquitectura Monolítica

Este proyecto cuenta con la skill **`arquitectura-monolitica`** ubicada en `.skills/arquitectura-monolitica/SKILL.md`.

**Es obligatorio cargarla (skil_name: arquitectura-monolitica) y leer su documentación ANTES de:**

- Modificar la infraestructura de hosting o persistencia.
- Trabajar con la base de datos SQLite (`better-sqlite3`), esquemas de tablas o consultas.
- Implementar autenticación, seguridad o endpoints de admin.
- Realizar cualquier despliegue externo o configurar persistencia.

**Reglas que esta skill impone y NO se pueden violar:**

1. Stack actual: Next.js 14 (App Router) + Supabase Database/Storage.
2. Las claves secretas de Supabase solo se usan en código server-side.
3. Nunca `DELETE FROM` — siempre Soft Delete con `deletedAt`.
4. Consultas siempre parametrizadas con placeholders `?`.
5. La persistencia de contenido e imágenes queda en Supabase Database/Storage.

La documentación completa está en `.skills/arquitectura-monolitica/` (`01-OVERVIEW.md` a `05-GOTCHAS-AND-TIPS.md` y la carpeta `template/`). Leer el documento relevante antes de cada tarea.
