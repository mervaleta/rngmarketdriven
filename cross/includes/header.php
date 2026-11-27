<?php
function studioBase(): string {
    $script = str_replace('\\','/', (string)($_SERVER['SCRIPT_NAME'] ?? '/index.php'));
    $dir = rtrim(dirname($script), '/');
    if (defined('STUDIO_SECTION_ENTRY') && STUDIO_SECTION_ENTRY) $dir = rtrim(dirname($dir ?: '/'), '/');
    return ($dir === '.' ? '' : $dir) . '/';
}
function studioEsc($x): string { return htmlspecialchars((string)$x, ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
function studioHeader(string $active='', string $extra=''): string {
    $base=studioBase();
    $tabs=['inicio'=>['','Inicio'],'arcade'=>['arcade/','Desafío diario'],'album'=>['album/','Mi álbum'],'ranking'=>['ranking/','Ranking'],'muro'=>['muro/','Muro'],'foro'=>['foro/','Foro'],'perfiles'=>['perfiles/','Perfiles'],'shopping'=>['shopping/','Shopping'],'guias'=>['guias/','Guías'],'glosario'=>['glosario/','Glosario cross'],'recursos'=>['recursos/','Recursos'],'minijuegos'=>['minijuegos/','Minijuegos'],'relatos'=>['relatos/','Relatos'],'cuenta'=>['cuenta/','Mi cuenta']];
    $out='<header class="studio-header"><div class="studio-top"><a class="studio-brand" href="'.studioEsc($base).'">studio<span>✦</span></a><span class="studio-version">PREVIEW 0.4</span><div class="studio-extra">'.$extra.'</div></div><nav class="studio-nav" aria-label="Navegación principal">';
    foreach($tabs as $key=>$item) $out.='<a href="'.studioEsc($base.$item[0]).'"'.($active===$key?' aria-current="page"':'').'>'.studioEsc($item[1]).'</a>';
    return $out.'</nav></header>';
}
