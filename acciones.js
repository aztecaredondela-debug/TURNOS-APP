// Acciones: qué hace cada botón. Se carga como script normal (comparte variables con los demás archivos): el orden importa, ver index.html.
function act(a,v){switch(a){
case"tab":tab=v;draw();break;case"ok":S.visto=1;save();draw();break;
case"mes":ver.setMonth(ver.getMonth()+ +v);draw();break;case"rmes":rv.setMonth(rv.getMonth()+ +v);draw();break;
case"brush":brush=v||null;draw();break;
case"dia":if(brush===null)pick(new Date(v+"T00:00").toLocaleDateString("es",{weekday:"long",day:"numeric",month:"long"})+(S.fe[v]?" · 🎉 "+S.fe[v]:""),"set",v);else act("set",v+"|"+brush);break;
case"set":{const[f,id]=v.split("|");if(id==="__")delete S.dias[f];else S.dias[f]=id;if(T(id)?.perm)S.pd[f]=S.pd[f]||hoy();else delete S.pd[f];save();shut();draw();break}
case"cdia":pick("Turno del día "+(+v+1),"cset",v);break;
case"cset":{const[i,id]=v.split("|");S.ciclo[+i]=id;save();shut();draw();break}
case"cadd":if(S.ciclo.length<120){S.ciclo.push(S.turnos.find(t=>t.libre)?.id||"");save();draw()}break;
case"cdel":if(S.ciclo.length>1){S.ciclo.pop();save();draw()}break;
case"tpl":if(confirm("Esto sustituye tu ciclo actual. Los cambios sueltos de días se mantienen. ¿Seguir?")){S.ciclo=TPL[+v][1].map(id=>T(id)?id:"");S.ref=S.ciclo.length%7===0?lunHoy():hoy();save();draw()}break;
case"csem":S.ref=fN(dn(lunHoy())-7*+v);save();draw();break;
case"hsave":{const o={ini:$("#hi").value,fin:$("#hf").value,desc:+$("#hdc").value||0},a=$("#hi2").value,b=$("#hf2").value;if(a&&b){o.ini2=a;o.fin2=b}S.hd[v]=o}save();shut();draw();break;
case"hdel":delete S.hd[v];save();shut();draw();break;
case"cdw":S.cfg.dias[+v]=S.cfg.dias[+v]?0:1;save();draw();break;
case"cbs":{const n=$("#cbn").value.trim();if(!n){alert("Pon el nombre del compañero.");return}S.cb[v]={con:n,dir:+$("#cbd").value,ok:S.cb[v]?.ok||0};save();shut();draw();break}
case"cbq":delete S.cb[v];save();shut();draw();break;
case"sal":for(const o of Object.values(S.cb))if(o.con===v)o.ok=1;save();draw();break;
case"pano":po+=+v;draw();break;
case"mk":open(`<h3>Marcar días</h3><label>Qué<select id=mt>${S.turnos.filter(t=>t.perm).map(t=>`<option value=${t.id}>${esc(t.nom)}</option>`).join("")}<option value=__>Borrar marca (volver al ciclo)</option></select></label><div class=two><label>Desde<input id=md type=date value="${hoy()}"></label><label>Hasta<input id=mh type=date value="${hoy()}"></label></div><label class=chk><input id=ms type=checkbox checked> Solo los días que me tocaba trabajar</label><div class=two><button class=pri data-a=mkok>Marcar</button><button data-a=close>Cancelar</button></div>`);break;
case"mkok":{const n=marcar($("#mt").value,$("#md").value,$("#mh").value,$("#ms").checked);if(n<0)alert("Revisa las fechas.");else{shut();draw()}break}
case"nfs":{const t=$("#ntx").value.trim(),n=$("#fnm").value.trim();if(t)S.nt[v]=t;else delete S.nt[v];if(n)S.fe[v]=n;else delete S.fe[v];save();shut();draw();break}
case"fest":fsh();break;case"fy":fy+=+v;fsh();break;
case"fimp":for(const[f,n]of Object.entries(PACK.ES(fy)))if(!S.fe[f])S.fe[f]=n;save();fsh();draw();break;
case"fdel":delete S.fe[v];save();fsh();draw();break;
case"edit":editor(v);break;
case"sv":{const nom=$("#fn").value.trim(),cod=$("#fc").value.trim().toUpperCase();if(!nom||!cod){alert("Pon un nombre y una letra.");return}
const t=v==="new"?{id:"s"+Date.now().toString(36)}:T(v);const k=$("#fl").value;Object.assign(t,{nom,cod,c:$("#fcol").value,ini:$("#fi").value,fin:$("#ff").value,desc:+$("#fdsc").value||0,ini2:$("#fi2").value,fin2:$("#ff2").value});if(!t.ini2||!t.fin2){delete t.ini2;delete t.fin2}delete t.libre;delete t.perm;delete t.cupo;if(k==="l")t.libre=1;if(k==="p"){t.perm=1;if(+$("#fcu").value>0)t.cupo=+$("#fcu").value}if(v==="new")S.turnos.push(t);save();shut();draw();break}
case"rm":if(confirm("¿Eliminar este turno? Los días que lo usaban quedarán sin turno.")){S.turnos=S.turnos.filter(t=>t.id!==v);S.ciclo=S.ciclo.map(i=>i===v?"":i);for(const f in S.dias)if(S.dias[f]===v)delete S.dias[f];save();shut();draw()}break;
case"exp":{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:"application/json"}));a.download="turnos-copia.json";a.click();break}
case"imp":$("#imp").click();break;case"close":shut();break}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b)act(b.dataset.a,b.dataset.v)});
$("#imp").onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(x=>{const d=JSON.parse(x);if(!Array.isArray(d.turnos)||!Array.isArray(d.ciclo)||typeof d.dias!=="object")throw 0;if(confirm("Esto sustituye todo lo que hay ahora. ¿Seguir?")){S=d;norm();save();draw()}}).catch(()=>alert("Ese archivo no es una copia válida."));e.target.value=""};
