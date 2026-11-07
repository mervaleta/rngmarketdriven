# Instrucción de despliegue — El gabinete prohibido v1.0.0

**Tarea:** sincronizar SOLO la carpeta `publicdomain/gabinete/` desde la rama `main` del repositorio público `mervaleta/rngmarketdriven` hacia la ruta del sitio `https://rngmarketdriven.com/publicdomain/gabinete/`.

## Estado comprobado

- Fuente GitHub: **146 páginas**, **68 fotografías diferentes** y **41 páginas de contexto**.
- Versión: **1.0.0**; cadena visible `GABINETE · V1.0.0 · ROSA/BORDÓ`.
- Archivo manifest: `SIGLO23-GABINETE-20261107-V1.0.0`.
- **La publicación en Hostinger NO está comprobada**. No se dispone de acceso FTP/SFTP/hPanel en esta sesión. Este documento es una instrucción para un agente de despliegue autorizado, no un registro de publicación realizada.

## Archivos web que deben estar juntos

Copiar desde GitHub `main/publicdomain/gabinete/` a la carpeta pública correspondiente de Hostinger:

1. `index.html` — aplicación, indicador v1.0.0.
2. `editor.css` — estilos, pliegos y advertencias de baja resolución.
3. `editor.js` — editor y banco fotográfico.
4. `libro.json` — **146 páginas y 68 fotografías**, archivo más importante.
5. `version.json` — control de versión y recuentos.
6. `seleccion-erotica-lujo.json` — otras candidatas, mostradas en pestaña de curaduría.

En el expediente interno, no necesario para servir el maquetador, quedan `produccion.json`, `ampliacion-fotografica-2026.json`, `direccion-editorial-lujo.md`, `README.md` y los archivos de estudios y exclusiones.

Si el directorio raíz de este dominio es `public_html/`, la ruta relativa de destino debería ser `public_html/publicdomain/gabinete/`. **Confirmar primero cuál es el document root real en Hostinger**.

## Procedimiento seguro

1. Hacer copia de seguridad de los archivos existentes en el directorio objetivo.
2. Subir y sustituir **solo** los seis archivos anteriores de `publicdomain/gabinete/`. No desplegar la raíz entera del repositorio sobre `public_html`; no borrar archivos de Spencer, del catálogo de dominio público ni del resto del sitio.
3. Publicar `editor.css` y `editor.js` antes de actualizar `index.html`; reemplazar `libro.json` y `version.json` en la misma operación si es posible.
4. Abrir https://rngmarketdriven.com/publicdomain/gabinete/version.json y comprobar `"version":"1.0.0"`, `"expectedPages":146`, `"expectedImages":68`.
5. Abrir https://rngmarketdriven.com/publicdomain/gabinete/index.html con recarga forzada. Verificar cabecera `GABINETE · V1.0.0`, resumen **146 páginas / 68 fotografías**, tapadera a la derecha sin hoja a la izquierda y capítulos en impar.
6. Comprobar algunas miniaturas y las láminas nuevas en la vista de pliegos. Las nuevas imágenes están enlazadas desde Wikimedia Commons; algunas URLs o masters pueden fallar y necesitan revisión individual. No afirmar que todas cargan sin hacerlo visualmente.
7. Si el sitio continúa mostrando 0.9.0, comprobar caché de Hostinger/CDN y que se está sirviendo el mismo document root. El HTML usa `editor.css?v=1.0.0` y `editor.js?v=1.0.0` para evitar caché de archivos antiguos.

## Advertencia de producción

El fotolibro sigue siendo **maqueta de investigación**, no prueba comercial ni arte final. Dieciséis de las 46 nuevas fotografías están señaladas como **baja resolución**, y las restantes requieren cotejar derechos, procedencia, modelos adultos y archivos maestros. El PDF de imprenta solo se realizará tras aprobación de curaduría y preprensa.

No colocar credenciales, tokens, contraseñas ni rutas privadas en este repositorio público.
