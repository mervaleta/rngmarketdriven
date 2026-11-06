# Spencer · Sistema de cuatro índices editoriales

**Estado:** prototipo navegable y datasets preliminares en GitHub. Publicación en Hostinger no confirmada.

## Objetivo
La edición Siglo23 de *The Man versus the State* (1884) contará con cuatro índices **separados**, que podrán mantenerse en el libro físico o como herramientas digitales, según la evaluación editorial final.

| Índice | Ruta | Entradas localizadas | Revisión necesaria |
|---|---|---:|---|
| Onomástico | `indice-onomastico/` | 86 personas, 149 menciones | Identidades abreviadas, mini biografías, variantes de nombres |
| Toponímico | `indice-toponimico/` | 54 lugares, 126 concordancias | Separar referencias geográficas de títulos, domicilios y gentilicios |
| Analítico | `indice-analitico/` | 38 conceptos, 941 concordancias | Curaduría semántica, sin confundir mera palabra encontrada con tema desarrollado |
| Autores y obras citadas | `indice-obras/` | 35 fuentes, 47 concordancias | Cotejar títulos, autoría, edición, año, notas abreviadas e `Ibid.` |

## Método y datos
Los índices trabajan sobre `maquetacion/original-ingles-1884.json`. Cada ficha guarda el identificador del ensayo y la posición por palabras de la concordancia. No se graban folios fijos. El navegador recupera el plan `siglo23-spencer-active-plan-v1` guardado desde la Maquetación y calcula de manera aproximada el folio de la referencia. Sin un plan válido no se deben mostrar páginas inventadas; se indica el ensayo.

Los índices contienen formularios de búsqueda, filtros por tipo o ensayo, entradas desplegables, exportación CSV e impresión de consulta. La Maquetación reserva cuatro secciones independientes y **ajustables** (referencia inicial: onomástico 16 páginas, toponímico 8, analítico 14 y obras 12).

## Criterios de edición futura
- **Onomástico:** relevante para la lectura crítica, especialmente para identificar a Bentham, Hobbes, Jevons, Bismarck y los viajeros citados. Distinguir personas homónimas.
- **Toponímico:** valor documental más acotado; puede ser más útil en el archivo digital, particularmente para rastrear comparaciones internacionales y referencias a fuentes etnográficas. Revisar nombres coloniales y sesgos de la época.
- **Analítico:** probablemente el más valioso para la consulta por temas; se debe depurar antes de imprimir (libertad, soberanía, legislación, socialismo, propiedad, leyes de pobres, vivienda, etc.).
- **Autores y obras citadas:** facilita seguir las pruebas históricas y reconstruir la biblioteca intelectual del libro. Completar fuentes de notas originales, información bibliográfica e identidades.

## Pendientes críticos
1. Cotejar los nombres y fuentes con facsímiles originales de 1884/1885.
2. Revisar manualmente cada concordancia, eliminar falsos positivos y señalar las referencias bibliográficas indirectas.
3. Añadir menciones procedentes del prólogo, epílogo, ilustraciones y notas editoriales que se redacten para la edición Siglo23.
4. Al cerrar la traducción y las galeradas, reconstruir índices en español y comprobar **páginas reales**, no solo los folios geométricos calculados.
5. Verificar despliegue de las rutas en Hostinger. Modificar archivos en GitHub no demuestra publicación pública.

**Versión del proyecto:** M04. Marcador `SIGLO23-SPENCER-MAQUETACION-M04`.
