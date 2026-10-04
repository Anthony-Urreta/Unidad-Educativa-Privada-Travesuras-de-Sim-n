
const D=new Proxy({},{get:(_,k)=>k=='addEventListener'?()=>{}:'',set:()=>true}),$=i=>document.getElementById(i)||D,pad=n=>String(n).padStart(2,'0'),e=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const DEF={fu:0,fb:0,fr:0,st:new Date().getFullYear()+'-09',dd:5};
let S={cfg:{...DEF},st:[],pay:[],rates:[]},cur='USD',grade='',sha=null,cmo='',ids=new Set();
const now=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const rate=()=>S.cfg.fr>0?S.cfg.fr:(S.cfg.fu>0?S.cfg.fb/S.cfg.fu:0);
const nf=n=>n.toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2}),nr=n=>n.toLocaleString('es-VE',{minimumFractionDigits:4,maximumFractionDigits:4});
const U=u=>'$'+nf(u),B=u=>'Bs '+nf(u*rate()),fm=u=>cur=='USD'?U(u):B(u);
const mon=(a,b)=>{const r=[];let[y,m]=a.split('-').map(Number);const[y2,m2]=b.split('-').map(Number);while(y<y2||y==y2&&m<=m2){r.push(y+'-'+pad(m));if(++m>12){m=1;y++}}return r};
const due=m=>m+'-'+pad(S.cfg.dd),days=(a,b)=>Math.floor((Date.parse(b)-Date.parse(a))/864e5);
const tm=d=>d>=30?Math.floor(d/30)+' m '+d%30+' d':d+' d';
const ORD=['Maternal','Grupo 1','Grupo 2','Grupo 3','1er Grado','2do Grado','3er Grado','4to Grado','5to Grado','6to Grado'];
const go=(a,b)=>(ORD.indexOf(a)+99)%99-(ORD.indexOf(b)+99)%99;
const norm=d=>({cfg:{...DEF,...d.cfg},st:d.st||[],pay:d.pay||[],rates:d.rates||[]});
const findS=v=>S.st.find(s=>s.n+' — '+s.c==v);
const save=()=>{localStorage.S=JSON.stringify(S);localStorage.dirty=1;R()};
function calc(s){const ms=mon(S.cfg.st,now().slice(0,7)),f=S.cfg.fu,ch=ms.length*f,pd=S.pay.filter(p=>p.s==s.i).reduce((a,p)=>a+p.u,0),acc=Math.max(0,ch-pd),k=f?Math.floor(pd/f+1e-9):0;let mora=0,since='';if(acc>.005&&k<ms.length&&due(ms[k])<=now()){since=due(ms[k]);mora=days(since,now())}return{acc,pd,mes:Math.min(f,acc),mora,since}}
function chips(){const gs=[...new Set(S.st.map(s=>s.g))].sort(go);$('chips').innerHTML=['',...gs].map(g=>{const l=S.st.filter(s=>!g||s.g==g),d=l.reduce((a,s)=>a+calc(s).acc,0);return`<button class="${g==grade?'on':''}" onclick="grade='${g}';R()">${g||'Todos'} · ${l.length} · ${fm(d)}</button>`}).join('')}
function R(){$('rt').textContent='Tasa BCV: Bs '+nr(rate())+(S.cfg.frd&&S.cfg.frd!=now()?' · desactualizada ('+S.cfg.frd+')':'')+(localStorage.dirty?' · cambios sin publicar':'');$('rt4').textContent=nr(rate());document.querySelectorAll('.pd').forEach(x=>x.textContent=now());
$('dl').innerHTML=S.st.map(s=>`<option value="${e(s.n)} — ${e(s.c)}">`).join('');chips();
const qn=$('qn').value.toLowerCase(),qc=$('qc').value.trim();
const L=S.st.filter(s=>(!grade||s.g==grade)&&s.n.toLowerCase().includes(qn)&&String(s.c).includes(qc)).map(s=>({s,...calc(s)}));
$('kpi').innerHTML=[['Deuda acumulada',fm(L.reduce((a,x)=>a+x.acc,0))],['Abonado',fm(L.reduce((a,x)=>a+x.pd,0))],['En mora',L.filter(x=>x.mora).length],['Estudiantes',L.length]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('');
$('tb').innerHTML=L.sort((a,b)=>b.mora-a.mora||b.acc-a.acc).map(x=>`<tr><td>${e(x.s.n)}</td><td>${e(x.s.c)}</td><td>${e(x.s.g)}</td><td>${x.acc>0?fm(x.mes):'—'}</td><td class="${x.acc>0?'bad':'ok'}">${fm(x.acc)}</td><td>${x.pd?fm(x.pd):'—'}</td><td>${x.mora?`<span class="bad">${tm(x.mora)}</span> <span class="m">desde ${x.since}</span>`:'<span class="ok">Al día</span>'}</td></tr>`).join('');
topM();cal(L);pays();C();rl();K()}
function topM(){const gs=[...new Set(S.st.map(s=>s.g))].filter(g=>!grade||g==grade).sort(go);$('top').innerHTML=gs.map(g=>{const l=S.st.filter(s=>s.g==g).map(s=>({s,...calc(s)})).filter(x=>x.mora>0).sort((a,b)=>b.mora-a.mora||b.acc-a.acc).slice(0,10);return l.length?`<div class="gr"><b>${e(g)}</b>`+l.map((x,i)=>`<div class="row"><span>${i+1}. ${e(x.s.n)}</span><span class="bad">${tm(x.mora)} · ${fm(x.acc)}</span></div>`).join('')+'</div>':''}).join('')||'<p class="ok">Sin morosos</p>'}
function cal(L){ids=new Set(L.map(x=>x.s.i));const[y,m]=cmo.split('-').map(Number),f=(new Date(y,m-1,1).getDay()+6)%7,n=new Date(y,m,0).getDate();let h=['L','M','M','J','V','S','D'].map(w=>`<div class="w">${w}</div>`).join('')+'<i></i>'.repeat(f);
for(let d=1;d<=n;d++){const ds=cmo+'-'+pad(d),ps=S.pay.filter(p=>p.d==ds&&ids.has(p.s)),t=ps.reduce((a,p)=>a+p.u,0);h+=`<div class="d${ps.length?' has':''}${d==S.cfg.dd?' due':''}" onclick="dl('${ds}')">${d}${ps.length?`<small>${fm(t)}</small>`:''}</div>`}
$('cal').innerHTML=h;$('cmt').textContent=new Date(y,m-1,1).toLocaleDateString('es',{month:'long',year:'numeric'})+' (borde rojo = vencimiento)'}
const mv=n=>{const[y,m]=cmo.split('-').map(Number),d=new Date(y,m-1+n,1);cmo=d.getFullYear()+'-'+pad(d.getMonth()+1);R()};
const dl=ds=>{const l=S.pay.filter(p=>p.d==ds&&ids.has(p.s));$('cd').innerHTML=`<p><b>${ds}</b></p>`+(l.map(p=>{const s=S.st.find(x=>x.i==p.s);return`<div class="row"><span>${e(s?s.n:p.s)}</span><span>${p.k=='USD'?U(p.a):'Bs '+nf(p.a)} (${U(p.u)})</span></div>`}).join('')||'Sin abonos')};
function pays(){$('pl').innerHTML=[...S.pay].sort((a,b)=>b.d.localeCompare(a.d)||b.id-a.id).slice(0,15).map(p=>{const s=S.st.find(x=>x.i==p.s);return`<tr><td>${p.d}</td><td>${e(s?s.n:p.s)}</td><td>${p.k=='USD'?U(p.a):'Bs '+nf(p.a)}</td><td>${U(p.u)}</td><td><button onclick="dp(${p.id})">Quitar</button></td></tr>`}).join('')}
const dp=id=>{S.pay=S.pay.filter(p=>p.id!=id);save()};
function C(){const f=S.cfg.fu,ms=mon($('c1').value,$('c2').value),s=findS($('cs').value),t=ms.length*f,pd=s?calc(s).pd:0,dd=Math.max(0,t-pd);let a=0;
$('cr').innerHTML=`<table><tr><th>Mes</th><th>Cuota $</th><th>Cuota Bs</th><th>Acumulado $</th><th>Acumulado Bs</th></tr>`+ms.map(m=>{a+=f;return`<tr><td>${m}</td><td>${U(f)}</td><td>${B(f)}</td><td>${U(a)}</td><td>${B(a)}</td></tr>`}).join('')+`</table><p><b>Total ${ms.length} meses: ${U(t)} / ${B(t)}</b></p>`+(s?`<p>${e(s.n)} · abonado ${U(pd)} / ${B(pd)} · <b class="bad">Deuda: ${U(dd)} / ${B(dd)}</b></p>`:'')}
const fillCfg=()=>{const c=S.cfg;$('fu').value=c.fu||'';$('fb').value=c.fb||'';$('fr').value=c.fr||'';$('fs').value=c.st;$('fd').value=c.dd;$('c1').value=c.st;$('c2').value=now().slice(0,7);$('ad').value=now()};
/* Excel */
$('xl').onchange=async ev=>{const f=ev.target.files[0];if(!f)return;const a=XLSX.utils.sheet_to_json(XLSX.read(await f.arrayBuffer()).Sheets[XLSX.read(await f.arrayBuffer()).SheetNames[0]],{header:1,raw:false,defval:''}),h=a.findIndex(r=>r.some(c=>/^\s*grados?\s*$/i.test(c)));
if(h<0)return $('xs').textContent='No encontré la columna «Grados».';const seen={};S.st=a.slice(h+1).filter(r=>String(r[1]).trim()).map(r=>{let i=String(r[2]).trim()||String(r[1]).trim();if(seen[i])i+='-'+(seen[i]++);else seen[i]=1;return{i,n:String(r[1]).trim(),c:String(r[2]).trim(),f:r[3],e:r[5],x:r[6],g:String(r[7]).trim(),r:r[8],rc:r[9],d:r[10],t:r[11]}});
$('xs').textContent=S.st.length+' estudiantes cargados. Pulsa «Guardar en GitHub» para publicarlos.';save()};
const stampR=v=>{S.cfg.fr=v;S.cfg.frd=now();S.rates=S.rates.filter(x=>x.d!=now());S.rates.push({d:now(),v})};
$('cs1').onclick=()=>{const fr=+$('fr').value||0,ch=fr&&fr!=S.cfg.fr,o=S.cfg.frd;S.cfg={fu:+$('fu').value||0,fb:+$('fb').value||0,fr:S.cfg.fr,st:$('fs').value||DEF.st,dd:+$('fd').value||5,frd:o};if(ch)stampR(fr);save();fillCfg()};
$('rb').onclick=()=>{const v=+$('fr').value;if(!v)return alert('Escribe la tasa BCV del día.');stampR(v);save();fillCfg()};
$('ab').onclick=()=>{const s=findS($('as').value),a=+$('am').value,k=$('ak').value,r=rate();if(!s||!a||!$('ad').value||(k=='VES'&&!r))return alert('Revisa estudiante, fecha, monto y tipo de cambio.');S.pay.push({id:Date.now(),s:s.i,d:$('ad').value,a,k,u:k=='USD'?a:a/r,r});$('am').value='';save()};
/* GitHub */
const gh=()=>JSON.parse(localStorage.gh||'{}'),url=g=>`https://api.github.com/repos/${g.o}/${g.r}/contents/${g.p||'data.json'}`,hd=g=>({Accept:'application/vnd.github+json',...(g.t?{Authorization:'Bearer '+g.t}:{})});
const setGH=()=>{localStorage.gh=JSON.stringify({o:$('go').value.trim(),r:$('gr').value.trim(),b:$('gb').value.trim(),p:$('gp').value.trim(),t:$('gt').value.trim()})},st=t=>$('gs').textContent=t;
async function ghGet(){const g=gh(),r=await fetch(url(g)+'?ref='+(g.b||'main'),{headers:hd(g),cache:'no-store'});if(!r.ok)throw Error('GitHub '+r.status);const j=await r.json();sha=j.sha;return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\s/g,'')),c=>c.charCodeAt(0))))}
async function ghPut(){const g=gh();try{await ghGet()}catch{}let s='';new TextEncoder().encode(JSON.stringify(S)).forEach(x=>s+=String.fromCharCode(x));const r=await fetch(url(g),{method:'PUT',headers:hd(g),body:JSON.stringify({message:'Actualización '+now(),content:btoa(s),branch:g.b||'main',...(sha?{sha}:{})})});if(!r.ok)throw Error('GitHub '+r.status+' '+(await r.text()).slice(0,120));sha=(await r.json()).content.sha;localStorage.removeItem('dirty');R()}
['go','gr','gb','gp','gt'].forEach(i=>$(i).onchange=setGH);
$('gsv').onclick=async()=>{setGH();st('Guardando…');try{await ghPut();st('Guardado en GitHub')}catch(x){st('Error: '+x.message)}};
$('gld').onclick=async()=>{setGH();st('Cargando…');try{S=norm(await ghGet());fillCfg();save();localStorage.removeItem('dirty');R();st('Datos cargados')}catch(x){st('Error: '+x.message)}};
$('rf').onclick=async()=>{try{S=norm(await ghGet());fillCfg();save();localStorage.removeItem('dirty');R()}catch(x){alert('No se pudo actualizar: '+x.message)}};
$('dj').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='data.json';a.click()};
/* UI */
document.querySelectorAll('.cx button').forEach(b=>b.onclick=()=>{cur=b.dataset.c;document.querySelectorAll('.cx button').forEach(x=>x.classList.toggle('on',x==b));R()});
$('qn').oninput=$('qc').oninput=R;['c1','c2','cs'].forEach(i=>['input','change'].forEach(v=>$(i).addEventListener(v,C)));
$('cvu').oninput=()=>$('cvb').value=($('cvu').value*rate()).toFixed(4);$('cvb').oninput=()=>$('cvu').value=rate()?($('cvb').value/rate()).toFixed(4):'';
(async()=>{const g=gh();[['o','go'],['r','gr'],['b','gb'],['p','gp'],['t','gt']].forEach(([k,i])=>$(i).value=g[k]||'');let d;
if(localStorage.dirty)try{d=JSON.parse(localStorage.S)}catch{}if(!d)try{if(g.o&&g.r)d=await ghGet()}catch{}if(!d)try{d=await(await fetch('data.json',{cache:'no-store'})).json()}catch{}if(!d)try{d=JSON.parse(localStorage.S)}catch{}
if(d)S=norm(d);cmo=now().slice(0,7);fillCfg();R()})();

function K(){$('cmp').innerHTML='<tr><th>Dólares</th><th>Bolívares a la tasa BCV</th></tr>'+[1,5,10,20,50,100,250,500].map(x=>`<tr><td>$ ${nf(x)}</td><td>Bs ${nr(x*rate())}</td></tr>`).join('')}
function rl(){$('rl').innerHTML='<tr><th>Fecha</th><th>Tasa BCV (Bs por $)</th></tr>'+[...S.rates].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,30).map(x=>`<tr><td>${x.d}</td><td>Bs ${nr(x.v)}</td></tr>`).join('')}
$('bcv').onclick=async()=>{$('bs').textContent='Consultando…';try{const j=await(await fetch('https://ve.dolarapi.com/v1/dolares/oficial')).json(),v=+(j.promedio||j.venta||j.compra);if(!v)throw 0;$('fr').value=v.toFixed(4);$('bs').textContent='Tasa traída ('+(j.fechaActualizacion||'').slice(0,10)+'). Revísala y pulsa «Registrar tasa del día».'}catch{$('bs').textContent='No se pudo consultar. Escribe la tasa de bcv.org.ve a mano.'}};
