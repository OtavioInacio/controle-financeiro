const KEY='controle-financeiro-v2',OLD='controle-financeiro-v1';
const uid=()=>Math.random().toString(36).slice(2,9);
const planProg=i=>i.plan?(i.quitrow?100:Math.min(100,(i.n-1+(i.paid?1:0))/i.T*100)):null;
const S=[
 {id:'rec',name:'Recebimentos',kind:'in',color:'var(--in)',lead:'Salário, renda extra e tudo que entra neste mês.',noun:'recebimento',
  f:[['desc','Descrição','t'],['valor','Valor (R$)','m'],['dia','Dia','d']],amt:i=>i.valor,sub:i=>i.dia?'Dia '+i.dia:'',lbl:'Recebido'},
 {id:'fix',name:'Gastos fixos',kind:'out',color:'var(--c-fix)',lead:'Aluguel, luz, internet, assinaturas: contas que se repetem todo mês.',noun:'gasto fixo',
  f:[['desc','Descrição','t'],['valor','Valor (R$)','m'],['dia','Vence dia','d']],amt:i=>i.valor,sub:i=>i.dia?'Vence dia '+i.dia:'',lbl:'Pago'},
 {id:'card',name:'Cartões de crédito',kind:'out',color:'var(--c-card)',lead:'Informe quantas parcelas faltam, contando este mês. Com 2 ou mais, a compra aparece nos próximos meses até acabar.',noun:'compra no cartão',
  f:[['cartao','Cartão','t'],['desc','Compra','t'],['valor','Valor da parcela (R$)','m'],['rest','Nº de parcelas restantes','n'],['tot','Total de parcelas (opcional)','n']],amt:i=>i.valor,
  sub:i=>i.quitrow?'Quitação das parcelas restantes':(i.cartao||'Cartão')+(i.plan?' · parcela '+i.n+' de '+i.T:''),prog:planProg,lbl:'Pago'},
 {id:'emp',name:'Empréstimos',kind:'out',color:'var(--c-emp)',lead:'Informe quantas parcelas faltam, contando este mês. Com 2 ou mais, a parcela aparece nos próximos meses até acabar.',noun:'empréstimo',
  f:[['desc','Empréstimo / banco','t'],['valor','Parcela (R$)','m'],['rest','Nº de parcelas restantes','n'],['tot','Total de parcelas (opcional)','n'],['dia','Vence dia','d']],amt:i=>i.valor,
  sub:i=>i.quitrow?'Quitação das parcelas restantes':(i.plan?'Parcela '+i.n+' de '+i.T:'')+(i.dia?(i.plan?' · vence dia ':'Vence dia ')+i.dia:''),prog:planProg,lbl:'Pago'},
 {id:'div',name:'Dívidas',kind:'out',color:'var(--c-div)',special:1},
 {id:'misc',name:'Diversos',kind:'out',color:'var(--c-misc)',lead:'Mercado, lazer, transporte e gastos que não se encaixam nas outras listas.',noun:'gasto',
  f:[['desc','Descrição','t'],['valor','Valor (R$)','m'],['dia','Dia','d']],amt:i=>i.valor,sub:i=>i.dia?'Dia '+i.dia:'',lbl:'Pago'}
];
const pad=n=>String(n).padStart(2,'0');
const nowYm=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const shift=(k,n)=>{const[y,m]=k.split('-').map(Number);const d=new Date(y,m-1+n,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const mlabel=k=>{const[y,m]=k.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})};
const blank=()=>{const o={};S.forEach(s=>{if(!s.special)o[s.id]=[]});return o};
let ym=nowYm(),tab='resumo',armed=false,armDel=null,data={months:{},debts:[],plans:[]};
try{const raw=localStorage.getItem(KEY);
 if(raw){const p=JSON.parse(raw);if(p&&p.months)data=p}
 else{const old=localStorage.getItem(OLD);if(old){const p=JSON.parse(old),m=blank();Object.keys(m).forEach(k=>{if(Array.isArray(p[k]))m[k]=p[k]});data.months[ym]=m;
  (p.div||[]).forEach(i=>data.debts.push({id:uid(),desc:i.desc,total:i.total||i.valor||0,parcela:i.valor||0,ja:0,pays:i.paid?[{ym,v:i.valor||0}]:[]}))}}
}catch(e){}
const brl=v=>(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
function num(t){t=String(t||'').trim();if(!t)return 0;if(t.includes(','))t=t.replace(/\./g,'').replace(',','.');const v=parseFloat(t);return isNaN(v)?0:v}
const own=(id,k=ym)=>(data.months[k]||{})[id]||[];
const pidx=(p,k)=>{const[a,b]=p.start.split('-').map(Number),[c,d]=k.split('-').map(Number);return(c-a)*12+(d-b)};
const list=(id,k=ym)=>{const o=own(id,k).slice();if(id!=='card'&&id!=='emp')return o;
 data.plans.filter(p=>p.sec===id).forEach(p=>{const i=pidx(p,k),q=p.quit;if(i<0||i>=p.tot||(q&&k>q.ym))return;const off=p.off||0;
  o.push({plan:p.id,desc:p.desc,cartao:p.cartao,valor:p.valor,dia:p.dia,paid:p.paid.includes(k),n:off+i+1,T:off+p.tot,canq:!q&&i<p.tot-1,rem:(p.tot-1-i)*p.valor});
  if(q&&k===q.ym&&q.v>0)o.push({plan:p.id,quitrow:1,desc:p.desc,cartao:p.cartao,valor:q.v,paid:true,n:off+p.tot,T:off+p.tot})});return o};
const ownItems=k=>S.some(s=>!s.special&&own(s.id,k).length);
const dpaid=d=>(d.ja||0)+d.pays.reduce((a,p)=>a+p.v,0);
const dmonth=(k=ym)=>data.debts.reduce((a,d)=>a+d.pays.filter(p=>p.ym===k).reduce((b,p)=>b+p.v,0),0);
const sum=(id,only,k=ym)=>{if(id==='div')return only?0:dmonth(k);const s=S.find(x=>x.id===id);return list(id,k).filter(i=>only?!i.paid:true).reduce((a,i)=>a+(s.amt(i)||0),0)};
function totals(k=ym){const rec=sum('rec',0,k),outs=S.filter(s=>s.kind==='out');const out=outs.reduce((a,s)=>a+sum(s.id,0,k),0),pend=outs.reduce((a,s)=>a+sum(s.id,1,k),0);return{rec,out,pend,saldo:rec-out}}
function dstat(d){const p=dpaid(d),r=Math.max(0,d.total-p),pc=d.total>0?Math.min(100,p/d.total*100):0;let st,c;
 if(r<=0.005&&d.total>0){st='Quitada';c='var(--in)'}else if(pc>=80){st='Quase quitada';c='var(--warn)'}else if(p>0){st='Em andamento';c='var(--accent)'}else{st='Não iniciada';c='var(--muted)'}
 return{p,r,pc,st,c}}
const hasItems=k=>S.some(s=>!s.special&&list(s.id,k).length);
const prevKey=()=>Object.keys(data.months).filter(k=>k<ym&&ownItems(k)).sort().pop();
function copyPrev(k){const m=data.months[ym]=blank();S.forEach(s=>{if(s.special||['misc','card','emp'].includes(s.id))return;own(s.id,k).forEach(i=>m[s.id].push(Object.assign({},i,{paid:false})))});save()}
function monthBar(){const pv=prevKey();
 return `<div class="mbar"><button class="mb" data-act="mp" aria-label="Mês anterior">‹</button><span class="ml">${mlabel(ym)}</span><button class="mb" data-act="mn" aria-label="Próximo mês">›</button>`+
 (ym!==nowYm()?'<button class="lnk" data-act="today">Ir para o mês atual</button>':'')+
 (pv&&!ownItems(ym)?`<button class="btn sm" data-act="copy" data-k="${pv}">Copiar de ${mlabel(pv)}</button>`:'')+'</div>'}
function renderTabs(){
 const mk=(id,name,small,color)=>`<button class="tab" data-tab="${id}" style="--tc:${color}" ${tab===id?'aria-current="true"':''}><span>${name}</span><small>${small}</small></button>`;
 const q=data.debts.filter(d=>dstat(d).st==='Quitada').length;
 document.getElementById('tabs').innerHTML=mk('resumo','Resumo','','var(--accent)')+S.map(s=>mk(s.id,s.name,s.special?q+'/'+data.debts.length+' quitadas':brl(sum(s.id)),s.color)).join('')}
function renderResumo(){
 const T=totals(),outs=S.filter(s=>s.kind==='out'),base=Math.max(T.rec,T.out,1);
 const bar=outs.map(s=>{const v=sum(s.id);return v>0?`<span style="width:${v/base*100}%;background:${s.color}" title="${s.name}: ${brl(v)}"></span>`:''}).join('');
 const note=T.out===0&&T.rec===0?'Adicione recebimentos e gastos para ver o mapa do mês.':T.out>T.rec?'As saídas passam dos recebimentos em '+brl(T.out-T.rec)+'.':'A barra inteira representa seus recebimentos de '+brl(T.rec)+'.';
 const rows=outs.map(s=>{const v=sum(s.id);const n=s.special?data.debts.length:list(s.id).length;
  const sub=s.special?data.debts.filter(d=>dstat(d).st==='Quitada').length+' de '+n+' quitadas':n+(n===1?' item':' itens');
  return `<div class="row"><span class="dot" style="background:${s.color}"></span><div class="grow"><b>${s.name}</b><small>${sub}</small></div><span class="amt">${brl(v)}</span><span class="pct">${T.rec?Math.round(v/T.rec*100)+'%':'–'}</span></div>`}).join('');
 const keys=[...new Set([...Object.keys(data.months),...data.plans.flatMap(p=>Array.from({length:p.tot},(_,i)=>shift(p.start,i))),...data.debts.flatMap(d=>d.pays.map(p=>p.ym))])].filter(k=>k<=nowYm()&&(hasItems(k)||dmonth(k)>0)).sort().reverse().slice(0,12);
 const hist=keys.length>1?`<h3>Meses registrados</h3><div class="rows">`+keys.map(k=>{const t=totals(k);return `<button class="row hrow" data-act="go" data-k="${k}"><div class="grow"><b>${mlabel(k)}</b><small>Entrou ${brl(t.rec)} · saiu ${brl(t.out)}</small></div><span class="amt ${t.saldo>=0?'pos':'neg'}">${brl(t.saldo)}</span></button>`}).join('')+'</div>':'';
 return `<h2>Resumo do mês</h2><p class="lead">Tudo que você registrou em ${mlabel(ym)}.</p>
 <div class="hero"><div>${T.saldo>=0?'Sobra no mês':'Falta no mês'}</div><div class="big ${T.saldo>=0?'pos':'neg'}">${brl(Math.abs(T.saldo))}</div><div class="bar">${bar}</div><div class="bar-note">${note}</div></div>
 <div class="stats" style="margin-top:14px"><div class="stat"><small>Recebimentos</small><b class="pos">${brl(T.rec)}</b></div><div class="stat"><small>Total de saídas</small><b class="neg">${brl(T.out)}</b></div><div class="stat"><small>Ainda falta pagar</small><b>${brl(T.pend)}</b></div></div>
 <div class="rows">${rows}</div>${hist}
 <p class="foot">Os dados ficam salvos neste navegador. <button data-act="reset">${armed?'Clique de novo para apagar tudo':'Apagar tudo'}</button></p>`}
function field(k,l,ty){return `<div><label for="f-${k}">${l}</label><input id="f-${k}" type="text" autocomplete="off" ${ty==='t'?'':'inputmode="'+(ty==='m'?'decimal':'numeric')+'"'}></div>`}
function renderSection(s){
 const L=list(s.id),total=sum(s.id),pend=sum(s.id,1);
 const items=L.length?L.map((i,n)=>{const pc=s.prog?s.prog(i):null,key='p'+i.plan;
  const q=i.canq?`<button class="lnk" data-act="pquit" data-n="${n}">Quitar o restante (${brl(i.rem)})</button>`:'';
  const x=i.quitrow?`<button class="del" data-act="pundo" data-n="${n}" aria-label="Desfazer quitação" title="Desfazer quitação">×</button>`:`<button class="del" data-act="del" data-n="${n}" aria-label="Remover" title="${i.plan?'Remover o parcelamento de todos os meses':'Remover'}">${armDel===key?'<small>Remover em todos os meses?</small>':'×'}</button>`;
  return `<div class="row ${i.paid&&!i.quitrow?'done':''}"><button class="chk ${i.paid?'on':''}" data-act="paid" data-n="${n}" aria-label="Marcar como ${s.lbl.toLowerCase()}" title="${s.lbl}">${i.paid?'✓':''}</button><div class="grow"><b>${i.quitrow?'Quitação: ':''}${esc(i.desc)||'Sem descrição'}</b><small>${esc(s.sub(i))}</small>${pc!=null?`<div class="mini"><i style="width:${pc}%"></i></div>`:''}${q}</div><span class="amt">${brl(s.amt(i))}</span>${x}</div>`}).join(''):`<div class="empty">Nenhum ${s.noun} em ${mlabel(ym)}. Preencha os campos acima e clique em Adicionar.</div>`;
 return `<h2>${s.name}</h2><p class="lead">${s.lead}</p>
 <div class="stats"><div class="stat"><small>Total do mês</small><b>${brl(total)}</b></div><div class="stat"><small>${s.kind==='in'?'Falta receber':'Falta pagar'}</small><b>${brl(pend)}</b></div></div>
 <div class="add">${s.f.map(x=>field(...x)).join('')}<button class="btn" data-act="add">Adicionar</button></div>
 <div class="rows" style="margin-top:0">${items}</div>`}
function renderDebts(){
 const ds=data.debts.map(d=>({d,s:dstat(d)})).sort((a,b)=>(a.s.st==='Quitada')-(b.s.st==='Quitada')||b.s.pc-a.s.pc);
 const tot=ds.reduce((a,x)=>a+x.d.total,0),pg=ds.reduce((a,x)=>a+x.s.p,0),q=ds.filter(x=>x.s.st==='Quitada').length,pc=tot?Math.min(100,pg/tot*100):0;
 const cards=ds.length?ds.map(({d,s})=>{const par=d.parcela>0&&s.r>0?' · ~'+Math.ceil(s.r/d.parcela)+' parcelas':'';
  return `<div class="dcard"><div class="dh"><div class="grow"><b>${esc(d.desc)}</b><small>Total ${brl(d.total)}${d.parcela?' · parcela '+brl(d.parcela):''}</small></div><span class="badge" style="--bc:${s.c}">${s.st}</span><button class="del" data-act="ddel" data-id="${d.id}" aria-label="Remover dívida">×</button></div>
  <div class="pbar"><i style="width:${s.pc}%;background:${s.c}"></i></div>
  <div class="pinfo"><span>${s.pc.toFixed(0)}% pago · ${brl(s.p)}</span><span>${s.r>0?'Falta '+brl(s.r)+par:'Nada a pagar'}</span></div>
  ${s.r>0?`<div class="payrow"><input data-id="${d.id}" id="pay-${d.id}" inputmode="decimal" placeholder="Valor (R$)" aria-label="Valor do pagamento"><button class="btn sm" data-act="dpay" data-id="${d.id}">Registrar pagamento</button><button class="lnk" data-act="dquit" data-id="${d.id}">Quitar tudo (${brl(s.r)})</button></div>`:'<div class="okmsg">Dívida quitada. Parabéns!</div>'}
  ${d.pays.length?'<div class="hist">'+d.pays.map((p,j)=>`<span>${mlabel(p.ym).slice(0,3)}/${p.ym.slice(2,4)}: ${brl(p.v)} <button data-act="dpdel" data-id="${d.id}" data-j="${j}" aria-label="Remover pagamento">×</button></span>`).join('')+'</div>':''}</div>`}).join(''):'<div class="empty">Nenhuma dívida cadastrada. Preencha os campos acima e clique em Adicionar.</div>';
 return `<h2>Dívidas</h2><p class="lead">Cadastre cada dívida uma vez e registre os pagamentos mês a mês. Pagamentos entram em ${mlabel(ym)}.</p>
 <div class="stats"><div class="stat"><small>Total em dívidas</small><b>${brl(tot)}</b></div><div class="stat"><small>Já pago</small><b class="pos">${brl(pg)}</b></div><div class="stat"><small>Falta pagar</small><b class="neg">${brl(Math.max(0,tot-pg))}</b></div><div class="stat"><small>Quitadas</small><b>${q} de ${ds.length}</b></div></div>
 ${ds.length?`<div class="pbar" style="height:14px"><i style="width:${pc}%"></i></div><p class="bar-note" style="margin:0 0 16px">${pc.toFixed(0)}% de tudo que você devia já foi pago. Pago em ${mlabel(ym)}: ${brl(dmonth())}.</p>`:''}
 <div class="add">${field('desc','Credor / dívida','t')}${field('total','Valor total (R$)','m')}${field('parcela','Parcela (R$, opcional)','m')}${field('ja','Já paguei antes (R$)','m')}<button class="btn" data-act="add">Adicionar</button></div>${cards}`}
function render(){renderTabs();
 const s=S.find(x=>x.id===tab);
 document.getElementById('main').innerHTML=monthBar()+(tab==='resumo'?renderResumo():s.special?renderDebts():renderSection(s))}
function addDebt(){const g=k=>document.getElementById('f-'+k).value.trim();const desc=g('desc'),total=num(g('total'));
 if(!desc||!total){document.getElementById(desc?'f-total':'f-desc').focus();return}
 data.debts.push({id:uid(),desc,total,parcela:num(g('parcela')),ja:Math.min(num(g('ja')),total),pays:[]});save();render();document.getElementById('f-desc').focus()}
function add(){
 if(tab==='div')return addDebt();
 const s=S.find(x=>x.id===tab),it={};
 s.f.forEach(([k,l,ty])=>{const v=document.getElementById('f-'+k).value.trim();it[k]=ty==='m'?num(v):ty==='t'?v:Math.max(0,parseInt(v)||0)});
 if(!it.desc&&!it.valor){document.getElementById('f-'+s.f[0][0]).focus();return}
 if(it.dia>31)it.dia=31;
 if((s.id==='card'||s.id==='emp')&&it.rest>1)data.plans.push({id:uid(),sec:s.id,desc:it.desc,cartao:it.cartao||'',valor:it.valor,dia:it.dia||0,start:ym,tot:it.rest,off:it.tot>it.rest?it.tot-it.rest:0,paid:[],quit:null});else(data.months[ym]||(data.months[ym]=blank()))[s.id].push(it);save();render();document.getElementById('f-'+s.f[0][0]).focus()}
function pay(id,all){const d=data.debts.find(x=>x.id===id);if(!d)return;const r=Math.max(0,d.total-dpaid(d));
 const v=all?r:Math.min(num(document.getElementById('pay-'+id).value),r);if(v<=0)return;
 d.pays.push({ym,v:Math.round(v*100)/100});save();render()}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-tab],[data-act]');if(!t)return;const D=t.dataset;
 if(D.tab){tab=D.tab;armed=false;armDel=null;render();window.scrollTo(0,0);return}
 const a=D.act;if(a!=='del')armDel=null;
 if(a==='add')add();
 else if(a==='paid'){const it=list(tab)[+D.n];if(it.quitrow)return;if(it.plan){const p=data.plans.find(x=>x.id===it.plan),j=p.paid.indexOf(ym);j<0?p.paid.push(ym):p.paid.splice(j,1)}else it.paid=!it.paid;save();render()}
 else if(a==='del'){const it=list(tab)[+D.n];if(it.plan){if(armDel!=='p'+it.plan){armDel='p'+it.plan;render();return}data.plans=data.plans.filter(x=>x.id!==it.plan);armDel=null}else{const A=own(tab);A.splice(A.indexOf(it),1)}save();render()}
 else if(a==='pquit'){const it=list(tab)[+D.n],p=data.plans.find(x=>x.id===it.plan);if(!p.paid.includes(ym))p.paid.push(ym);p.quit={ym,v:it.rem};save();render()}
 else if(a==='pundo'){const it=list(tab)[+D.n];data.plans.find(x=>x.id===it.plan).quit=null;save();render()}
 else if(a==='mp'){ym=shift(ym,-1);render()}
 else if(a==='mn'){ym=shift(ym,1);render()}
 else if(a==='today'){ym=nowYm();render()}
 else if(a==='copy'){copyPrev(D.k);render()}
 else if(a==='go'){ym=D.k;tab='resumo';render();window.scrollTo(0,0)}
 else if(a==='dpay')pay(D.id,false);
 else if(a==='dquit')pay(D.id,true);
 else if(a==='ddel'){data.debts=data.debts.filter(x=>x.id!==D.id);save();render()}
 else if(a==='dpdel'){data.debts.find(x=>x.id===D.id).pays.splice(+D.j,1);save();render()}
 else if(a==='reset'){if(!armed){armed=true;render();return}data={months:{},debts:[],plans:[]};armed=false;save();render()}
});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;
 if(e.target.matches('.add input'))add();else if(e.target.matches('.payrow input'))pay(e.target.dataset.id,false)});
function migrate(){if(!data.plans)data.plans=[];let ch=0;
 Object.keys(data.months).sort().forEach(k=>['card','emp'].forEach(id=>{const L=(data.months[k]||{})[id];if(!L)return;
  data.months[k][id]=L.filter(i=>{if(!(i.rest>1))return true;
   const dup=data.plans.some(p=>p.sec===id&&p.desc===i.desc&&(p.cartao||'')===(i.cartao||'')&&p.valor===i.valor&&pidx(p,k)>=0&&pidx(p,k)<p.tot);
   if(!dup)data.plans.push({id:uid(),sec:id,desc:i.desc,cartao:i.cartao||'',valor:i.valor,dia:i.dia||0,start:k,tot:i.rest,off:i.tot>i.rest?i.tot-i.rest:0,paid:i.paid?[k]:[],quit:null});
   ch=1;return false})}));
 if(ch)save()}
migrate();
render();
