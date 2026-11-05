
const D=new Proxy({},{get:(_,k)=>k=='addEventListener'?()=>{}:'',set:()=>true}),$=i=>document.getElementById(i)||D,pad=n=>String(n).padStart(2,'0'),e=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const DEF={fu:0,fb:0,fr:0,st:new Date().getFullYear()+'-09',dd:5};
let S={cfg:{...DEF},st:[],pay:[],rates:[]},cur='USD',grade='',sha=null,cmo='',ids=new Set();
const now=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const rate=()=>S.cfg.fr>0?S.cfg.fr:(S.cfg.fu>0?S.cfg.fb/S.cfg.fu:0);
const nf=n=>n.toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2}),nr=n=>n.toLocaleString('es-VE',{minimumFractionDigits:4,maximumFractionDigits:4});
const fmS=u=>cur=='USD'?'$'+Math.round(u).toLocaleString('es-VE'):'Bs '+(u*rate()).toLocaleString('es-VE',{notation:'compact',maximumFractionDigits:1}),U=u=>'$'+nf(u),B=u=>'Bs '+nf(u*rate()),fm=u=>cur=='USD'?U(u):B(u);
const mon=(a,b)=>{const r=[];let[y,m]=a.split('-').map(Number);const[y2,m2]=b.split('-').map(Number);while(y<y2||y==y2&&m<=m2){r.push(y+'-'+pad(m));if(++m>12){m=1;y++}}return r};
const due=m=>m+'-'+pad(S.cfg.dd),days=(a,b)=>Math.floor((Date.parse(b)-Date.parse(a))/864e5);
const tm=d=>d>=30?Math.floor(d/30)+' m '+d%30+' d':d+' d';
const LV=[{k:'pre',label:'Preescolar',gs:['Maternal','1er Grupo','2do Grupo','3er Grupo']},{k:'pri',label:'Educación Primaria',gs:['1er Grado','2do Grado','3er Grado','4to Grado','5to Grado','6to Grado']},{k:'med',label:'Media General',gs:['1er Año','2do Año','3er Año','4to Año','5to Año']}];
const ORD=LV.flatMap(l=>l.gs),SUF=['','1er','2do','3er','4to','5to','6to'],NUMW={primer:1,primero:1,segundo:2,tercer:3,tercero:3,cuarto:4,quinto:5,sexto:6};
const plain=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
/* Unifica «Grupo 1», «1er grupo», «Primer Grupo», «2do Año »… en un solo nombre por grado */
const normG=g=>{const p=plain(g);if(!p)return'';if(/maternal/.test(p))return'Maternal';const t=/grupo/.test(p)?'Grupo':/grado/.test(p)?'Grado':/\bano\b/.test(p)?'Año':'';let n=+(p.match(/\d/)||[0])[0];if(!n)for(const w in NUMW)if(new RegExp('\\b'+w+'\\b').test(p))n=NUMW[w];return t&&n>=1&&n<=6?SUF[n]+' '+t:String(g).replace(/\s+/g,' ').trim()};
const lvOf=g=>(LV.find(l=>l.gs.includes(g))||{k:'na'}).k,gName=g=>g||'Sin grado',NOG='∅',inG=s=>!grade||(grade==NOG?!s.g:s.g==grade);
const go=(a,b)=>(ORD.indexOf(a)+99)%99-(ORD.indexOf(b)+99)%99;
const norm=d=>({cfg:{...DEF,...d.cfg},st:(d.st||[]).map(s=>({...s,g:normG(s.g)})),pay:d.pay||[],rates:d.rates||[]});
const findS=v=>S.st.find(s=>s.n+' — '+s.c==v);
const save=()=>{localStorage.S=JSON.stringify(S);localStorage.dirty=1;R()};
function calc(s){const ms=mon(S.cfg.st,now().slice(0,7)),f=S.cfg.fu,ch=ms.length*f,pd=S.pay.filter(p=>p.s==s.i).reduce((a,p)=>a+p.u,0),acc=Math.max(0,ch-pd),k=f?Math.floor(pd/f+1e-9):0;let mora=0,since='';if(acc>.005&&k<ms.length&&due(ms[k])<=now()){since=due(ms[k]);mora=days(since,now())}return{acc,pd,mes:Math.min(f,acc),mora,since}}
let dropped=false;
/* Estante de grados: cada grado es un libro; su altura crece con la matrícula */
function chips(){
const all=S.st,dAll=all.reduce((a,s)=>a+calc(s).acc,0),mx=Math.max(1,...ORD.map(g=>all.filter(s=>s.g==g).length));
const book=(g,lab,key)=>{const l=all.filter(s=>key==NOG?!s.g:s.g==g),d=l.reduce((a,s)=>a+calc(s).acc,0),m=l.filter(s=>calc(s).mora).length,[n,...t]=lab.split(' '),v=key||g;
return`<button class="book${grade==v?' on':''}" style="--h:${Math.round(118+92*l.length/mx)}px" onclick="grade=grade=='${v}'?'':'${v}';R()" aria-pressed="${grade==v}" title="${e(lab)}: ${l.length} estudiantes, ${m} en mora"><span class="bn${n.length>4?' long':''}">${e(n)}</span><span class="bkt">${e(t.join(' '))}</span><span class="bc">${l.length}<small> est.</small></span><em>${fmS(d)}</em></button>`};
let h=`<div class="lib-top"><button class="allb${grade==''?' on':''}" onclick="grade='';R()">Todos los grados<b>${all.length}</b><em>${fm(dAll)}</em></button></div><div class="shelves${dropped?'':' intro'}">`;
for(const lv of LV){const gs=lv.gs.filter(g=>all.some(s=>s.g==g));if(!gs.length)continue;const l=all.filter(s=>gs.includes(s.g)),d=l.reduce((a,s)=>a+calc(s).acc,0);
h+=`<section class="shelf lv-${lv.k}" style="--n:${gs.length}"><div class="sh-h"><h3>${lv.label}</h3><span>${l.length} estudiantes</span><b>${fm(d)}</b></div><div class="books">${gs.map(g=>book(g,g)).join('')}</div></section>`}
const odd=[...new Set(all.filter(s=>s.g&&!ORD.includes(s.g)).map(s=>s.g))],nog=all.some(s=>!s.g);
if(odd.length||nog)h+=`<section class="shelf lv-na" style="--n:${odd.length+(nog?1:0)}"><div class="sh-h"><h3>Por asignar</h3><span>Revisa el grado en el Excel</span></div><div class="books">${odd.map(g=>book(g,g)).join('')}${nog?book('','Sin grado',NOG):''}</div></section>`;
$('chips').innerHTML=h+'</div>';dropped=true}
function R(){$('rt').textContent='Tasa BCV: Bs '+nr(rate())+(S.cfg.frd&&S.cfg.frd!=now()?' · desactualizada ('+S.cfg.frd+')':'')+(localStorage.dirty?' · cambios sin publicar':'');$('rt4').textContent=nr(rate());document.querySelectorAll('.pd').forEach(x=>x.textContent=new Date(now()+'T12:00').toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'}));
$('dl').innerHTML=S.st.map(s=>`<option value="${e(s.n)} — ${e(s.c)}">`).join('');chips();
const qn=$('qn').value.toLowerCase(),qc=$('qc').value.trim();
const L=S.st.filter(s=>inG(s)&&s.n.toLowerCase().includes(qn)&&String(s.c).includes(qc)).map(s=>({s,...calc(s)}));
$('kpi').innerHTML=[['Deuda acumulada',fm(L.reduce((a,x)=>a+x.acc,0)),'k-r'],['Abonado',fm(L.reduce((a,x)=>a+x.pd,0)),'k-g'],['En mora',L.filter(x=>x.mora).length,'k-o'],['Estudiantes',L.length,'k-b']].map(([a,b,c])=>`<div class="${c}"><span>${a}</span><b>${b}</b></div>`).join('')+(grade?`<p class="kf">Mostrando ${e(grade==NOG?'Sin grado':grade)}. <button onclick="grade='';R()">Ver todos</button></p>`:'');
$('tb').innerHTML=L.sort((a,b)=>b.mora-a.mora||b.acc-a.acc).map(x=>`<tr><td>${e(x.s.n)}</td><td>${e(x.s.c)}</td><td><span class="gd lv-${lvOf(x.s.g)}">${e(gName(x.s.g))}</span></td><td>${x.acc>0?fm(x.mes):'—'}</td><td class="${x.acc>0?'bad':'ok'}">${fm(x.acc)}</td><td>${x.pd?fm(x.pd):'—'}</td><td>${x.mora?`<span class="bad">${tm(x.mora)}</span> <span class="m">desde ${x.since}</span>`:'<span class="ok">Al día</span>'}</td></tr>`).join('');
topM();cal(L);pays();C();rl();K()}
function topM(){const gs=[...new Set(S.st.filter(inG).map(s=>s.g))].sort(go);$('top').innerHTML=gs.map(g=>{const l=S.st.filter(s=>s.g==g).map(s=>({s,...calc(s)})).filter(x=>x.mora>0).sort((a,b)=>b.mora-a.mora||b.acc-a.acc).slice(0,10);return l.length?`<div class="gr lv-${lvOf(g)}"><b>${e(gName(g))}</b>`+l.map((x,i)=>`<div class="row"><span>${i+1}. ${e(x.s.n)}</span><span class="bad">${tm(x.mora)} · ${fm(x.acc)}</span></div>`).join('')+'</div>':''}).join('')||'<p class="ok">Nadie está en mora.</p>'}
function cal(L){ids=new Set(L.map(x=>x.s.i));const[y,m]=cmo.split('-').map(Number),f=(new Date(y,m-1,1).getDay()+6)%7,n=new Date(y,m,0).getDate();let h=['L','M','M','J','V','S','D'].map(w=>`<div class="w">${w}</div>`).join('')+'<i></i>'.repeat(f);
for(let d=1;d<=n;d++){const ds=cmo+'-'+pad(d),ps=S.pay.filter(p=>p.d==ds&&ids.has(p.s)),t=ps.reduce((a,p)=>a+p.u,0);h+=`<div class="d${ps.length?' has':''}${d==S.cfg.dd?' due':''}" onclick="dl('${ds}')">${d}${ps.length?`<small>${fm(t)}</small>`:''}</div>`}
$('cal').innerHTML=h;$('cmt').textContent=new Date(y,m-1,1).toLocaleDateString('es',{month:'long',year:'numeric'})+'. El día con borde rojo es el vencimiento.'}
const mv=n=>{const[y,m]=cmo.split('-').map(Number),d=new Date(y,m-1+n,1);cmo=d.getFullYear()+'-'+pad(d.getMonth()+1);R()};
const dl=ds=>{const l=S.pay.filter(p=>p.d==ds&&ids.has(p.s));$('cd').innerHTML=`<p><b>${ds}</b></p>`+(l.map(p=>{const s=S.st.find(x=>x.i==p.s);return`<div class="row"><span>${e(s?s.n:p.s)}</span><span>${p.k=='USD'?U(p.a):'Bs '+nf(p.a)} (${U(p.u)})</span></div>`}).join('')||'Sin abonos')};
function pays(){$('pl').innerHTML=[...S.pay].sort((a,b)=>b.d.localeCompare(a.d)||b.id-a.id).slice(0,15).map(p=>{const s=S.st.find(x=>x.i==p.s);return`<tr><td>${p.d}</td><td>${e(s?s.n:p.s)}</td><td>${p.k=='USD'?U(p.a):'Bs '+nf(p.a)}</td><td>${U(p.u)}</td><td><button onclick="dp(${p.id})">Quitar</button></td></tr>`}).join('')}
const dp=id=>{
const p=S.pay.find(x=>x.id==id);if(!p)return;
const s=S.st.find(x=>x.i==p.s);
const ov=document.createElement('div');ov.className='modal-ov';
ov.innerHTML=`<div class="modal-box"><h3>¿Segur@ de eliminar este registro?</h3><p class="m">${e(s?s.n:p.s)} — ${p.d} — ${p.k=='USD'?U(p.a):'Bs '+nf(p.a)}</p><label>Contraseña del panel<input type="password" id="dpw" autocomplete="off"></label><div style="display:flex;gap:8px;margin-top:12px"><button class="pr" id="dpok">Eliminar</button><button id="dpno">Cancelar</button></div><span class="bad" id="dpe"></span></div>`;
document.body.appendChild(ov);ov.querySelector('#dpw').focus();
const close=()=>ov.remove();
ov.querySelector('#dpno').onclick=close;
ov.addEventListener('click',e=>{if(e.target===ov)close()});
ov.querySelector('#dpok').onclick=async()=>{
const pw=ov.querySelector('#dpw').value;
try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pw)),h=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
if(h==='37e0f1cbe10546702a69eefe28b31f8598b84bc0e220b69621e715594034db5e'){S.pay=S.pay.filter(p=>p.id!=id);save();close()}
else ov.querySelector('#dpe').textContent='Contraseña incorrecta'}catch{ov.querySelector('#dpe').textContent='Error de verificación'}};
ov.querySelector('#dpw').onkeydown=e=>{if(e.key=='Enter')ov.querySelector('#dpok').click()}};
function C(){const f=S.cfg.fu,ms=mon($('c1').value,$('c2').value),s=findS($('cs').value),t=ms.length*f,pd=s?calc(s).pd:0,dd=Math.max(0,t-pd);let a=0;
$('cr').innerHTML=`<table><tr><th>Mes</th><th>Cuota $</th><th>Cuota Bs</th><th>Acumulado $</th><th>Acumulado Bs</th></tr>`+ms.map(m=>{a+=f;return`<tr><td>${m}</td><td>${U(f)}</td><td>${B(f)}</td><td>${U(a)}</td><td>${B(a)}</td></tr>`}).join('')+`</table><p><b>Total ${ms.length} meses: ${U(t)} / ${B(t)}</b></p>`+(s?`<p>${e(s.n)} · abonado ${U(pd)} / ${B(pd)} · <b class="bad">Deuda: ${U(dd)} / ${B(dd)}</b></p>`:'')}
const fillCfg=()=>{const c=S.cfg;$('fu').value=c.fu||'';$('fb').value=c.fb||'';$('fr').value=c.fr||'';$('fs').value=c.st;$('fd').value=c.dd;$('c1').value=c.st;$('c2').value=now().slice(0,7);$('ad').value=now()};
/* Excel */
/* Lee la matrícula por el TÍTULO de cada columna (sirve el .xlsm interno y el .xlsx unificado) */
function parseXL(wb){
const tx=v=>typeof v=='number'?(Number.isInteger(v)?String(v):String(Math.round(v))):String(v??'').replace(/\s+/g,' ').trim();
let a,h=-1;for(const n of wb.SheetNames){a=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:''});h=a.findIndex(r=>r.some(c=>/^grados?$/.test(plain(c))));if(h>=0)break}
if(h<0)throw Error('No encontré la columna «Grado» o «Grados» en ninguna hoja.');
const H=a[h].map(plain),fi=(re,no)=>H.findIndex(x=>re.test(x)&&!(no&&no.test(x))),ced=/cedula|c\.? ?escolar|^c\.? ?i\.?$/;
const cR=fi(/represent/),cN=fi(/nombre/,/represent/),cG=fi(/^grados?$/);
if(cN<0)throw Error('No encontré la columna «Nombres y apellidos».');
const cC=H.findIndex((x,i)=>ced.test(x)&&!/represent/.test(x)&&(cR<0||i<cR)),cRC=H.findIndex((x,i)=>ced.test(x)&&(/represent/.test(x)||(cR>=0&&i>cR)));
const cF=fi(/fecha|unificada/,/lugar/),cDi=fi(/^dia$/),cMe=fi(/^mes$/),cAn=fi(/^ano$/),cE=fi(/^edad/),cX=fi(/^sexo/),cD=fi(/direcc/),cT=fi(/telef/);
const at=(r,i)=>i<0?'':r[i];
/* Si Excel convirtió «05/12/2023» (día/mes) como fecha mes/día, todas esas fechas tienen día ≤ 12 y conviven con textos día/mes: se invierten */
const dn=a.slice(h+1).map(r=>at(r,cF)).filter(v=>typeof v=='number'&&v>0).map(v=>XLSX.SSF.parse_date_code(v)),sw=dn.length&&dn.every(p=>p.d<=12)&&a.slice(h+1).some(r=>/^(1[3-9]|2\d|3[01])\/\d{1,2}\/\d{4}$/.test(tx(at(r,cF))));
const fd=r=>{const v=at(r,cF);if(typeof v=='number'&&v>0){const p=XLSX.SSF.parse_date_code(v);return sw?pad(p.m)+'/'+pad(p.d)+'/'+p.y:pad(p.d)+'/'+pad(p.m)+'/'+p.y}if(tx(v))return tx(v);const d=tx(at(r,cDi)),m=tx(at(r,cMe)),y=tx(at(r,cAn));return d&&m&&y?pad(d)+'/'+pad(m)+'/'+y:''};
const seen={},st=[],warn={nog:[],noc:0,age:0};
for(const r of a.slice(h+1)){const n=tx(at(r,cN));if(!n||plain(n)==H[cN])continue;
const c=tx(at(r,cC)),g=normG(at(r,cG));let i=c||String(at(r,cN)).trim();if(seen[i])i+='-'+(seen[i]++);else seen[i]=1;
let ed=tx(at(r,cE));if(!(+ed>0&&+ed<30)){if(ed)warn.age++;ed=''}
if(!g)warn.nog.push(n);if(!c)warn.noc++;
st.push({i,n,c,f:fd(r),e:ed,x:tx(at(r,cX)).toUpperCase(),g,r:tx(at(r,cR)),rc:tx(at(r,cRC)),d:tx(at(r,cD)),t:tx(at(r,cT))})}
return{st,warn}}
$('xl').onchange=async ev=>{const f=ev.target.files[0];if(!f)return;const o=$('xs');o.className='xl-r';o.textContent='Leyendo…';
try{const{st,warn}=parseXL(XLSX.read(await f.arrayBuffer()));if(!st.length)throw Error('El archivo no tiene estudiantes debajo de los títulos.');
const ids=new Set(st.map(s=>s.i)),lost=S.pay.filter(p=>!ids.has(p.s)).length;S.st=st;save();
const cnt=LV.map(l=>[l.label,st.filter(s=>l.gs.includes(s.g)).length]).filter(x=>x[1]);
o.innerHTML=`<p class="ok">${st.length} estudiantes cargados de «${e(f.name)}».</p><ul>${cnt.map(([a,b])=>`<li>${a}: <b>${b}</b></li>`).join('')}</ul>`+
(warn.nog.length?`<p class="bad">Sin grado (${warn.nog.length}): ${warn.nog.map(e).join(', ')}. Aparecen en el estante «Por asignar».</p>`:'')+
(warn.noc?`<p class="m">${warn.noc} sin cédula escolar: se identifican por su nombre.</p>`:'')+(warn.age?`<p class="m">${warn.age} con edad vacía o inválida (se dejó en blanco).</p>`:'')+
(lost?`<p class="bad">${lost} abonos quedaron sin estudiante: revisa si cambió alguna cédula.</p>`:'')+`<p>Pulsa «Guardar en GitHub» para publicarlos.</p>`}
catch(x){o.innerHTML=`<p class="bad">${e(x.message||x)}</p>`}ev.target.value=''};
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
