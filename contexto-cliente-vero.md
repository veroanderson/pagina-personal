# Contexto de Negocio y Dirección Creativa: Vero Anderson

Este documento recopila el análisis psicológico, las necesidades estéticas, el dominio de negocio y las directrices técnicas indispensables para el desarrollo de la web personal de la artista **Vero Anderson** [6, 43]. Está diseñado como fuente de verdad y contexto de inicialización para tu agente de programación.

---

## 🧠 1. Análisis Psicológico de la Cliente

### "Una lucha de artista... yo con yo" [2]
Vero Anderson experimenta una tensión interna profunda —muy común en creadores de alto nivel— entre **el arte por el arte (su obra personal y conceptual) y el arte como medio de subsistencia (la venta comercial de su obra)** [2, 6, 21]. 

*   **El Portafolio Personal (Puro Placer):** Representa su consagración intelectual y visual. Es su refugio no comercial [6, 26]. Aquí no quiere "vender"; quiere ser validada por galeristas, curadores y jurados de convocatorias artísticas [6].
*   **Alma de Cuadra (El motor comercial):** Es el canal que "alimenta de comer dinero" [21]. Consiste en la venta rápida de formatos pequeños en papel con marcos estándar [4]. Su meta aquí es vender al exterior utilizando publicidad paga bien segmentada [26].

### Perfil de Comportamiento y Expectativas
1.  **Ojo estético hiperentrenado:** Como destaca Flor (directora de la agencia Detallo), *"ella sabe perfectamente lo que es lindo y lo que es feo"* [57]. No aceptará plantillas SaaS predecibles, interfaces grises genéricas ni recursos visuales perezosos [57, 141]. El diseño debe estar a la altura de su propia sensibilidad artística [57].
2.  **Ultrapráctica y decidida:** Vero se define como *"muy práctica"* [42]. No le gusta dar vueltas ni perderse en reuniones eternas; su flujo de aprobación es inmediato: *"lo veo, me gusta o no me gusta"* [42]. El agente debe presentar propuestas visuales cohesivas y refinadas desde el primer intento [42].
3.  **Obsesiva con la calidad y el registro:** Está *"obsesionada con las fotos que va a poner"* [50]. Como trabaja mucho en formato papel, tiene "kilos de cosas" acumuladas por digitalizar y catalogar [51]. El CRUD del administrador debe ser sumamente ágil y rápido para no entorpecer su carga de trabajo [42, 51].

---

## 🎨 2. Dirección Creativa y Estética (Break "Shadcn Syndrome")

Para evitar interfaces genéricas que parezcan vender zapatillas (el look "SaaS" plano de grises neutros y tarjetas flotantes con sombras), el diseño debe alinearse con la siguiente dirección creativa [3, 141, 144]:

### Ancla Creativa
> **"Editorial Warm Minimal / Editorial Mono se encuentra con la contemplación fría y desaturada de la Patagonia"** [43, 47, 49, 143, 162].

Esta ancla rinde homenaje a su práctica artística, la cual incluye activamente **la caminata, la observación botánica, el horizonte y el espacio abierto** [53, 54].

### Directrices de UI & UX
*   **Gama Cromática (Cold & Desaturated):** Vero rechaza los colores cálidos y vibrantes [48, 49]. Su paleta consiste en **colores fríos y desaturados que no vibren**: verdes fríos, celestes, azules, tierras, chocolate y toques de bordó frío [48, 49].
    *   *Regla de código:* Queda estrictamente prohibido usar grises neutros puros de Tailwind (`zinc-950`, `slate-50`, etc.) [150]. Se deben configurar **neutros con matiz (tinted neutrals)** mezclando un 3% a 5% de sus verdes o tierras fríos en el fondo (`bg-[#0b0f19]` o similar), simulando papel de lino o algodón artístico [49, 159].
*   **Layout de Galería (Divider Grid):** No usar tarjetas flotantes con sombras redondeadas (`rounded-xl border bg-card p-6 shadow-sm`) [144, 156]. Toda la obra debe presentarse sobre paneles integrados continuos separados por líneas finas y tenues (`divide-y` o `border-b` con baja opacidad), simulando la sobriedad y el espacio de una galería de arte real [156].
*   **Tipografía y Gesto:**
    *   **Títulos/Series:** Usar una tipografía limpia y elegante con Serif, aplicando un espaciado amplio (*tracking wide*) [48].
    *   **Acentos y Manifiesto:** Introducir una tipografía de estilo **gestual, cursiva, abierta y suelta** para destacar su firma de marca y textos poéticos [9, 48].
    *   **Metadatos:** Activar obligatoriamente **`tabular-nums`** en cualquier visualización numérica (fechas de cuadros, dimensiones en cm, peso de subidas en el admin) para evitar saltos visuales [106, 157].
*   **Simbología:** Vero tiene fascinación por los símbolos y enviará referencias [50]. Integrar elementos iconográficos sutiles y misteriosos en lugar de íconos de biblioteca genéricos (como Lucide por defecto arriba de cada elemento) [50, 152].

---

## 🧭 3. Dominio de Negocio y Modelo de Datos (SQLite)

El dominio del portafolio web dinámico se divide en cuatro conceptos principales que el agente de programación debe modelar en la base de datos local SQLite [10, 58, 86]:

```
+-------------------------------------------------------------+
|                        VERO ANDERSON                        |
|                                                             |
|  [Manifiesto (Artist Statement)]                             |
|                                                             |
|  +-------------------------------------------------------+  |
|  | Series (1:N)                                          |  |
|  | - Ej: "Botánica de Campo" (Ensayo de Serie)            |  |
|  |                                                       |  |
|  |   +-----------------------------------------------+   |  |
|  |   | Obras (Múltiples imágenes)                    |   |  |
|  |   | - Título, Año, Técnica, Soporte, Medidas      |   |  |
|  |   | - Microrrelato / Diario de proceso (Opcional) |   |  |
|  |   +-----------------------------------------------+   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [Biografía / CV]  ----->  [Contacto / Formulario]          |
+-------------------------------------------------------------+
```

### 1. El Manifiesto (Artist Statement)
La página de bienvenida. No es un catálogo de productos; es una inmersión conceptual [5].
*   **Atributos:** Texto largo (soporte para Markdown/texto enriquecido) que detalla su conexión con la tierra, el caminar y la botánica [9, 53, 54].
*   **Visual:** Acompañado de una o dos imágenes de gran tamaño (detalles de pinceladas o partes de obras) que transmitan textura [9].

### 2. Series (Colecciones Temáticas)
La obra de Vero se agrupa en conjuntos conceptuales firmes (series de acuarelas, óleos específicos o bitácoras de viaje) [10, 53].
*   **Atributos:** Título, orden de visualización, estado activo, `deletedAt` (Soft Delete) [10, 89].
*   **Ensayo de Serie:** Un campo de texto descriptivo opcional para que Vero introduzca el marco teórico, reflexiones de su caminata o el diario de viaje asociado a ese conjunto de pinturas [11, 12, 53].
*   **Navegación Dinámica:** El menú de series (alojado dinámicamente en el sidebar o layout) debe estar preparado mediante scroll infinito/sutil para soportar desde 6 hasta 60 series sin romper la UI de la aplicación [10, 62, 63].

### 3. Obras (Piezas Individuales)
Cada obra pertenece obligatoriamente a una serie [10].
*   **Atributos Obligatorios:**
    *   Título (ej. "Contemplación de Campo I" o "Sin título") [10].
    *   Año de creación [9].
    *   Técnica y Soporte (ej. *"Acuarela sobre papel de algodón 300g"*, *"Óleo sobre lienzo"*) [51, 53].
    *   Dimensiones (alto x ancho en cm, ej: 30 x 40 cm) [4].
    *   Estado de Disponibilidad (ej: *Disponible*, *Colección Privada*, *No disponible*) [6].
    *   URL de imagen optimizada (procesada en disco) [118].
*   **Microrrelato / Nota de Obra (Opcional):** Un campo de texto breve e individual para añadir contexto íntimo o poesía de proceso a un cuadro específico [12, 65].
*   **Regla de Negocio Crítica:** Queda estrictamente prohibido realizar eliminaciones físicas (`DELETE FROM`) de obras o series [89]. Si Vero borra una obra por error desde el panel, el sistema debe aplicar **Soft Delete** seteando el campo `deletedAt = CURRENT_TIMESTAMP`, permitiendo a la agencia recuperar el registro si es necesario [89, 103].

### 4. Biografía / CV
Sección dinámica donde se acumula su trayectoria, premios, exposiciones y formaciones [9].
*   Debe permitir una edición limpia desde el panel `/admin` para mantenerse *"medio actualizado siempre"* [9].

---

## 🛠️ 4. Directrices de Arquitectura Monolítica para el Programador

Para garantizar que el despliegue sea simple y robusto, el agente debe aplicar las siguientes reglas arquitectónicas del proyecto:

1.  **SQLite WAL local:** Utilizar la librería `better-sqlite3` con modo WAL habilitado para lecturas síncronas instantáneas en el servidor SSD [86, 88].
2.  **Seguridad HMAC en Admin:** Prohibido usar tokens estáticos [130]. Las sesiones del panel `/admin` se firman con HMAC-SHA256 utilizando una clave `SESSION_SECRET` única por despliegue, combinada con expiración embebida y rate limiting en el login [97, 98].
3.  **Compresión de Imágenes Sharp (WebP):**
    *   Dado que Vero subirá grandes cantidades de bocetos e imágenes de alta definición, el backend debe integrar `sharp` [50, 51, 116].
    *   El endpoint real `POST /api/admin/upload` debe limitar el archivo original a **5MB**, convertir automáticamente a **WebP**, aplicar un ancho máximo de **2000px** y guardar la imagen optimizada en Supabase Storage [118].
4.  **Panel de Control "Uploads" en `/admin`:**
    *   Crear una vista dentro del administrador que lea el espacio de disco restante usando comandos del sistema (`df -k`) [115].
    *   Incluir un slider interactivo de calidad (40-95%) guardado en la base de datos [115].
    *   Proveer un área de *drag & drop* que use un endpoint de vista previa (`POST /api/admin/upload-preview`) para que Vero pueda experimentar con una imagen pesada y ver en tiempo real el tamaño original frente al tamaño comprimido WebP antes de proceder a la carga real en su portafolio [115, 118].
5.  **Persistencia administrada:** La base de datos y las imágenes deben persistir en Supabase Database/Storage, sin depender del filesystem local del proceso.
