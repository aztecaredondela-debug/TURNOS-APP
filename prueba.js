// Pruebas de la lógica (sin navegador): node tests/prueba.js
// Carga los scripts en el mismo orden que index.html y simula el DOM con un objeto vacío.
const vm = require("vm"), fs = require("fs"), path = require("path");
const raiz = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script defer src="([^"?]+)/g)].map(m => m[1]);
const stub = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => "" : stub, apply: () => stub, set: () => true });
const ctx = { document: stub, localStorage: { getItem: () => null, setItem() {} }, navigator: {}, confirm: () => true, alert() {}, URL: {}, Blob: function () {}, Date, JSON, Math, console };
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(raiz, s), "utf8"), ctx, { filename: s });
const ev = s => vm.runInContext(s, ctx);
let fallos = 0, total = 0;
const t = (n, c) => { total++; if (!c) { fallos++; console.log("FALLO", n); } };
const y = new Date().getFullYear();

// Horas de un turno
t("mañana 06–14 = 8 h", ev("horas(T('m'))") === 8);
t("noche 22–06 = 8 h", ev("horas(T('n'))") === 8);
ev('S.turnos.push({id:"p",cod:"P",nom:"Partido",c:"#fff",ini:"09:00",fin:"13:00",ini2:"16:00",fin2:"20:00"})');
t("partido 4 + 4 = 8 h", ev("horas(T('p'))") === 8);
ev("T('p').desc=30"); t("descanso no pagado 30 min → 7,5 h", ev("horas(T('p'))") === 7.5); ev("T('p').desc=0");
t("tramo 2 incompleto no suma", ev("tr({ini:'08:00',fin:'12:00',ini2:'16:00'})") === 4);

// Jornada y horas extra
ev('S.ref="2026-11-02";S.ciclo=["m","m","m","m","m","l","l"];S.dias={};S.hd={};S.cfg={modo:"s",h:40,dias:[1,1,1,1,1,0,0],ini:1,aini:0}');
t("semana 5×8 = 40, sin extra", ev("semana(dn('2026-11-02'))") === 40);
ev('S.hd["2026-11-02"]={ini:"06:00",fin:"12:00"};S.hd["2026-11-03"]={ini:"06:00",fin:"16:00"}');
t("6 h + 10 h compensan", ev("semana(dn('2026-11-02'))") === 40);
ev('S.hd["2026-11-04"]={ini:"06:00",fin:"16:00"}'); t("un día de 10 h → +2", ev("semana(dn('2026-11-02'))") === 42);
ev('S.hd["2026-11-07"]={ini:"08:00",fin:"12:00"}'); t("sábado libre trabajado → +4", ev("semana(dn('2026-11-02'))") === 46);
ev('S.hd={};S.cfg={modo:"s",h:22,dias:[0,0,0,0,1,1,1],ini:1,aini:0};S.ciclo=["l","l","l","l","p","p","p"];T("p").ini="09:00";T("p").fin="13:00";delete T("p").ini2;delete T("p").fin2');
ev('S.turnos.push({id:"a",cod:"A",nom:"A",c:"#fff",ini:"08:00",fin:"16:00"},{id:"b",cod:"B",nom:"B",c:"#fff",ini:"08:00",fin:"14:00"});S.ciclo=["l","l","l","l","a","a","b"]');
t("viernes-sábado-domingo 22 h = 22", ev("semana(dn('2026-11-02'))") === 22);
t("vacaciones valen 22/3 h", Math.abs(ev("cred()") - 22 / 3) < 1e-9);
ev('S.dias["2026-11-02"]="v"'); t("vacaciones en lunes (no es día de contrato) = 0", ev("horasDia('2026-11-02')") === 0);
ev('S.dias={};S.cfg={modo:"d",h:7,dias:[1,1,1,1,1,0,0],ini:1,aini:0}'); t("modo día: crédito = jornada diaria", ev("cred()") === 7);
ev('S.cfg={modo:"n",h:40,dias:[1,1,1,1,1,0,0],ini:1,aini:0}'); t("sin objetivo: vacaciones 0", ev("cred()") === 0);
ev('S.cfg={sem:38};norm()'); t("migración de cfg.sem", ev("S.cfg.h") === 38 && ev("S.cfg.modo") === "s");

// Permisos
ev(`S.cfg={modo:"s",h:40,dias:[1,1,1,1,1,0,0],ini:1,aini:0};S.hd={};S.dias={};S.pd={};S.ref="${y}-01-05";S.ciclo=["m","m","m","m","m","l","l"];T("v").cupo=22`);
t("marcar 3–14 ago → 10 días", ev(`marcar("v","${y}-08-03","${y}-08-14",true)`) === 10);
ev(`S.pd["${y}-08-03"]="${y}-06-05"`); const p = ev("per()");
t("un tramo con fin de semana en medio", /3 ago[^<]*14 ago · 10 días/.test(p));
t("acumulado 10 / 22, quedan 12", p.includes("10 / 22") && p.includes("Te quedan 12"));
t("fecha de pedido", p.includes("pedido el 5 jun"));
t("fechas mal puestas se rechazan", ev(`marcar("v","${y}-09-10","${y}-09-01",true)`) === -1);
ev(`marcar("__","${y}-08-01","${y}-08-31",false)`); t("borrar vuelve al ciclo", ev(`S.dias["${y}-08-03"]`) === undefined && ev(`S.pd["${y}-08-03"]`) === undefined);
t("año que empieza en octubre", ev("plab(9,0)")[0].slice(5) === "10-01");

// Festivos y notas
t("Pascua 2026/2027/2025", ev("pascua(2026)") === "2026-04-05" && ev("pascua(2027)") === "2027-03-28" && ev("pascua(2025)") === "2025-04-20");
t("Viernes Santo 2026 y 10 festivos base", ev("PACK.ES(2026)")["2026-04-03"] === "Viernes Santo" && Object.keys(ev("PACK.ES(2026)")).length === 10);
ev('S.fe={"2026-01-01":"Mío"};fy=2026;act("fimp")'); t("importar no pisa los existentes", ev('S.fe["2026-01-01"]') === "Mío" && ev('S.fe["2026-05-01"]') === "Fiesta del Trabajo");
ev('S.ref="2026-11-02";S.ciclo=["m","m","m","m","m","l","l"];S.dias={"2026-11-04":"v"};S.hd={};S.fe={"2026-11-03":"A","2026-11-07":"B","2026-11-04":"C"};S.nt={};rv=new Date(2026,10,1)');
t("festivos trabajados = 1", ev("res()").includes("Festivos trabajados</b><b>1</b>"));
ev('S.nt["2026-11-05"]="<img src=x onerror=alert(1)>";ver=new Date(2026,10,1)'); const c = ev("cal()");
t("las notas se escapan", !c.includes("<img") && c.includes("&lt;img"));
t("marcas de festivo y nota", /class="d[^"]* fe"/.test(c) && c.includes("<em class=nt>"));

// Cambios con compañeros
ev('S.cb={"2026-11-03":{con:"Juan",dir:1,ok:0},"2026-11-05":{con:"Juan",dir:1},"2026-11-09":{con:"Ana",dir:-1}}');
t("deudas por persona", ev("deu()").includes("te debe 2") && ev("deu()").includes("le debes 1"));
ev('act("sal","Juan")'); t("saldar", !ev("deu()").includes("Juan"));

// Todas las pantallas y hojas se generan
for (const v of ["cal", "cic", "tur", "per", "res"]) { let ok = true; try { ev(`tab="${v}";({cal,cic,tur,per,res})["${v}"]().length`); } catch (e) { ok = false; console.log(e.message); } t("pantalla " + v, ok); }
for (const a of [["dia", "2026-11-03"], ["edit", "new"], ["mk"], ["fest"], ["cdia", "0"]]) { let ok = true; try { ev(`act(${JSON.stringify(a[0])},${JSON.stringify(a[1] || "")})`); } catch (e) { ok = false; console.log(e.message); } t("hoja " + a[0], ok); }

console.log(`${total - fallos}/${total} pruebas correctas` + (fallos ? " — HAY FALLOS" : ""));
process.exit(fallos ? 1 : 0);
