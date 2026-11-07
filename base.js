// Utilidades: selector, escape de texto y fechas. Se carga como script normal (comparte variables con los demás archivos): el orden importa, ver index.html.
const K="turnos.v1",DN=["L","M","X","J","V","S","D"],$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const iso=(y,m,d)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const hoy=()=>{const n=new Date();return iso(n.getFullYear(),n.getMonth(),n.getDate())};
const dn=s=>{const[y,m,d]=s.split("-").map(Number);return Date.UTC(y,m-1,d)/864e5};
const R=(a,n)=>Array(n).fill(a);
