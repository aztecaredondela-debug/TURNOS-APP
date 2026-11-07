// Cálculo: turno de cada día, horas, jornada y semanas. Se carga como script normal (comparte variables con los demás archivos): el orden importa, ver index.html.
const turno=f=>{if(S.dias[f]!==undefined)return T(S.dias[f]);const c=S.ciclo;if(!c.length)return null;return T(c[((dn(f)-dn(S.ref))%c.length+c.length)%c.length])};
const mn=h=>{const[a,b]=h.split(":").map(Number);return a*60+b};
const seg=(i,f)=>{if(!i||!f)return 0;const x=(mn(f)-mn(i)+1440)%1440;return(x||1440)/60};
const tr=o=>Math.max(0,seg(o.ini,o.fin)+seg(o.ini2,o.fin2)-(o.desc||0)/60); // jornada partida: se suman los dos tramos
const dur=(i,f,d)=>tr({ini:i,fin:f,desc:d});
const horas=t=>!t||t.libre?0:t.perm?cred():(t.ini&&t.fin?tr(t):0);
// Horas que cuenta un día de vacaciones/permiso: las de su jornada diaria (o las que fije el usuario)
const cred=auto=>{const c=S.cfg;if(c.perm&&!auto)return c.perm;if(c.modo==="n")return 0;const n=c.dias.reduce((a,b)=>a+b,0)||1;return c.modo==="d"?c.h:c.modo==="m"?c.h/(n*52/12):c.h/n};
const wdi=f=>(new Date(dn(f)*864e5).getUTCDay()+6)%7;
const horasDia=f=>{const o=S.hd[f];if(o)return tr(o);const t=turno(f);return t&&t.perm&&!S.cfg.dias[wdi(f)]?0:horas(t)};
const fN=n=>{const d=new Date(n*864e5);return iso(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};
const semana=n=>{let x=0;for(let i=0;i<7;i++)x+=horasDia(fN(n+i));return x};
const fH=h=>(Math.round(h*10)/10)+" h";
const mesTxt=d=>d.toLocaleString("es",{month:"long",year:"numeric"});
