# Decisiones de Proyecto — Portfolio Vero Anderson

**Fecha:** 9 de Agosto, 2026  
**Estado:** Confirmadas por el cliente / dirección del proyecto  
**Referencia:** `docs/TECHNICAL-DESIGN.md`, `PROMPT-INICIO-DESARROLLO.md`, `contexto-cliente-vero.md`

---

## 1. Topología de Despliegue

* **Ejecución:** La aplicación se ejecuta como Next.js en un hosting compatible.
* **Persistencia:** Supabase Database y Supabase Storage son la fuente de verdad.
* **Configuración:** Las variables de `.env.example` se cargan como secretos del entorno.

---

## 2. Dominio y DNS

* **Estado del Dominio:** Pendiente de compra/confirmación.
* **Manejo en Código:** El dominio lo administra el proveedor de hosting; la aplicación no necesita una variable propia para funcionar.

---

## 3. Integración Modal de Obra ↔ Formulario de Contacto (Production Ready)

* **Flujo del Usuario:**
  1. Al navegar por `/series/[slug]`, hacer clic en una obra abre el lightbox/modal con la imagen en alta calidad y su microrrelato.
  2. En el modal se incluye la acción destacada: **"Consultar sobre esta obra"**.
  3. Al cliquear, el usuario es redirigido a `/contacto?artwork=<id>`, pre-completando el formulario de contacto con:
     * **Asunto/Tema:** *"Consulta por obra: [Título de la obra]"*
     * **Cuerpo del mensaje pre-armado:** *"Hola Vero, me interesa consultar sobre la pieza '[Título de la obra]' ([Año], [Técnica])."*

---

## 4. Contenido Inicial / Seed de Datos (Batman Art Theme)

Para validar el diseño, tipografía `tabular-nums`, compresión WebP y layouts sin confundir con la obra real de Vero, se utilizará un seed temático explícitamente satírico/ficticio:

* **Serie de Prueba:** *"La Sombra y la Capa: Mitos de Gotham"*
* **Ensayo de la Serie:** Texto poético pretencioso sobre el claroscuro, la vigilia nocturna y la justicia moral.
* **Obras en Seed:**
  1. **"La barra de hierro (Tragedia en la familia)"** — *Técnica:* Óleo y óxido sobre lienzo 120x90cm (2023). *Microrrelato:* Ensayo abstracto sobre la violencia y el duelo de Jason Todd.
  2. **"Dicotomía en Óleo (Harvey Dent)"** — *Técnica:* Mixta sobre tabla de pino 100x70cm (2022). *Microrrelato:* Diálogo poético sobre la dualidad de la justicia y la moneda desfigurada.
  3. **"El Batmóvil en la Noche"** — *Técnica:* Acuarela y tinta sobre papel de algodón 300g 50x70cm (2024). *Microrrelato:* La máquina como extensión del vacío y el horizonte urbano.
* **Imágenes de Prueba:** Imágenes de Batman / cómic para verificar el cargador, compresión WebP con `sharp` y respuesta táctil.

---

## 5. Iconografía y Dirección Estética

* **Iconos y Símbolos:** Creación ad-hoc de divisores y símbolos SVG minimalistas y sobrios (estricto rechazo a Lucide Icons por defecto).
* **Paleta Cromática:** *Editorial Warm Minimal / Frío de la Patagonia* — neutros con matiz verde/azul frío desaturado (`bg-[#0b0f19]`), tipografía serif con tracking amplio y detalles gestuales/cursivos.
