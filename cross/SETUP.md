# Studio 0.3 — aplicación portable
Todo el código requerido está en este directorio. El hosting debe servir PHP 8.1+ (PDO SQLite, GD para avatares), HTTPS y Apache/LiteSpeed con AllowOverride suficiente para Require all denied. No requiere Composer ni MariaDB.
## Publicar
Redeploy de main desde hPanel. Abrir /cross/ (index.html redirige a index.php si el servidor elige primero HTML). Todos los vínculos se calculan desde el directorio de instalación; también puede servir en / o en otro subdirectorio.
## Activar cuentas (una sola vez, antes de registrar usuarios)
1. En un navegador sin sesión, abrir /cross/private/probe.txt y /cross/includes/portal.html. Deben responder **403 o 404**, nunca mostrar el contenido. Si se muestran, NO activar SQLite ni almacenar usuarios; configurar el servidor para denegar completamente esos directorios, o usar almacenamiento fuera de la raíz web. La mera presencia de .htaccess no garantiza protección.
2. En el administrador de archivos de Hostinger crear cross/private/config.php (no versionar). Permisos 600 si PHP puede leerlo. Generar una clave aleatoria larga (por ejemplo con un gestor de contraseñas, 48+ caracteres) y guardarla fuera de GitHub. Contenido:
```php
<?php
return [
 'setup_key' => 'REEMPLAZAR_CON_CLAVE_ALEATORIA_LARGA',
 'storage_verified' => true, // SOLO después de probar el bloqueo HTTP
 'allow_registration' => false,
];
```
3. Abrir /cross/cuenta/?v=setup. Crear el primer administrador con la clave privada. La primera visita crea la base SQLite y sus tablas y el directorio de sesiones. No se necesita crear usuarios o una base en hPanel.
4. Acceder a /cross/admin/ con la cuenta administradora. Probar altas manuales, sesiones, fichas, muro, foro, avatares y suspensión/baja usando datos ficticios. Si todo funciona, activar allow_registration en config.php. Los perfiles son privados por defecto, visibles solo para miembros si el titular elige compartirlos.
5. Antes de cada redeploy guardar copia privada de config.php y de la base. Confirmar que el método de despliegue conserva los archivos no versionados. Nunca hacer commit de private ni copiar la base a una carpeta pública.
## Mudar a otro dominio
Copiar cross/ con sus archivos ocultos y private/ por un canal seguro, incluyendo config.php y la base SQLite con las escrituras detenidas; no es necesario copiar sesiones. Conservar setup_key, ya que determina el nombre de la base. Revalidar la protección HTTP y HTTPS en el nuevo hosting antes de habilitar cuentas; si no hay protección, no colocar los datos en la raíz web. Si cambias el subdirectorio, los enlaces se ajustan automáticamente. Las sesiones no se trasladan y el localStorage del arcade/álbum no migra entre orígenes. Por el momento no existe sincronización del juego con la cuenta.
## Alcance
Beta privada sin auditoría de seguridad ni pruebas de ejecución en Hostinger. No hay recuperación por correo, verificación real de edad ni reportes avanzados. No cargar fotografías identificatorias ni datos reales hasta completar pruebas y revisión de privacidad. HumHub y Flarum son alternativas estudiadas, no instaladas.

## Bots de prueba
La primera apertura de la comunidad con almacenamiento activado crea cuatro bots identificados (Luna 180 XP, Violeta 135 XP, Cereza 90 XP, Perla 55 XP) con una publicación inicial de demostración cada uno. No tienen credenciales utilizables. El ABM puede suspenderlos o eliminarlos; no se recrean automáticamente después de una baja. El ranking lee únicamente sus alias y XP de SQLite, además del progreso local del visitante. No simulan actividad de usuarios reales ni publican automáticamente.

## Studio 0.4: CrossQuiz y glosario
El catálogo editorial vive en includes/word-bank.json (35 consignas, 513 grupos de respuestas, 964 formas aceptadas). El glosario vive en includes/glossary.json (95 entradas). Ambos son portables. El desafío selecciona siete consignas por fecha de Buenos Aires, con 30 segundos por respuesta, y conserva el progreso en localStorage. La beta valida en navegador; no es resistente a manipulación ni está conectada a la cuenta/SQLite. Antes de un ranking competitivo, mover consignas, cronómetro, validación y recompensas al servidor. Admin se mantiene fuera de la navbar y accesible en /admin/ solo con permisos.

## Studio 0.5: navegación y diseño
La home contiene CrossQuiz y el logo vuelve a ella; /arcade/ permanece como redirección. Menú: Ranking, Mi álbum, Pluma Libre, Perfiles, Guías, Shopping, Recursos y Minijuegos. Pluma Libre agrupa muro, foro y relatos mediante pestañas internas; las URLs existentes siguen disponibles. El glosario se encuentra en Recursos. Los perfiles visibles a miembros y la propia ficha aparecen como tarjetas. El header muestra créditos locales, recordatorios de desafío/sobre y acceso a cuenta con avatar si hay sesión. Aún no hay notificaciones sociales reales ni créditos sincronizados a la base. Las nueve ilustraciones SVG son originales de esta implementación y viven en assets/art/; no requieren servicios de imágenes externos. Al desplegar, verificar la home, las ocho pestañas, las subpáginas, las rutas antiguas, el saldo local y, con SQLite activo y una cuenta de prueba, el avatar y las tarjetas. No abrir el registro sin pruebas de privacidad y permisos.

## Pluma Libre: ruta de respaldo y evaluación de chat
La portada se renderiza en includes/pluma.php; se puede acceder desde /pluma-libre/index.php y /index.php?seccion=pluma-libre (enlace de navbar). Se usan rutas PHP explícitas para muro, foro y relatos para no depender de DirectoryIndex. Si el muro o foro requieren activación, revisar el almacenamiento privado SQLite y la sesión. Chat evaluado: LuminaChat (https://github.com/Muhammad72tech/LuminaChat-EN, GPL-3.0), ChatX (https://github.com/C3La-NS/ChatX, MIT), PHPSockets (https://github.com/micilini/php-websockets, MIT). No se ha incorporado software de terceros. Preferir PHP/SQLite con polling HTTP en hosting compartido; para integrar código ajeno revisar licencia y seguridad. Usar una sola identidad Studio, autorización de cada lectura y escritura por sala, invitaciones revocables, controles de moderación, protección CSRF, límites y almacenamiento privado. El chat general debe ser de miembros; las salas privadas solo para integrantes autorizados; no prometer cifrado de extremo a extremo. Probar dos cuentas y una tercera no autorizada antes de habilitar usuarios reales.
