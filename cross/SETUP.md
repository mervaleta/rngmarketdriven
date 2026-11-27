# Studio 0.2 — configuración de la comunidad
No almacenar credenciales ni datos de miembros en este repositorio público.
1. Crear una base MariaDB/MySQL y un usuario exclusivo para Studio. Habilitar PHP 8.1+, PDO MySQL y GD.
2. En Hostinger crear studio-config.php **fuera de public_html**, en su directorio padre. Permisos restrictivos (600 si PHP puede leerlo). No subirlo a GitHub.
3. Contenido de ejemplo; reemplazar los valores dentro de Hostinger:
```php
<?php
return [
 'dsn' => 'mysql:host=localhost;dbname=BASE_STUDIO;charset=utf8mb4',
 'db_user' => 'USUARIO_STUDIO',
 'db_password' => 'CONTRASEÑA_PRIVADA',
 'setup_key' => 'CLAVE_ALEATORIA_DE_AL_MENOS_32_CARACTERES',
 'allow_registration' => false,
];
```
4. Redeploy de main. Ir a https://rngmarketdriven.com/cross/community.php?v=setup y crear la administración con la clave privada. El registro solo se abre cuando existe administrador y allow_registration es true. No compartir las claves en el chat.
5. Panel: /cross/community.php?v=admin. Probar registro, perfil, privacidad, permisos, suspensión, eliminación y avatar con datos ficticios antes de habilitar acceso a terceros.
## Alcance
Beta cerrada, no auditada para producción. Juegos y álbum local; todavía no se vinculan a la cuenta. No hay recuperación de contraseña por correo, verificación de edad, denuncias ni moderación avanzada. El foro es propio y básico. Los perfiles visibles solo se muestran a miembros, y son privados por defecto. Los avatares se reescalan a JPEG 256x256 y quedan en la base; no se guardan como archivos públicos.
## Reutilización
Evaluar HumHub (https://github.com/humhub/humhub) como base social, Flarum (https://github.com/flarum/flarum) como alternativa de foro. No instalados; separar base de datos, comprobar requisitos/licencias y definir identidad única antes de migrar. No tocar el portal principal.
