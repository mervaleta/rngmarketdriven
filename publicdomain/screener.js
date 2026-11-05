(function screenerAddon() {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = x => String(x == null ? "" : x).replace(/[&<>"']/g, k => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[k]));
  const norm = x => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
  const url = x => { try { const a=new URL(String(x)); return ["https:","http:"].includes(a.protocol)?a.href:""; } catch { return ""; } };
  const storageGet = (k,f) => { try { const x=JSON.parse(localStorage.getItem(k)); return x ?? f; } catch { return f; } };
  const booksKey="sg23-publicdomain-works-v1";
  const au = (()=>{try{return JSON.parse($("#catalogoAutoresEmbedded").textContent).authors||[]}catch{return[]}})();
  let books=[], markets=[], bookToAuthor=new Map(), related=new Map(), page=0, loaded=false;
  const PAGE=32;
  const ctl = id=>$("#"+id);
  const fmt=n=>Number(n||0).toLocaleString("es-AR");
  const val = id=>ctl(id).value;
  const year = s => {const n=String(s||"").match(/\b(?:1[0-9]{3}|20[0-9]{2})\b/);return n?Number(n[0]):null;};
  const option = (value,label)=>`<option value="${esc(value)}">${esc(label)}</option>`;
  function setup() {
    const byName=new Map(),byId=new Map();
    for(const a of au) {
      if(a.id)byId.set(String(a.id),a);
      const name=norm(a.n);
      if(name){ if(!byName.has(name))byName.set(name,[]);byName.get(name).push(a); }
      const bits=String(a.n||"").split(",");
      if(bits.length===2) {
        const rev=norm(bits[1]+" "+bits[0]);
        if(!byName.has(rev))byName.set(rev,[]);
        byName.get(rev).push(a);
      }
    }
    bookToAuthor=new Map();related=new Map();
    for (const b of books) {
      let a=null;
      if(b.bne_id&&byId.has(String(b.bne_id))) a=byId.get(String(b.bne_id));
      else if(!/[\/;&]|\by\b|\(atr|\(trad/i.test(b.author)) {
        const matches=[...new Set(byName.get(norm(b.author))||[])];
        if(matches.length===1) a=matches[0];
      }
      if(a) {
        bookToAuthor.set(b.id,a);
        if(!related.has(a.id)) related.set(a.id,[]);
        related.get(a.id).push(b);
      }
    }
    const opts=(id,items)=>{const el=ctl(id);el.innerHTML=option("","Todos")+items.filter(Boolean).sort((a,b)=>a.localeCompare(b,"es")).map(x=>option(x,x)).join("");};
    opts("scMarket",[...new Set(books.map(b=>b.market))]);
    opts("scLanguage",[...new Set([...books.map(b=>b.language),...au.flatMap(a=>String(a.l||"").split(";").map(v=>v.trim()))])]);
    opts("scGenre",[...new Set(books.map(b=>b.genre))]);
    opts("scThemes",[...new Set(books.flatMap(b=>Array.isArray(b.themes)?b.themes:[]))]);
    opts("scEvidence",[...new Set(books.map(b=>b.indicator_type))]);
    ctl("scOverview").textContent=`${fmt(books.length)} obras · ${fmt(au.length)} autores BNE · ${fmt(new Set(books.map(b=>b.market)).size)} ámbitos/mercados · ${fmt(books.filter(b=>b.edition_status==="Edición editorial documentada").length)} ediciones documentadas · ${fmt(bookToAuthor.size)} cruces nominales propuestos`;
    ctl("scLoadNotice").textContent="Fuentes: catálogo internacional 2026 + registros de autoridad BNE. Los cruces por nombre son propuestas, no confirmaciones de identidad.";
    loaded=true; render();
  }
  function rows() {
    const t=norm(val("scQuery")), universe=val("scUniverse"),market=val("scMarket"),lang=val("scLanguage"),genre=val("scGenre"),priority=val("scPriority"),evidence=val("scEvidence"),quality=val("scQuality"),cross=val("scCross"),theme=val("scThemes"),edition=val("scEdition");
    const d0=Number(val("scDeathFrom"))||0,d1=Number(val("scDeathTo"))||9999,p0=Number(val("scPubFrom"))||0,p1=Number(val("scPubTo"))||9999,cohort=ctl("scCohort").checked;
    const result=[];
    if(universe!=="autores")for(const b of books){
      if(market&&b.market!==market||lang&&b.language!==lang||genre&&b.genre!==genre||priority&&b.priority!==priority||evidence&&b.indicator_type!==evidence||quality&&b.quality!==quality||theme&&!(b.themes||[]).includes(theme)||edition==="documentada"&&b.edition_status!=="Edición editorial documentada"||edition==="pendiente"&&b.edition_status==="Edición editorial documentada")continue;
      const match=bookToAuthor.get(b.id);
      if(cross==="si"&&!match||cross==="no"&&match)continue;
      if(cohort&&!(match&&match.sel))continue;
      const d=year(b.death),p=year(b.published);
      if((d0||d1!==9999)&&(!d||d<d0||d>d1))continue;
      if((p0||p1!==9999)&&(!p||p<p0||p>p1))continue;
      if(t&&!norm([b.title_es,b.title_original,b.author,b.market,b.language,b.genre,b.line,b.evidence,b.indicator_type,b.legal_note,...(b.themes||[]),b.edition_publisher,b.edition_isbn].join(" ")).includes(t))continue;
      result.push({type:"obra",data:b,author:match});
    }
    if(universe!=="obras")for(const a of au){
      if(market||genre||priority||evidence||quality||theme||edition||(p0||p1!==9999))continue;
      if(lang&&!String(a.l||"").split(";").some(z=>z.trim()===lang))continue;
      if(cross==="si"&&!related.has(a.id)||cross==="no"&&related.has(a.id))continue;
      if(cohort&&!a.sel)continue;
      if(a.d&&(a.d<d0||a.d>d1))continue;
      if((d0||d1!==9999)&&!a.d)continue;
      if(t&&!norm([a.n,a.l,a.p,a.loc,a.c,a.d].join(" ")).includes(t))continue;
      result.push({type:"autor",data:a});
    }
    const sort=val("scSort"),q={ "Muy alta":4,"Alta":3,"Media":2,"Baja":1,"A":3,"B":2,"C":1 };
    const name=x=>x.type==="obra"?(x.data.title_es||x.data.title_original):x.data.n;
    result.sort((x,y)=>{
      if(sort==="nombre")return name(x).localeCompare(name(y),"es");
      if(sort==="muerte")return (year(x.type==="obra"?x.data.death:x.data.d)||0)-(year(y.type==="obra"?y.data.death:y.data.d)||0)||name(x).localeCompare(name(y),"es");
      if(sort==="publicacion")return (year(y.type==="obra"?y.data.published:"")||0)-(year(x.type==="obra"?x.data.published:"")||0);
      if(sort==="ediciones")return (y.data.edition_status==="Edición editorial documentada")-(x.data.edition_status==="Edición editorial documentada")||name(x).localeCompare(name(y),"es");
      if(sort==="evidencia")return (q[y.data.quality]||0)-(q[x.data.quality]||0)||name(x).localeCompare(name(y),"es");
      return (x.type==="obra"?0:1)-(y.type==="obra"?0:1)||(q[y.data.priority]||0)-(q[x.data.priority]||0)||(q[y.data.quality]||0)-(q[x.data.quality]||0)||name(x).localeCompare(name(y),"es");
    });
    return result;
  }
  function metric(b) {
    const n=b.indicator_value;
    if(n===null||!Number.isFinite(Number(n)))return `<span class="sc-weak">Sin medida individual</span>`;
    const t=norm(b.indicator_type);
    const v=t.includes("posicion")||t.includes("ranking")||t.includes("billboard")?`puesto ${fmt(n)}`:fmt(n);
    return `<strong class="sc-metric">${esc(v)}</strong><small>${esc(b.indicator_type||"Indicador")}</small>`;
  }
  function bookRow(x) {
    const b=x.data,a=x.author,added=(storageGet(booksKey,[])||[]).some(w=>w.id==="global-"+b.id);
    const ind=metric(b),f=url(b.evidence_url),m=url(b.indicator_url),ed=url(b.edition_url),bn=a?`https://datos.bne.es/persona/${encodeURIComponent(a.id)}.html`:"";
    return `<article class="sc-record"><div class="sc-main"><span class="sc-top">OBRA · ${esc(b.id)} <span class="sc-priority">${esc(b.priority)}</span></span>
      <h3>${esc(b.title_es||b.title_original)}</h3><p class="sc-original">${esc(b.title_original)}</p>
      <p class="sc-sub">${esc(b.author)} · ${esc(b.language)} · ${esc(b.market)}</p>
      <div class="sc-tags"><span>${esc(b.genre||"Género sin precisar")}</span>${b.edition_status==="Edición editorial documentada"?'<span class="sc-linked">Edición actual documentada</span>':""}<span>† ${esc(b.death||"—")}</span><span>${esc(b.published||"s/f")}</span><span>Evidencia ${esc(b.quality||"s/d")}</span>${a?'<span class="sc-linked">Cruce BNE propuesto</span>':""}</div></div>
      <div class="sc-side">${ind}<button type="button" class="mini-button" data-sc-add="${esc(b.id)}" ${added?"disabled":""}>${added?"En mesa":"Añadir a mesa +"}</button></div>
      <details class="sc-details"><summary>Temáticas, ediciones, fuentes y derechos</summary><div><p><b>Temáticas:</b> ${esc((b.themes||[]).join(" · ")||"Pendiente de clasificar")}</p><p><b>Ediciones:</b> ${esc(b.edition_status||"Pendiente de verificar")}${b.edition_publisher?` · ${esc(b.edition_publisher)} · ${esc(b.edition_year||"s/f")} · ${esc(b.edition_language||"idioma sin especificar")} ${b.edition_isbn?` · ISBN ${esc(b.edition_isbn)}`:""}`:""}${ed?` · <a href="${esc(ed)}" target="_blank" rel="noopener noreferrer">Ficha del editor ↗</a>`:""}</p><p>${esc(b.edition_note||"La ausencia de ficha no significa ausencia de ediciones")}</p><p><b>Línea editorial:</b> ${esc(b.line)}</p><p><b>Indicador:</b> ${esc(b.indicator_type||"No disponible")} · ${esc(b.indicator_period||"sin ventana documentada")}</p><p><b>Evidencia:</b> ${esc(b.evidence||"No consignada")}</p><p><b>Estado jurídico preliminar:</b> ${esc(b.legal_note||"Pendiente de verificación")} · <b>NO autoriza publicar</b>.</p>
      ${a?`<p><b>Autoridad sugerida:</b> ${esc(a.n)} · ${esc(a.id)}${bn?` · <a href="${esc(bn)}" target="_blank" rel="noopener noreferrer">BNE ↗</a>`:""}</p>`:"<p><b>Cruce BNE:</b> no se identificó una coincidencia nominal unívoca.</p>"}
      <p class="sc-links">${f?`<a href="${esc(f)}" target="_blank" rel="noopener noreferrer">Fuente bibliográfica ↗</a>`:""}${m&&m!==f?`<a href="${esc(m)}" target="_blank" rel="noopener noreferrer">Fuente del indicador ↗</a>`:""}</p><p class="sc-task">${esc(b.tasks||"Verificar fuente primaria, edición, traducción y territorios")}</p></div></details></article>`;
  }
  function authorRow(x){
    const a=x.data,works=related.get(a.id)||[],bn=/^XX\d+$/.test(String(a.id))?`https://datos.bne.es/persona/${a.id}.html`:"";
    return `<article class="sc-record sc-author"><div class="sc-main"><span class="sc-top">AUTOR · BNE ${esc(a.id||"s/id")}</span><h3>${esc(a.n)}</h3><p class="sc-sub">${esc(a.l||"Idioma sin consignar")} · ${esc(a.loc||a.c||"Lugar no disponible")}</p><div class="sc-tags"><span>N. ${esc(a.b||"—")}</span><span>† ${esc(a.d||"—")}</span>${a.sel?"<span>Cohorte 1945</span>":""}${works.length?`<span class="sc-linked">${fmt(works.length)} obra(s) vinculada(s) por nombre</span>`:""}</div></div><div class="sc-side"><strong class="sc-metric">Autoridad</strong><small>Registro de persona</small>${bn?`<a class="mini-button" href="${esc(bn)}" target="_blank" rel="noopener noreferrer">Abrir BNE ↗</a>`:""}</div><details class="sc-details"><summary>Identidad, actividad y cruces</summary><div><p><b>Actividad:</b> ${esc(a.p||"No documentada")}</p><p><b>Idioma:</b> ${esc(a.l||"No documentado")}</p><p><b>Posibles obras del catálogo internacional:</b> ${works.length?works.map(w=>esc(w.title_es)).join("; "):"sin coincidencia nominal unívoca; no implica ausencia de obras."}</p><p>Un registro de autoridad no demuestra el estado de derechos de una obra.</p></div></details></article>`;
  }
  function render() {
    if(!loaded){ctl("scResults").innerHTML='<div class="empty">Cargando datos bibliográficos…</div>';return;}
    const all=rows(), pages=Math.max(1,Math.ceil(all.length/PAGE));
    page=Math.max(0,Math.min(page,pages-1));
    const current=all.slice(page*PAGE,(page+1)*PAGE);
    ctl("scCount").textContent=`${fmt(all.length)} registros · ${fmt(all.filter(x=>x.type==="obra").length)} obras · ${fmt(all.filter(x=>x.type==="autor").length)} autores`;
    ctl("scResults").innerHTML=current.map(x=>x.type==="obra"?bookRow(x):authorRow(x)).join("")||'<div class="empty">Sin resultados. Reducí la cantidad de filtros.</div>';
    ctl("scPager").textContent=`Página ${fmt(page+1)} de ${fmt(pages)}`;
    ctl("scPrev").disabled=page===0;
    ctl("scNext").disabled=page+1>=pages;
  }
  function exportCSV(){
    if(!loaded)return;
    const h=["Tipo","ID","Título / Nombre","Título original","Autor","Mercado","Idioma","Género / actividad","Fallecimiento","Publicación","Prioridad","Calidad","Indicador","Valor","Unidad / ventana","Fuente","Cruce BNE","Estado de derechos","Temáticas","Estado edición","Editorial edición","Año edición","Idioma edición","ISBN","URL editorial"];
    const r=rows().map(x=>{if(x.type==="autor"){const a=x.data;return ["Autor",a.id,a.n,"","",a.c,a.l,a.p,a.d,"","","","","","","https://datos.bne.es/persona/"+a.id+".html",(related.has(a.id)?"Propuesta nominal":"Sin cruce"),"Revisar por obra y territorio","","","","","","",""]}const b=x.data;return ["Obra",b.id,b.title_es,b.title_original,b.author,b.market,b.language,b.genre,b.death,b.published,b.priority,b.quality,b.indicator_type,b.indicator_value,b.indicator_period,b.indicator_url||b.evidence_url,bookToAuthor.has(b.id)?"Propuesta nominal":"Sin cruce",b.legal_note,(b.themes||[]).join("; "),b.edition_status,b.edition_publisher,b.edition_year,b.edition_language,b.edition_isbn,b.edition_url]});
    const cell=x=>{let t=String(x??"");if(/^\s*[=+\-@]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';};
    const out="\ufeff"+[h,...r].map(row=>row.map(cell).join(",")).join("\r\n");
    const blob=new Blob([out],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="siglo23-screener-filtrado.csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
  }
  ["scQuery","scUniverse","scMarket","scLanguage","scGenre","scPriority","scEvidence","scQuality","scCross","scThemes","scEdition","scDeathFrom","scDeathTo","scPubFrom","scPubTo","scCohort","scSort"].forEach(id=>ctl(id).addEventListener(id==="scQuery"||id.includes("From")||id.includes("To")?"input":"change",()=>{page=0;render();}));
  ctl("scClear").addEventListener("click",()=>{for(const id of ["scQuery","scMarket","scLanguage","scGenre","scPriority","scEvidence","scQuality","scCross","scDeathFrom","scDeathTo","scPubFrom","scPubTo"])ctl(id).value="";ctl("scUniverse").value="obras";ctl("scCohort").checked=false;ctl("scSort").value="prioridad";page=0;render();});
  ctl("scPrev").addEventListener("click",()=>{page--;render();});
  ctl("scNext").addEventListener("click",()=>{page++;render();});
  ctl("scExport").addEventListener("click",exportCSV);
  ctl("scResults").addEventListener("click",e=>{
    const b=e.target.closest("[data-sc-add]");if(!b)return;const w=books.find(x=>x.id===b.dataset.scAdd);if(!w)return;
    const saved=storageGet(booksKey,[]);
    if(!Array.isArray(saved))return;
    const id="global-"+w.id;if(saved.some(x=>x.id===id))return;
    saved.unshift({id,title:w.title_es||w.title_original,author:w.author,published:w.published||"",language:w.language||"",stage:"candidato",priority:["Muy alta","Alta"].includes(w.priority)?"alta":"media",source:url(w.evidence_url),notes:`Siglo23 ${w.id} · ${w.market} · ${w.genre}. Temáticas: ${(w.themes||[]).join("; ")}. Edición: ${w.edition_status||"pendiente"}. Indicador: ${w.indicator_type} ${w.indicator_value??""}. Evidencia ${w.quality}. Derechos no verificados. ${w.tasks}`.slice(0,2000)});
    try{localStorage.setItem(booksKey,JSON.stringify(saved));b.disabled=true;b.textContent="En mesa";ctl("scLoadNotice").textContent="Obra añadida a la mesa local. Abrí «Mesa de ediciones» y recargá la página para sincronizar la vista con el almacenamiento del navegador.";}catch{ctl("scLoadNotice").textContent="No se pudo guardar: el navegador bloqueó el almacenamiento local.";}
  });
  window.addEventListener("hashchange",()=>{if(location.hash==="#screener")render();});
  fetch(new URL("catalogo-global.json", document.querySelector('script[src*="screener.js"]').src).href,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(d=>{books=Array.isArray(d.works)?d.works:[];markets=Array.isArray(d.markets)?d.markets:[];setup();}).catch(e=>{ctl("scLoadNotice").textContent="No se pudo cargar catalogo-global.json: "+e.message+" · Verificar que el archivo esté desplegado junto a la página.";ctl("scResults").innerHTML='<div class="empty">Catálogo internacional no disponible en este servidor.</div>';});
})();
