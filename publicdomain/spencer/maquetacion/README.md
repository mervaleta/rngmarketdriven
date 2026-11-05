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
