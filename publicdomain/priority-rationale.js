(function () {
  "use strict";
  // v0.3.1 — Auditoria explicativa de prioridades. No modifica prioridades ni obras.
  var root=document.getElementById("scResults");
  if(!root)return;
  var script=document.currentScript;
  var source=new URL("catalogo-global.json",script.src);
  var records=new Map(),marketMap=new Map();
  var ready=false;
  var format=n=>Number(n).toLocaleString("es-AR");
  var url=v=>{try{const u=new URL(String(v||""));return /^https?:$/.test(u.protocol)?u.href:""}catch{return""}};
  var normalize=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  function el(tag,cls,txt){
    var n=document.createElement(tag);
    if(cls)n.className=cls;
    if(txt!==undefined)n.textContent=String(txt);
    return n;
  }
  function appendNote(list,title,body,href){
    var li=el("li");
    var strong=el("strong",null,title+". ");
    li.append(strong,document.createTextNode(body));
    if(href){var a=el("a",null," Consultar fuente");a.href=href;a.target="_blank";a.rel="noopener noreferrer";li.append(a)}
    list.append(li);
  }
  function explain(b){
    var indicator=String(b.indicator_type||"");
    var qty=b.indicator_value;
    var measurable=qty!==null&&qty!==undefined&&qty!==""&&Number.isFinite(Number(qty))&&normalize(indicator)!=="no disponible";
    var indicatorLink=url(b.indicator_url)||url(b.evidence_url);
    var evidence=String(b.evidence||"").trim();
    var generic=/^(candidato bibliografico a estudiar|no disponible|sin evidencia|sin datos|pendiente)/.test(normalize(evidence));
    var qualitative=!!evidence&&!generic;
    var commercial=b.edition_status==="Edición editorial documentada";
    var sourceReason=String(b.priority_reason||b.priority_rationale||"").trim();
    var signals=[];
    if(sourceReason)signals.push(["Motivo editorial registrado",sourceReason,""]);
    if(measurable)signals.push(["Indicador de la obra",indicator+": "+format(qty)+(b.indicator_period?" · "+b.indicator_period:"")+". "+(indicatorLink?"La ficha ofrece una fuente de consulta.":"Falta un enlace directo que permita comprobarlo.")+" Rankings, accesos y descargas no deben tratarse como ventas.",indicatorLink]);
    if(qualitative)signals.push(["Información cualitativa",evidence+". Puede referirse al mercado o al género y no a ventas específicas del título.",url(b.evidence_url)]);
    if(commercial)signals.push(["Edición documentada","Existe una ficha editorial"+(b.edition_publisher?" de "+b.edition_publisher:"")+(b.edition_year?" ("+b.edition_year+")":"")+(b.edition_isbn?", ISBN "+b.edition_isbn:"")+". No implica unidades vendidas, stock ni derechos de esa edición.",url(b.edition_url)]);
    var market=marketMap.get(b.market);
    if(market)signals.push(["Contexto de mercado",b.market+" figura con prioridad de mercado «"+(market.priority||"no clasificada")+"» en la investigación. Este dato es contextual, no mide el interés por la obra.",url(market.source)]);
    if(b.line)signals.push(["Encaje editorial","La obra está asignada a la línea «"+b.line+"». Es un criterio de curaduría, no evidencia comercial.",""]);
    var support=measurable?(indicatorLink?"Indicador de la obra registrado":"Indicador sin enlace verificable"):commercial?"Edición comercial documentada":qualitative?"Solo contexto cualitativo":"Demanda sin documentar";
    var unsupported=!measurable&&!commercial&&!qualitative;
    return {support:support,signals:signals,unsupported:unsupported,measurable:measurable,commercial:commercial,qualitative:qualitative,sourceReason:sourceReason};
  }
  function insertPriority(record,b){
    if(record.querySelector(".sc-priority-line"))return;
    var e=explain(b);
    var main=record.querySelector(".sc-main");
    if(!main)return;
    var inline=el("div","sc-priority-line");
    inline.append(el("strong",null,"Prioridad "+b.priority+" · "),el("span",e.unsupported?"sc-support-missing":e.measurable?"sc-support-specific":"sc-support-context",e.support));
    main.append(inline);
    var block=el("details","sc-priority-detail");
    block.append(el("summary",null,"¿Por qué figura como prioridad "+b.priority.toLowerCase()+"? · Ver fundamentos"));
    var content=el("div","sc-priority-content");
    content.append(el("p",null,e.sourceReason?"Esta ficha registra un motivo editorial explícito. Los otros datos ayudan a contrastarlo.":"La etiqueta «"+b.priority+"» ya estaba asignada en el catálogo. No se documentó una fórmula ni el motivo original: lo que sigue muestra las señales existentes, sin atribuirles retroactivamente la decisión."));
    if(e.unsupported)content.append(el("p","sc-priority-alert","Atención: no hay indicadores propios de demanda, ediciones comerciales documentadas ni evidencia cualitativa suficiente. Esta prioridad es una hipótesis editorial no demostrada."));
    var title=el("h4",null,"Señales que pueden respaldar la elección");
    content.append(title);
    var list=el("ul");
    if(e.signals.length){e.signals.forEach(function(s){appendNote(list,s[0],s[1],s[2])})}
    else appendNote(list,"Sin señales","No se aportaron elementos suficientes para evaluar esta clasificación.","");
    content.append(list);
    content.append(el("h4",null,"Información que todavía falta"));
    var missing=el("ul");
    if(!e.measurable)appendNote(missing,"Demanda","Falta una medida verificable y específica para esta obra.","");
    if(!e.commercial)appendNote(missing,"Ediciones","La ficha no documenta una edición editorial, lo que no significa que no exista.","");
    appendNote(missing,"Derechos","La posibilidad de editar y comercializar la obra, traducciones e imágenes debe comprobarse por país.","");
    content.append(missing);
    content.append(el("p","sc-priority-legend","Calidad de evidencia registrada: "+(b.quality||"sin clasificar")+". La calidad A/B/C no equivale a prioridad alta/media ni a rentabilidad. Un ranking de accesos, una edición catalogada y las ventas comprobadas miden cosas diferentes."));
    block.append(content);
    var details=record.querySelector(".sc-details");
    if(details)record.insertBefore(block,details);else record.append(block);
  }
  function decorate(){
    if(!ready)return;
    root.querySelectorAll(".sc-record").forEach(function(record){
      var btn=record.querySelector("[data-sc-add]");
      if(!btn)return;
      var b=records.get(btn.dataset.scAdd);
      if(b&&(b.priority==="Alta"||b.priority==="Muy alta"))insertPriority(record,b);
    });
  }
  function overview(works){
    var high=works.filter(b=>b.priority==="Alta"),very=works.filter(b=>b.priority==="Muy alta"),all=high.concat(very);
    var measured=all.filter(b=>explain(b).measurable).length;
    var noSupport=all.filter(b=>explain(b).unsupported).length;
    var anchor=document.getElementById("scPriorityMethod");
    if(anchor)return;
    var after=document.querySelector("#view-screener .sc-summary");
    if(!after)return;
    var p=el("section","sc-priority-method");
    p.id="scPriorityMethod";
    p.setAttribute("aria-label","Criterios y respaldo de las prioridades");
    p.append(el("h3",null,"¿Por qué una obra recibe prioridad alta o muy alta?"));
    p.append(el("p",null,"La prioridad es una selección editorial previa. No contamos todavía con una regla de puntuación documentada. Cada ficha expone qué respaldo concreto existe y qué falta verificar. No interpretamos relevancia cultural como ventas."));
    p.append(el("p","sc-priority-totals",format(very.length)+" de prioridad muy alta · "+format(high.length)+" alta · "+format(measured)+" con indicador cuantificado · "+format(noSupport)+" sin respaldo específico ni contexto comercial registrado."));
    var lines=el("div","sc-priority-criteria");
    [["Demanda de la obra","Ventas, descargas o rankings con fuente, período y unidad documentados (no intercambiables)."],
      ["Mercado y colección","Información sectorial y encaje temático: hipótesis, no ventas comprobadas del título."],
      ["Oferta existente","Ediciones con editorial e ISBN: señalan actividad editorial, no número de ejemplares vendidos."],
      ["Viabilidad legal","Comprobación independiente de original, traducción, imágenes y territorios. Aún pendiente."]
    ].forEach(function(x){var span=el("div");span.append(el("strong",null,x[0]),el("p",null,x[1]));lines.append(span)});
    p.append(lines);
    after.insertAdjacentElement("afterend",p);
  }
  new MutationObserver(decorate).observe(root,{childList:true});
  fetch(source,{cache:"no-store"}).then(function(response){if(!response.ok)throw new Error("HTTP "+response.status);return response.json()}).then(function(data){
    var books=Array.isArray(data.works)?data.works:[];
    books.forEach(function(b){if(b&&b.id)records.set(String(b.id),b)});
    (Array.isArray(data.markets)?data.markets:[]).forEach(function(m){if(m&&m.market)marketMap.set(m.market,m)});
    ready=true;
    overview(books);
    decorate();
  }).catch(function(error){console.warn("Siglo23 prioridades: no se pudo cargar el catálogo",error)});
})();