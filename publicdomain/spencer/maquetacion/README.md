# Siglo23 — Taller de Maquetación del libro de Herbert Spencer

Ruta esperada: `/publicdomain/spencer/maquetacion/`.

## Estado

Primera versión M01 (5 de noviembre de 2026). Archivos:
- `index.html`: panel de composición de 3 columnas y controles.
- `editor.css`: estilos de interfaz y simulación de páginas a escala mediante unidades CSS mm/pt.
- `editor.js`: cálculo de plan de páginas, mockups, cubierta desplegada, extras, impresión de prueba, exportación/importación de configuración.

El archivo `publicdomain/spencer/index.html` contiene enlaces al taller en la cabecera, la introducción y una sección dedicada.

## Funciones de cálculo y supuestos

- Formatos: A5, 6×9”, 5,5×8,5”, 170×240 mm y personalizado.
- Cuerpo 7,5–18 pt, factor de interlínea 1,05–2, familia local de fuente, márgenes interior/exterior/superior/inferior, sangría y espacio entre párrafos.
- Número de palabras: **90.000 iniciales solo a modo de hipótesis**, editables por el usuario; no es recuento del original, de una traducción ni de la edición propuesta.
- Palabras/página: estimación geométrica según ancho de caja, cuerpo, interlineado y un coeficiente de ocupación .82. No modela correctamente notas a pie, ríos, líneas viudas o huérfanas, imágenes integradas o partición de palabras.
- El usuario puede activar/desactivar partes y asignar páginas a prólogos, índices, notas, láminas, epílogos y extras propios.
- Si una parte se marca «empezar en recto», se inserta un blanco si la siguiente página es par.
- El complemento final hasta múltiplo de cuatro es **un supuesto de planificación**, no una exigencia universal de imprenta. Ajustar a la encuadernación contratada.
- Estimación de lomo: `ceil(total_paginas/2) * calibre_de_hoja_en_mm`. No incluye pegamento, cubierta o tolerancias. Obtener la fórmula definitiva y el papel real de la imprenta.
- Sangrado y guías son indicaciones visuales. No se generan automáticamente archivos PDF/X ni cobertura técnica para KDP.
- «Imprimir prueba / PDF» abre una vista de impresión de la muestra activa. **No** exporta el manuscrito completo paginado y **no** es arte final de producción.

## Persistencia y privacidad

- Diseño, partes y texto de muestra se guardan en localStorage, en el navegador que los edita.
- El usuario puede guardar/importar un plan JSON con opciones y partes.
- Las imágenes cargadas para la cubierta solo existen en la sesión local mediante blob URL; no se suben al repositorio y no se incluyen en el JSON.
- Fuentes de pantalla dependen de la disponibilidad local y pueden sustituirse.

## Derechos y limitaciones

La página usa textos de demostración, **no una traducción autenticada de Spencer**. Antes de publicar, validar el original y su traducción, las ilustraciones, el aparato editorial, la licencia tipográfica, el perfil de color, PDF/X, la paginación final y las especificaciones concretas del proveedor de impresión.

## Publicación

Confirmados cambios en el repositorio GitHub de RNGMarketDriven. **No se ha confirmado que Hostinger o el dominio público hayan recibido automáticamente estos archivos**.


## M02 — Grilla completa y Montserrat (5 de noviembre de 2026)

La pantalla arranca ahora en **Libro completo**, una grilla de miniaturas para **todas las páginas interiores estimadas**, numeradas individualmente. Cada miniatura distingue página en blanco, parte editorial sin texto y contenido real importado.

- Seleccionar cualquier miniatura abre su **pliego** (página par a la izquierda e impar a la derecha); volver a la grilla, ir a una página concreta y navegar por las páginas enfrentadas con flechas o botones.
- Zoom de miniaturas de 64 a 200 px; zoom del pliego controlado por el ajuste principal.
- Debajo del pliego se muestra un **panel de texto no recortado** con las palabras asignadas a cada página y su intervalo aproximado.
- Buscar por número, nombre de sección o **texto importado** en todas las miniaturas.
- Importar textos por cada sección (TXT o Markdown UTF-8), o pegarlos en la interfaz. Cuando se carga el texto principal, la cifra de palabras deja de ser la hipótesis de 90.000 y pasa a ser el recuento real del archivo. La distribución **sigue siendo geométrica aproximada**, no una maquetación tipográfica definitiva.
- El archivo se procesa localmente en el navegador; no se transfiere automáticamente a servidor. El estado, incluidos los textos, intenta guardarse en el localStorage del navegador; si se agota su cuota puede perderse al cerrar sesión. El respaldo JSON **sí puede incluir** el texto importado: tratarlo como un archivo privado.
- Montserrat está disponible para cuerpo y títulos con pesos del **100 al 900**, en redonda y cursiva, mediante la API de Google Fonts; la fuente original está licenciada bajo SIL OFL. Si no hay conexión para cargarla se emplea una sustitución local.
- Los márgenes interiores/exteriores/superiores/inferiores, sangrías, separación de párrafos y sangrado admiten **cualquier número no negativo**, sin máximo artificial. Si se elimina la superficie útil de texto se muestra un diagnóstico y el cálculo principal queda no disponible.
- Estimación de palabras por página apoyada, si el navegador lo permite, en las métricas medidas de la tipografía seleccionada. Sigue sin resolver huérfanas/viudas, notas a pie, imágenes flotantes ni partición final de sílabas.

**Archivos obligatorios de M02:** `index.html`, `editor.css`, `editor.js`, `overview.js`. El manifiesto `version.json` contiene la marca `SIGLO23-SPENCER-MAQUETACION-M02`.

La presencia de estos archivos en GitHub está comprobada; su disponibilidad pública en Hostinger sigue sin confirmarse.

## M03 — Texto completo del original inglés de 1884 (2026-11-05)

Se incorporó el archivo independiente `original-ingles-1884.json` y el cargador `original-loader.js`. La fuente es una transcripción de dominio público del texto de Spencer (1884), localizada en [Vast-As-A-Sea/English-version-of-world-famous-works](https://github.com/Vast-As-A-Sea/English-version-of-world-famous-works/blob/master/The%20Man%20Versus%20the%20State.txt), cotejada estructuralmente con la [edición histórica de Williams & Norgate](https://oll.libertyfund.org/titles/spencer-the-man-versus-the-state-1885-ed). **No se ha hecho cotejo tipográfico/paleográfico íntegro contra facsímil**: antes de editar comercialmente, revisar variantes, erratas y llamadas de nota.

### Recuento del núcleo del libro

| Parte original | Palabras de la transcripción |
|---|---:|
| Preface | 287 |
| The New Toryism | 6.855 |
| The Coming Slavery | 10.639 |
| The Sins of Legislators | 14.038 |
| The Great Political Superstition | 11.977 |
| Postscript | 1.996 |
| **Total** | **45.792** |

El original incluye en sus bloques las referencias y notas que figuran en la fuente, pero no los ensayos añadidos en antologías posteriores. Estos datos son el **recuento textual real de la transcripción**, no una estimación de longitud por género o edición. Los comienzos de ensayos se fuerzan al recto cuando esa opción está activa, y el cálculo de páginas depende del formato y el cuerpo tipográfico elegido. Las páginas de prólogos nuevos, notas editoriales, ilustraciones, atlas, apéndices e índices permanecen **como estimaciones editables**.

Con el estado inicial A5, Georgia 10,5 pt y los márgenes de ejemplo, la prueba calcula aproximadamente **195 páginas del texto de Spencer** y **372 páginas totales**, incluyendo blancos y extras. Cambiar márgenes, tipografía o añadir material altera estas cifras. No afirmar que son la foliación histórica ni la cantidad definitiva de páginas impresas.

El original se importa automáticamente en seis secciones, puede leerse en la grilla de miniaturas, abrirse en pliego y consultarse con texto no recortado bajo cada página. También quedan disponibles la importación posterior de traducciones o variantes en TXT/MD y el control de extras. La fuente conserva párrafos para la lectura, aunque el reparto por páginas sigue siendo aproximado.

**Archivos obligatorios para desplegar M03:** `index.html`, `editor.css`, `editor.js`, `overview.js`, `original-loader.js`, `original-ingles-1884.json`. El manifiesto `version.json` informa la compilación. Los seis archivos deben publicarse en la misma carpeta. La carga del original depende de que `original-ingles-1884.json` responda HTTP 200; no se ha confirmado el despliegue Hostinger.

## M04 — Aperturas tipográficas y mejora de la lectura (2026-11-05)

- Nueva doble página para cada uno de los cuatro ensayos de Spencer: izquierda ornamental con número romano, derecha con título. El original inglés no se modifica.
- Separador análogo para el aparato de notas; la redacción efectiva de notas sigue pendiente.
- Opción de iniciar el texto a la derecha después del pliego, incorporando físicamente un blanco posterior y otros blancos necesarios de enlace.
- Las páginas de apertura, los blancos y el lomo se recalculan. Miniaturas y navegación de «Apertura de capítulo» y «Apertura de notas» apuntan a las páginas reales del plan.
- Cuerpo de lectura Georgia 10,5 pt, interlínea 1,44, menor separación entre párrafos, capitulares en inicio de ensayo, y preset clásico editable (márgenes 24/18/23/22 mm).
- Controles guardados en configuración local y exportación JSON. Las configuraciones antiguas reciben los controles nuevos sin perder textos importados.
- La impresión sigue siendo una **prueba tipográfica**, no un PDF/X ni la paginación final de imprenta. Ajustar partición de párrafos, viudas/huérfanas, notas y licencia tipográfica al cerrar edición.

## M05: índices poblados (2026-11-05)

Los índices ahora contienen **86 semblanzas**, **53 temas** y **56 obras citadas**, obtenidos de los datasets ya presentes en este repositorio. Cinco personajes cuentan con retrato histórico: Jeremy Bentham, Charles Darwin, Thomas Hobbes, Alexis de Tocqueville y Otto von Bismarck. La imagen de cada retrato remite a su ficha en Wikimedia Commons; se requiere verificación de derechos para Argentina y descarga de alta resolución antes de imprimir.

`indices-editoriales.json` se carga con `indices-loader.js` y el medidor `indices-layout.js`: calcula la altura de cada ficha según los parámetros tipográficos activos, evita dividir cada semblanza entre dos páginas y suma el recuento al plan del volumen. Sigue siendo **maquetación en navegador**, no PDF de producción. Todas las referencias de página son provisionales y se actualizarán al cerrar traducción y galeradas. El texto original en inglés queda intacto.

### M05.1 — Huella real visible de los índices

El panel derecho incorpora tres contadores separados y un total. Se calculan desde las entradas que efectivamente caben en cada caja tipográfica del navegador. Los folios de referencia aún son orientativos y la composición final de imprenta puede cambiar estos valores.

## M06 — Volumen abreviado: cuatro imágenes y una doble página bibliográfica (2026-11-05)

Se retiran del índice de contenido y de la paginación: **apartado de notas, cronología y atlas, glosario de términos**. Las configuraciones antiguas se migran al abrirse, sin destruir datos manuscritos importados de otras secciones.

**Fuentes y bibliografía** pasa a una doble página enfrentada (2 páginas, izquierda par y derecha impar) y no admite ampliación accidental desde la grilla. La lista es una selección inicial, sujeta a cotejo.

**Ilustraciones históricas:** son exactamente cuatro piezas registradas en `editorial-assets.js`: caricatura de Spencer de Vanity Fair (1 página), Gillray The tree of liberty (2), Keppler In danger (2) y Keppler Puck's review of the past year (1). Total **6 páginas gráficas** más eventuales blancos necesarios para comenzar los pliegos sobre caras enfrentadas. Las figuras se intercalan por posición editorial, no como un bloque de 16 páginas.

El recuento del lomo incorpora las páginas efectivas de los pliegos. Los enlaces gráficos son referencias de investigación: las copias finales de alta resolución y permisos territoriales siguen pendientes.

### M06 · Vista de las láminas y bibliografía

La grilla y el visor ya presentan las cuatro imágenes reales, con título y procedencia. Los dos pliegos tienen caras izquierda y derecha, y las láminas simples permanecen independientes. Las dos páginas de Fuentes y bibliografía se muestran con un listado inicial repartido físicamente en verso y recto. Los archivos remotos usados para la vista no sustituyen los másteres necesarios para imprimir.

## M07 — textos editoriales completos (2026-11-06)

- Estudio de 3.275 palabras y epílogo de 3.143 palabras incorporados desde dos Markdown íntegros mediante `editorial-loader.js`.
- El estudio precede a la obra original de Spencer y el epílogo sigue a la posdata; la biografía es otra sección y no suma páginas hasta recibir manuscrito.
- Las reservas de 16 y 24 páginas para prólogo y contexto se sustituyen por secciones automáticas vacías; se conservan manuscritos y ajustes locales de proyectos anteriores.
- Paginación web geométrica provisional: los PDF independientes contaron 10+9 páginas en 6×9 y 11+10 en A5. No confundir estas pruebas con los folios finales de imprenta.
- GitHub actualizado no prueba sincronización automática con Hostinger: confirmar `version.json` en el dominio.

## M08 · Prefacios editoriales por capítulo (2026-11-06)

Cuatro reflexiones propias de Siglo23 están integradas en las páginas izquierdas de las aperturas ya existentes; en las derechas siguen los títulos originales de 1884. Cada nota incorpora contexto del argumento, una reserva crítica y una pregunta. Se identifica inequívocamente como texto editorial, sin intervención sobre el inglés de Spencer. Los textos están en `chapter-notes.js`; se pueden editar en el panel con guardado local y respaldo JSON. El estudio introductorio se depuró: sus cuatro análisis específicos se trasladaron a los prefacios abreviados. No se suman páginas a los pliegos ya existentes; sí se recalcula la extensión del estudio. Migración automática solo si el texto local coincide exactamente con M07; se conservan ediciones personales.

**Conservación de material:** Las cuatro reflexiones ampliadas de la versión anterior permanecen en `textos/reflexiones-ampliadas-archivo-M07.md` (archivo no paginado). Los prefacios M08 son versiones breves para las páginas izquierdas; la edición no pierde el desarrollo crítico original.

## M09 — Biografía incorporada a la grilla (2026-11-06)

- Se incorpora el manuscrito integral `textos/biografia-herbert-spencer-2026.md` (**1.564 palabras según el criterio del planificador**, sin metadatos internos) a la sección `biography`, inmediatamente antes de `study` en los preliminares editoriales.
- `editorial-loader.js` carga automáticamente biografía, estudio y epílogo y conserva las modificaciones locales previas. La sección deja de indicar «pendiente» en las configuraciones antiguas sin afectar modificaciones de nombre personalizadas.
- La biografía suma páginas calculadas a partir de sus palabras y de la caja de texto vigente; el botón **Biografía** abre el primer pliego que la contiene y la métrica lateral muestra su extensión estimada.
- No se agregan ilustraciones: se conserva el retrato/caricatura de Herbert Spencer ya registrado entre las cuatro láminas aprobadas. Las referencias biográficas se añaden a la bibliografía existente, que permanece en una sola doble página.
- Se mantienen el estudio, los cuatro prefacios de los ensayos, el epílogo, el texto original y los índices. La paginación es aproximada, no un archivo listo para imprimir.
- La entrega se confirma en GitHub; **no se confirma que Hostinger haya recibido automáticamente los archivos**. Para publicar M09 deben estar juntos `index.html`, `editor.js`, `editorial-loader.js`, `editorial-assets.js`, `version.json` y `textos/biografia-herbert-spencer-2026.md` además de los archivos anteriores de M08.
