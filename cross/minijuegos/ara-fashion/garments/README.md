# Prendas de Ara Fashion Lab

El catálogo admite recursos MakeHuman compatibles con la malla base, preparados con Blender/MPFB. Esta es una vía de incorporación por mantenimiento, no una función de subida automática desde el navegador.

1. Preparar la prenda y exportar sus archivos .mhclo, OBJ, material .mhmat y texturas correspondientes. La prenda debe estar vinculada a la topología MakeHuman utilizada por Ara.
2. Revisar que cada recurso y textura tenga licencia CC0; registrar autor y URL original.
3. Crear una carpeta cross_<nombre> con todos los archivos y agregar en manifest.json un objeto con id, license (CC0-1.0), source y author.
4. El workflow copia la carpeta al directorio de prendas de MakeHuman y regenera el catálogo. Las prendas importadas aparecerán inicialmente como outfits completos, salvo que se clasifiquen por las etiquetas de calzado/sombrero. Las prendas sueltas con capas necesitan una adaptación adicional.
5. Verificar ajuste y animación en cuerpos de distintas proporciones, máscaras de cobertura, y licencias antes de publicar.

Un GLB/FBX/VRM de personaje completo se puede abrir directamente en el editor. Un GLB/FBX/OBJ de una prenda aislada no se convierte automáticamente en prenda adaptable: primero hay que ajustarlo a la malla y preparar el vínculo y pesos.
