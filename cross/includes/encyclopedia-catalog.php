<?php
// The glossary is the only authoritative catalog; directories are filtered views.
function studioEncyclopediaCatalog(): array {
 static $data=null;
 if($data===null){$raw=@file_get_contents(__DIR__.'/glossary.json');$data=is_string($raw)?json_decode($raw,true):null;if(!is_array($data))$data=[];}
 return $data;
}
function studioEncyclopediaIndex(): array {
 static $index=null;
 if($index===null){$index=[];foreach(studioEncyclopediaCatalog() as $r){$index[$r['slug']]=$r;foreach($r['slug_aliases']??[] as $alias)$index[$alias]=$r;}}
 return $index;
}
function studioEncyclopediaEntry(string $slug): ?array {
 return studioEncyclopediaIndex()[$slug]??null;
}
function studioEncyclopediaImageKey(string $slug): string {
 $r=studioEncyclopediaEntry($slug);
 return $r?($r['image_slug']??$r['slug']):$slug;
}
