// Pruebas estáticas de integración Siglo23 M10, sin dependencias externas.
import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname||new URL('.',import.meta.url).pathname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const src=read('index.html'),prep=read('preprensa.html'),js=read('preprensa.js');
const version=JSON.parse(read('version.json'));
const book=JSON.parse(read('original-ingles-1884.json'));
const ind=JSON.parse(read('indices-editoriales.json'));
const expected=['original-preface','original-new-toryism','original-coming-slavery','original-sins-legislators','original-great-superstition','original-postscript'];
assert.equal(version.version,'M09');
assert.ok(version.extensions?.['M10-preprensa-beta']);
for (const filename of ['preprensa.html','preprensa.js','preprensa.css','estudio-theme.css','estudio-audit.js','README-PREPRENSA.md']){
 assert.ok(existsSync(resolve(root,filename)),filename+' faltante');
}
assert.ok(src.includes('href="./preprensa.html"'));
assert.ok(src.includes('estudio-audit.js'));
assert.ok(src.includes('estudio-theme.css'));
assert.ok(prep.includes('pagedjs@0.4.3/dist/paged.js'));
assert.ok(prep.includes('src="./preprensa.js?v=1"'));
assert.ok(js.includes('new window.Paged.Previewer()'));
assert.ok(js.includes('await paginator.preview('));
assert.deepEqual(book.chapters.map(c=>c.id),expected);
const total=book.chapters.reduce((sum,c)=>sum+(c.text.match(/\S+/g)||[]).length,0);
assert.equal(total,book.words_total);
assert.ok(total>40000&&total<50000);
for(const [key,qty] of [['index-onomastic',86],['index-analytic',53],['index-works',56]])assert.equal(ind.sections[key].length,qty);
for(const script of ['preprensa.js','estudio-audit.js','editor.js','overview.js'])new Script(read(script),{filename:script});
const assets=read('editorial-assets.js');assert.ok(assets.includes('"figures"'));
assert.ok(read('README-PREPRENSA.md').includes('PDF/X'));
console.log('OK: M09 intacto + M10 enlazado + 6 partes y '+total+' palabras + 3 índices + scripts válidos.');
