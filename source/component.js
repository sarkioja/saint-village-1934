
const LS = 'sv-cronica-v2';
const TABS = [['cronica','Crônica'],['caso','Caso'],['ficha','Ficha'],['elenco','Elenco'],['cidade','Cidade'],['seculo','Século'],['tutorial','Como jogar']];
const R = () => window.SV_REGRAS, L = () => window.SV_LIVROS, S = () => window.SV_SECULO;
const ERAS = ['1934','1946','1974','1994','1999'];
const modsOf = e => (window.SV_REGRAS && window.SV_REGRAS[e] && window.SV_REGRAS[e].mods) || [];
const triCount = fios => { const E=new Set(), V=new Set(); (fios||[]).filter(f=>f.st==='firme').forEach(f=>{E.add(f.a+'|'+f.b);E.add(f.b+'|'+f.a);V.add(f.a);V.add(f.b);}); const v=[...V]; let n=0; for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++)for(let k=j+1;k<v.length;k++) if(E.has(v[i]+'|'+v[j])&&E.has(v[j]+'|'+v[k])&&E.has(v[i]+'|'+v[k])) n++; return n; };
const SV_ROLLS = [];
const rnd = n => { const v = 1 + Math.floor(Math.random()*n); if(SV_ROLLS.length<40) SV_ROLLS.push({n,v}); return v; };
const SV_PIPS = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function svToast(msg){
  try{
    const old=document.querySelector('.sv-toast'); if(old) old.remove();
    const el=document.createElement('div'); el.className='sv-toast'; el.setAttribute('role','status'); el.textContent=msg;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.style.animation='none';
    document.body.appendChild(el); setTimeout(()=>el.remove(),2300);
  }catch(e){}
}
function svThrowDice(rolls){
  try{
    if(!rolls.length) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stage=document.getElementById('svd-stage');
    if(stage) stage.remove();
    stage=document.createElement('div'); stage.id='svd-stage'; stage.className='svd-stage';
    document.body.appendChild(stage);
    const W=window.innerWidth, H=window.innerHeight;
    const n=Math.min(rolls.length,10), S=n>4?54:n>1?64:78;
    const tx=W*(0.22+Math.random()*0.56), ty=H*(0.30+Math.random()*0.45);
    const fromLeft=Math.random()<0.5;
    const FACE={1:[0,0],6:[0,180],3:[0,-90],4:[0,90],2:[-90,0],5:[90,0]};
    const dur=1500;
    rolls.slice(0,10).forEach((r,i)=>{
      const ang=i*2.4, rad=n>1?S*0.62*Math.sqrt(i+0.6):0;
      const ex=tx+Math.cos(ang)*rad-S/2, ey=ty+Math.sin(ang)*rad-S/2;
      const sx=fromLeft?-S*2-Math.random()*80:W+S+Math.random()*80, sy=H*(0.55+Math.random()*0.5);
      const sh=document.createElement('div'); sh.className='svd-shadow'; sh.style.setProperty('--s',S+'px');
      const wrap=document.createElement('div'); wrap.className='svd-wrap'; wrap.style.setProperty('--s',S+'px');
      const cube=document.createElement('div'); cube.className=r.n===6?'svd-cube':'svd-chip';
      if(r.n===6){
        const core=['','rotateY(90deg)','rotateX(90deg)'].map(tf=>'<div class="svd-core" style="transform:'+tf+'"></div>').join('');
        const faces=[[1,'translateZ(var(--h))'],[6,'rotateY(180deg) translateZ(var(--h))'],[3,'rotateY(90deg) translateZ(var(--h))'],[4,'rotateY(-90deg) translateZ(var(--h))'],[2,'rotateX(90deg) translateZ(var(--h))'],[5,'rotateX(-90deg) translateZ(var(--h))']]
          .map(([v,tf])=>'<div class="svd-face" style="transform:'+tf+'">'+Array.from({length:9},(_,k)=>'<span class="svd-pip'+(SV_PIPS[v].includes(k)?(v===1?' on red':' on'):'')+'"></span>').join('')+'</div>').join('');
        cube.innerHTML=core+faces; cube.style.setProperty('--h',(S/2)+'px');
      } else {
        cube.innerHTML='<div class="svd-chipface">'+r.v+'</div><div class="svd-chipface back">'+r.v+'</div>';
      }
      wrap.appendChild(cube); stage.appendChild(sh); stage.appendChild(wrap);
      const L=(a,b,p)=>a+(b-a)*p;
      const path=[[0,0,1.9],[.40,.78,1],[.56,.9,1.24],[.72,.97,1],[.82,.99,1.08],[.9,1,1],[1,1,1]];
      const d=i*45;
      wrap.animate(path.map(([o,p,sc],k)=>({offset:o,transform:`translate(${L(sx,ex,p)}px,${L(sy,ey,p)}px) scale(${sc})`,easing:k%2===0?'cubic-bezier(.4,0,.9,.6)':'cubic-bezier(.1,.4,.6,1)'})),{duration:dur,delay:d,fill:'both'});
      sh.animate(path.map(([o,p,sc])=>{ const h=sc-1; return {offset:o,transform:`translate(${L(sx,ex,p)+6+h*70}px,${L(sy,ey,p)+10+h*90}px) scale(${1+h*0.55})`,opacity:Math.max(0.25,0.9-h*0.9),filter:`blur(${4+h*14}px)`}; }),{duration:dur,delay:d,fill:'both'});
      const rz=Math.round(Math.random()*360-180);
      if(r.n===6){
        const [fx,fy]=FACE[r.v];
        const kx=(2+Math.floor(Math.random()*2))*360*(Math.random()<.5?-1:1), ky=(3+Math.floor(Math.random()*2))*360*(Math.random()<.5?-1:1);
        cube.animate([
          {offset:0,transform:`rotateZ(${rz+400}deg) rotateX(${fx+kx}deg) rotateY(${fy+ky}deg)`},
          {offset:.4,transform:`rotateZ(${rz+120}deg) rotateX(${fx+kx*0.3}deg) rotateY(${fy+ky*0.35}deg)`},
          {offset:.75,transform:`rotateZ(${rz+14}deg) rotateX(${fx+(kx>0?28:-28)}deg) rotateY(${fy+(ky>0?22:-22)}deg)`},
          {offset:.9,transform:`rotateZ(${rz}deg) rotateX(${fx}deg) rotateY(${fy}deg)`},
          {offset:1,transform:`rotateZ(${rz}deg) rotateX(${fx}deg) rotateY(${fy}deg)`}
        ],{duration:dur,delay:d,fill:'both',easing:'cubic-bezier(.2,.6,.3,1)'});
      } else {
        cube.animate([{transform:`rotateZ(${rz+900}deg) rotateY(1440deg)`},{offset:.9,transform:`rotateZ(${rz}deg) rotateY(0deg)`},{transform:`rotateZ(${rz}deg) rotateY(0deg)`}],{duration:dur,delay:d,fill:'both',easing:'cubic-bezier(.2,.6,.3,1)'});
      }
    });
    const kill=()=>{ if(!stage.isConnected) return; stage.animate([{opacity:1},{opacity:0}],{duration:450,fill:'forwards'}).onfinish=()=>stage.remove(); };
    stage.addEventListener('click',kill);
    stage._t=setTimeout(kill,dur+3800);
  }catch(e){}
}
const pick = a => a[Math.floor(Math.random()*a.length)];
const uid = () => Math.random().toString(36).slice(2,9);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
const sign = n => (n>0?'+':n<0?'−':'') + Math.abs(n);
function invList(era){ const r=R(); return [...r.comum.invAcad, ...r.comum.invInter, ...(r[era].invInterExtra||[]), ...r[era].invTec]; }
function blankChar(era){ const inv={}; invList(era).forEach(k=>inv[k]=1); return {nome:'',conceito:'',arq:'',ori:'',mot:'',lado:'Contrato',inv,esp:[],saude:8,sf:8,med:7,imp:4,adr:1,vicioTr:0,imprensa:0,ficha:0,ruido:0,medalha:'',anoNasc:'',lacoEra:'',lacoDe:'',herancas:'',testamento:'',antepassado:'',regras:'',fontes:'',vicio:'',segredo:'',equip:'',notas:''}; }
function blankCaso(){ return {titulo:'',premissa:'',segredo:'',pistas:[],provas:[],vant:[],prob:[],nec:4,fios:[],medalhaUsos:0,flash:false,jaVi:false}; }
function blankEra(era){ return {char:blankChar(era),log:[],caso:blankCaso(),cena:'',naCena:[],custom:[]}; }
function load(){ try{ const s=JSON.parse(localStorage.getItem(LS)); if(s&&s.eras) return s; }catch(e){} return null; }
const stateOf = (v,kind) => kind==='saude' ? (v>0?'Inteiro':v>-6?'Ferido':v>-12?'Gravemente ferido':'Morto') : (v>0?'Inteiro':v>-6?'Abalado':v>-12?'Marcado':'Quebrado');

class Component extends DCLogic {
  state = Object.assign({ era:null, tab:'cronica', eras:{} }, load()||{}, {
    ready:false, draft:'', mode:'acao', talkTo:'', busy:false, soloHab:'Atletismo', soloMod:0,
    gold:{gasto:0,dif:4}, danoArma:'2', qr:false, choqueI:'0', livre:{n:1}, diceRes:null,
    npcQ:'', npcReg:'', npcForm:{nome:'',papel:'',desc:''}, pistaDraft:'', provaDraft:'', provaPeso:'2', showSeg:false, fioA:'', fioB:'', fioRel:'', futuro:false, saltoEra:'' });
  logRef = React.createRef();
  // ---------- Mapa da cidade: navegação (arrastar, roda, + e −) ----------
  mapVp = null; mapInEl = null; _mapDrag = null;
  mapVpRef = el => { if(this.mapVp===el) return; if(this.mapVp) this.mapVp.removeEventListener('wheel',this.onMapWheel); this.mapVp=el; if(el){ el.addEventListener('wheel',this.onMapWheel,{passive:false}); setTimeout(()=>{ const s=this.state; const v=this.mapSet(s.mapZ==null?0:s.mapZ, s.mapX||0, s.mapY||0); if(v) this.mapApply(v,true); },0); } };
  mapInRef = el => { this.mapInEl = el; };
  mapSet(z,x,y){ const el=this.mapVp; if(!el) return null; const W=el.clientWidth, H=el.clientHeight; if(!W||!H) return null; const fz=Math.min(1,H/W); z=Math.max(fz,Math.min(6,z)); const cw=W*z, ch=W*z; x = cw<=W ? (W-cw)/2 : Math.min(0,Math.max(W-cw,x)); y = ch<=H ? (H-ch)/2 : Math.min(0,Math.max(H-ch,y)); return {z,x,y,fz}; }
  mapApply(v,commit){ if(this.mapInEl){ this.mapInEl.style.transform=`translate(${v.x}px,${v.y}px)`; this.mapInEl.style.width=(v.z*100)+'%'; } if(commit) this.setState({mapZ:v.z,mapX:v.x,mapY:v.y,mapFz:v.fz},()=>this.save()); }
  mapZoomAt(f,px,py){ const s=this.state, z=s.mapZ||1, x=s.mapX||0, y=s.mapY||0; const v0=this.mapSet(z*f,0,0); if(!v0) return; const k=v0.z/z; const v=this.mapSet(v0.z, px-(px-x)*k, py-(py-y)*k); if(v) this.mapApply(v,true); }
  mapZoomCenter(f){ const el=this.mapVp; if(el) this.mapZoomAt(f, el.clientWidth/2, el.clientHeight/2); }
  onMapWheel = ev => { ev.preventDefault(); const r=this.mapVp.getBoundingClientRect(); this.mapZoomAt(Math.exp(-ev.deltaY*0.0018), ev.clientX-r.left, ev.clientY-r.top); };
  _ptrs = new Map(); _pinch = null;
  onMapDown = ev => { this._ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY}); if(this._ptrs.size===2){ const [p,q]=[...this._ptrs.values()]; this._pinch={d:Math.hypot(p.x-q.x,p.y-q.y)||1,z:this.state.mapZ||1}; this._mapDrag=null; try{ ev.currentTarget.setPointerCapture(ev.pointerId); }catch(e){} return; } if(ev.pointerType==='mouse' && ev.button!==0) return; if(ev.target.closest && ev.target.closest('[data-maplabel]')) return; this._mapDrag={id:ev.pointerId,sx:ev.clientX,sy:ev.clientY,x:this.state.mapX||0,y:this.state.mapY||0,v:null}; try{ ev.currentTarget.setPointerCapture(ev.pointerId); }catch(e){} if(this.mapVp) this.mapVp.style.cursor='grabbing'; };
  onMapMove = ev => { if(this._ptrs.has(ev.pointerId)) this._ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY}); if(this._pinch && this._ptrs.size===2 && this.mapVp){ const [p,q]=[...this._ptrs.values()]; const r=this.mapVp.getBoundingClientRect(); const nd=Math.hypot(p.x-q.x,p.y-q.y); const target=this._pinch.z*nd/this._pinch.d; const cur=this.state.mapZ||1; this.mapZoomAt(target/cur,(p.x+q.x)/2-r.left,(p.y+q.y)/2-r.top); return; } const d=this._mapDrag; if(!d||d.id!==ev.pointerId) return; const v=this.mapSet(this.state.mapZ||1, d.x+ev.clientX-d.sx, d.y+ev.clientY-d.sy); if(v){ d.v=v; this.mapApply(v,false); } };
  onMapUp = ev => { this._ptrs.delete(ev.pointerId); if(this._ptrs.size<2) this._pinch=null; const d=this._mapDrag; if(!d) return; this._mapDrag=null; if(this.mapVp) this.mapVp.style.cursor='grab'; if(d.v) this.mapApply(d.v,true); };
  mapVals(s,era,d,SS,goRegion){
    const POS={'White Hills':[53.8,31.1],'Downtown':[68.9,31.8],'Chinatown':[65.3,28.3],'Saint Edwiges':[63.4,24.1],'Embarcadouro':[71.4,26.5],'Embarcadouro e Píer 9':[71.4,26.5],
      'Black Rock':[80.4,16.4],'Black Rock e a Ponte':[80.4,16.4],'Black Rock vazia':[80.4,16.4],'Monumental Island':[80.4,16.4],'Black Rock Bridge e o Pilar 3':[77.4,28.8],
      'Waterford':[62.1,51.3],'Distrito de Waterford':[62.1,51.3],'Estrada do Estreito':[43.5,25.2],'Owenfield':[68.8,45.1],'Monarch Heights':[65.2,58.6],'Vila da Guerra':[65.2,58.6],
      'Greenspring':[35.2,66.4],'Greenspring Streets e a Galleria':[35.2,66.4],'Hipódromo de San Ysidro':[40.0,42.9],'Rua Post':[54.9,35.8],
      'Fórum e a Sala 3':[67.1,35.8],'Praça do Fórum e o Palermo':[67.1,35.8],'Central da Rua Bush':[66.2,33.0],'Cine Golden Harvest':[64.6,30.4],
      'Estaleiro Harrow & Lyman':[72.1,37.2],'Freeway 480':[72.5,33.6],'A Trincheira':[72.5,33.6],'Cemitério de São Brendan':[57.6,46.4],
      'Estação Ferroviária Central':[70.9,42.0],'Esgotos e túneis':[64.0,40.0]};
    const KEY={'Embarcadouro e Píer 9':'Embarcadouro','Estaleiro Harrow & Lyman':'Embarcadouro','Black Rock e a Ponte':'Black Rock','Black Rock vazia':'Black Rock','Monumental Island':'Black Rock',
      'Distrito de Waterford':'Waterford','Vila da Guerra':'Monarch Heights','Greenspring Streets e a Galleria':'Greenspring'};
    const ERAS=['1934','1946','1974','1994','1999'];
    const mEra=(s.mapEra && s.mapEraOf===era) ? s.mapEra : era;
    const camY=mEra==='1999'?'1994':mEra;
    const regs=((L()[mEra]||{}).regioes)||[];
    const used=new Set(); const out=[];
    regs.forEach(r=>{ const p=POS[r.nome]; if(!p) return; used.add(KEY[r.nome]||r.nome); const sel=s.mapSel===r.nome; const cena=mEra===era&&d.cena===r.nome;
      out.push({real:true,ghost:false,n:r.nome,x:p[0],y:p[1],
        bg:sel?'var(--sv-paper,#dedede)':'rgba(15,15,16,0.82)', fg:sel?'var(--sv-bg,#131212)':'var(--sv-ink,#e0e0e0)',
        bd:cena?'var(--sv-accent2,#8f9093)':(sel?'var(--sv-paper,#dedede)':'var(--sv-line2,#353639)'),
        pick:()=>this.setState({mapSel:sel?null:r.nome})}); });
    Object.entries(SS.camadas||{}).forEach(([k,v])=>{ if(used.has(k)) return; const p=POS[k]; if(!p||!v[camY]) return; out.push({real:false,ghost:true,n:k,t:v[camY],x:p[0],y:p[1]}); });
    const byEra=o=>o[mEra]||'';
    const PL=[
      {n:{'1934':'Café Palermo','1946':'Café Palermo','1974':'Palermo','1994':'Palermo 24h','1999':'Palermo 24h'},p:[68.3,30.3]},
      {n:{'1934':'Banca do Zack','1946':'Banca do Zack','1974':'Banca do Zack','1994':'Zachary Video','1999':'Zachary Video'},p:[67.4,36.9]},
      {n:{'1934':'Galpão 14 · Píer 9','1946':'Galpão 14 · Píer 9','1974':'Galpão 14 · Píer 9','1994':'Galpão 14 · Píer 9','1999':'Galpão 14 · Píer 9'},p:[71.0,27.9]},
      {n:{'1934':'Túnel de 1853','1946':'Túnel de 1853','1974':'Túnel de 1853','1994':'Túnel de 1853','1999':'Túnel de 1853'},p:[81.2,18.2]},
      {n:{'1934':'Golden Gate Motel · quarto 11','1946':'Golden Gate Motel · quarto 11','1974':'Golden Gate Motel · quarto 11','1994':'Golden Gate Motel · quarto 11','1999':'Golden Gate Motel · quarto 11'},p:[40.9,24.4]},
      {n:{'1934':'Pilar 3 (em obra)','1946':'Pilar 3','1974':'Pilar 3','1994':'Pilar 3'},p:[77.6,28.0]},
      {n:{'1934':'Igreja de São Brendan','1946':'Igreja de São Brendan','1974':'Igreja de São Brendan','1994':'Igreja de São Brendan','1999':'Igreja de São Brendan'},p:[59.0,47.8]},
      {n:{'1934':'Mansão Ashcroft','1946':'Mansão Harrow','1974':'Mansão Harrow · a vela','1994':'Mansão Harrow · a vela','1999':'Mansão Harrow · a vela'},p:[52.3,29.6]},
      {n:{'1934':'Hipódromo (Pemberton)','1946':'Hipódromo de San Ysidro','1974':'Hipódromo de San Ysidro'},p:[40.0,42.9]},
      {n:{'1994':'Refinaria Monarch','1999':'Refinaria Monarch'},p:[74.3,54.4]}
    ].map(o=>({n:byEra(o.n),x:o.p[0],y:o.p[1]})).filter(o=>o.n);
    const ST=[['Rua Grant',65.2,30.6,90],['Rua Stockton',64.0,30.6,90],['Rua Kearny',66.4,30.6,90],['Rua Montgomery',67.8,32.6,90],
      ['Rua Pacific',61.5,27.6,0],['Rua Jackson',61.5,28.4,0],['Rua Washington',61.5,29.2,0],['Rua Clay',61.5,30.0,0],['Rua Califórnia',61.5,31.0,0],['Rua Bush',61.5,32.2,0],['Rua Post',58.6,33.7,0],
      ['Rua Columbus',64.1,26.2,53],['Rua Dolores',58.0,52.5,90]];
    if(mEra==='1974'||mEra==='1994'||mEra==='1999') ST.push(['Rua Magnólia',36.0,68.8,0]);
    const z=s.mapZ||1, fz=s.mapFz||z;
    const selR=regs.find(r=>r.nome===s.mapSel);
    const selKey=selR?(KEY[selR.nome]||selR.nome):'';
    const selCam=selR&&SS.camadas&&SS.camadas[selKey]?SS.camadas[selKey]:null;
    return {
      mapTf:`translate(${s.mapX||0}px,${s.mapY||0}px)`, mapW:String(z*100), mapEraLabel:mEra,
      mapEras:ERAS.map(e=>({e,on:e===mEra,off:e!==mEra,go:()=>this.setState({mapEra:e,mapEraOf:era,mapSel:null})})),
      mapRegions:out, mapPlaces:PL, mapStreets:ST.map(([n,x,y,rot])=>({n,x,y,rot})),
      mapShowPlaces:z>=fz*1.4, mapShowStreets:z>=Math.max(1.6,fz*2.6),
      mapZoomIn:()=>this.mapZoomCenter(1.6), mapZoomOut:()=>this.mapZoomCenter(1/1.6), mapReset:()=>{ const v=this.mapSet(0,0,0); if(v) this.mapApply(v,true); },
      mapVpRef:this.mapVpRef, mapInRef:this.mapInRef, onMapDown:this.onMapDown, onMapMove:this.onMapMove, onMapUp:this.onMapUp,
      mapHasSel:!!selR, mapNoSel:!selR, mapSelNome:selR?selR.nome:'', mapSelDono:selR&&selR.dono?('Quem manda: '+selR.dono):'', mapSelHasDono:!!(selR&&selR.dono),
      mapSelCamada:selCam?(selCam[camY]||''):'', mapSelHasCamada:!!(selCam&&selCam[camY]),
      mapSelCamadas:selCam?ERAS.filter(y=>y!=='1999'&&selCam[y]).map(y=>({y,t:selCam[y],on:y===camY,off:y!==camY})):[], mapSelHasCamadas:!!selCam,
      mapSelResumo:selR?(selR.resumo||''):'', mapSelLugares:selR?(selR.lugares||[]).map(([n,dd])=>({n,d:dd})):[], mapSelHasLugares:!!(selR&&(selR.lugares||[]).length),
      mapSelCanGo:!!selR&&mEra===era, mapSelOutra:!!selR&&mEra!==era,
      mapSelGo:()=>selR&&goRegion(selR.nome), mapSelSet:()=>selR&&this.upd(e=>({...e,cena:selR.nome})), mapSelClose:()=>this.setState({mapSel:null})
    };
  }

  componentDidMount(){
    this._themed=this.state.era; this.applyTheme(this.state.era);
    const check=()=>{ if(R()&&L()&&S()){ this.setState({ready:true}); } else this._t=setTimeout(check,80); };
    check();
    this._onScroll=()=>{ try{ document.documentElement.classList.toggle('sv-scrolled', window.scrollY>80); if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)) document.documentElement.style.setProperty('--sv-py', Math.round(window.scrollY)+'px'); }catch(e){} };
    window.addEventListener('scroll',this._onScroll,{passive:true});
    try{ if(localStorage.getItem('sv-guide-off')) this.setState({guideOff:true}); }catch(e){}
  }
  componentWillUnmount(){ clearTimeout(this._t); window.removeEventListener('scroll',this._onScroll); this.applyTheme(null); }
  applyTheme(era){
    const TH={
      '1934':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#121213","--sv-bg1":"#252423","--sv-bg2":"#0b0b0c","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e4e4e4","--sv-paperdim":"#595a5d","--sv-accent":"#5e5e5e","--sv-hicard":"#e4e4e4","--sv-accent-soft":"#b9b9b9","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Special Elite',monospace"},
      '1946':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#121213","--sv-bg1":"#212225","--sv-bg2":"#0c0b0b","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e0e0e0","--sv-paperdim":"#595a5d","--sv-accent":"#555555","--sv-hicard":"#e0e0e0","--sv-accent-soft":"#b9b9b9","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Special Elite',monospace"},
      '1974':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#121213","--sv-bg1":"#232222","--sv-bg2":"#0b0b0b","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e0e0e0","--sv-paperdim":"#595a5d","--sv-accent":"#5e5e5e","--sv-hicard":"#e0e0e0","--sv-accent-soft":"#b9b9b9","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Courier Prime',monospace"},
      '1994':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#131012","--sv-bg1":"#1c1c1c","--sv-bg2":"#0b0a0b","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e4e4e4","--sv-paperdim":"#4e4f52","--sv-accent":"#7a7a7a","--sv-hicard":"#e4e4e4","--sv-accent-soft":"#c7c7c7","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Courier Prime',monospace"},
      '1999':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#111317","--sv-bg1":"#172b34","--sv-bg2":"#0a0b0d","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#cccccc","--sv-paperdim":"#535a63","--sv-accent":"#6d6d6d","--sv-hicard":"#cccccc","--sv-accent-soft":"#c7c7c7","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Courier Prime',monospace"}
    };
    const keys=Object.keys(TH['1994']), T=TH[era], st=document.documentElement.style;
    keys.forEach(k=> T ? st.setProperty(k,T[k]) : st.removeProperty(k));
    document.body.style.background = T ? T['--sv-bg'] : '';
  }
  componentDidUpdate(pp, ps){
    try{
      const A=ps.era===this.state.era?this.cur(ps):null, B=this.cur();
      if(A&&B){
        const ca=A.caso||{}, cb=B.caso||{};
        if((cb.pistas||[]).length>(ca.pistas||[]).length) svToast('Pista anotada');
        else if((cb.provas||[]).length>(ca.provas||[]).length) svToast('Prova registrada');
        else if((cb.fios||[]).length>(ca.fios||[]).length) svToast('Fio ligado no mural');
        else if((B.custom||[]).length>(A.custom||[]).length) svToast('Novo nome no elenco');
        else if(B.cena!==A.cena && B.cena) svToast('Cena: '+B.cena);
      }
      if(ps.diceRes && this.state.diceRes && ps.diceRes.title===this.state.diceRes.title && !ps.diceRes.logged && this.state.diceRes.logged) svToast('Registrado na crônica');
    }catch(e){}
    if(ps.diceRes!==this.state.diceRes && this.state.diceRes && SV_ROLLS.length){ const r=SV_ROLLS.splice(0).filter(x=>x.n===6||x.n===8).slice(0,10); if(r.length){ svThrowDice(r); this.setState({lastRolls:r}); } } else if(ps.diceRes===this.state.diceRes){ SV_ROLLS.length=0; }
    if(this._themed!==this.state.era){ this._themed=this.state.era; this.applyTheme(this.state.era); }
    const el=this.logRef.current; const a=this.cur(ps), b=this.cur();
    if(el && (ps.busy!==this.state.busy || (a&&b&&a.log.length!==b.log.length) || ps.tab!==this.state.tab)) el.scrollTop=el.scrollHeight;
  }
  save(){ const {era,tab,eras,mapZ,mapX,mapY,mapFz}=this.state; try{ localStorage.setItem(LS, JSON.stringify({era,tab,eras,mapZ,mapX,mapY,mapFz})); }catch(e){} }
  cur(s=this.state){ return s.era && s.eras ? s.eras[s.era] : null; }
  upd(fn){ this.setState(s=>{ const eras={...s.eras}; eras[s.era]=fn({...eras[s.era]}); return {eras}; }, ()=>this.save()); }
  setChar(patch){ this.upd(e=>({...e,char:{...e.char,...(typeof patch==='function'?patch(e.char):patch)}})); }
  setCaso(patch){ this.upd(e=>({...e,caso:{...e.caso,...(typeof patch==='function'?patch(e.caso):patch)}})); }
  addLog(entry){ const id=uid(); this.upd(e=>({...e,log:[...e.log,{id,...entry}]})); return id; }
  patchEntry(id, patch){ this.upd(e=>({...e,log:e.log.map(x=>x.id===id?{...x,...patch}:x)})); }
  setTab(tab){ if(tab==='dados') tab='cronica'; this.setState({tab},()=>this.save()); }
  pickEra(era){ this.setState(s=>{ const eras={...s.eras}; if(!eras[era]) eras[era]=blankEra(era); return {era, eras, tab: eras[era].log.length?'cronica':'tutorial'}; },()=>this.save()); }

  allNpcs(){ const d=this.cur(); const book=(L()[this.state.era].npcs||[]).map((n,i)=>({...n,id:'b'+i})); const mine=(d.custom||[]).map(n=>({...n,id:'c'+n.cid,custom:true,r:n.r||'Criado por você'})); return [...book,...mine]; }
  npcById(id){ return this.allNpcs().find(n=>n.id===id); }
  fmtNpc(n){ return `${n.n} — ${n.p}${n.r?' ('+n.r+')':''}. ${n.d||''}${n.v?' Virtude: '+n.v:''}${n.pe?' Pecado: '+n.pe:''}${n.q?' Quer: '+n.q:''}${n.t?' Teme: '+n.t:''}${n.a?' Alianças: '+n.a:''}`; }
  fmt(e){
    if(e.k==='narr') return 'NARRADOR: '+e.text;
    if(e.k==='npc') return e.who.toUpperCase()+': '+e.text;
    if(e.k==='action') return 'PERSONAGEM (ação): '+e.text;
    if(e.k==='speech') return 'PERSONAGEM (fala'+(e.to?' para '+e.to:'')+'): "'+e.text+'"';
    return '['+e.who+'] '+e.text;
  }
  matchSkill(v){ const era=this.state.era, all=[...R()[era].gerais, ...invList(era)]; const n=norm(v); return all.find(k=>norm(k)===n) || all.find(k=>n.includes(norm(k))||norm(k).includes(n)) || v; }
  isGeral(k){ return R()[this.state.era].gerais.includes(k); }

  systemPrompt(npc){
    const s=this.state, era=s.era, RR=R()[era], LL=L()[era], d=this.cur(), c=d.char, med=RR.medidor.n;
    const has=m=>(RR.mods||[]).includes(m), SS=S();
    const tone = era==='1946' ? 'noir de pós-guerra, 1946 — a mesma família do noir de 1934, só que mais cansada: veteranos voltando, a bandeira nas vitrines pedindo silêncio, papéis carimbados, big bands e rádio ligado para não ouvir a cidade. Sombras duras, neblina, frases curtas; em cada cena, alguém calado.'
      : era==='1974' ? 'thriller de conspiração de 1974 — paranoia, telefones que clicam, fitas de rolo, o mesmo carro do outro lado da rua há três horas, homens de terno numa sala com ar-condicionado. Mostre os sinais sem confirmá-los. Pouca violência, muita vigilância; a vitória é uma manchete.'
      : era==='1999' ? 'epílogo do século, dezembro de 1999 — noir com a memória do pulp: uma semana de despedidas, papéis que reaparecem, a contagem regressiva para o ano 2000, câmeras e celulares. Presente no ritmo de 1994; flashbacks no ritmo de 1934. Fale baixo nas despedidas.'
      : era==='1934'
      ? 'film noir investigativo de 1934 — fim da Lei Seca, fundo da Depressão — com a fotografia do cinema expressionista alemão: sombras duras, neblina, chuva, ângulos tortos. Frases curtas. Deixe os silêncios agirem.'
      : 'pulp fiction de 1994 — néon, televisão, crime, ironia e ação cinematográfica narrada como plano de filme. Toda descrição tem um cheiro, um som e uma coisa fora do lugar. Feche cenas de ação com uma imagem.';
    const words = {curto:'60 a 110', medio:'90 a 170', longo:'150 a 260'}[this.props.tamanhoNarracao||'medio'] || '90 a 170';
    const inv = Object.entries(c.inv).filter(([k,v])=>v>1).map(([k,v])=>k+' '+v).join(', ');
    const extraFicha = [has('adr')?`Adrenalina ${c.adr}`:'', has('imprensa')?`Imprensa ${c.imprensa}/6`:'', has('ficha')?`Ficha ${c.ficha||0}/6`:'', has('medalha')&&c.medalha?`Medalha: ${c.medalha} (usos neste caso ${d.caso.medalhaUsos||0})`:'', has('ruido')?`Ruído ${c.ruido||0}/10`:'', has('codigo')?`regras do Código: ${c.regras||'—'}`:'', c.anoNasc?`nascido em ${c.anoNasc} (${+era - +c.anoNasc} anos)`:'', c.lacoEra?`Laço de Herança com ${c.lacoEra}${c.lacoDe?' (herdado de '+c.lacoDe+')':''}`:'', c.herancas?`Heranças: ${c.herancas}`:'', c.antepassado?`Antepassado: ${c.antepassado}`:''].filter(Boolean).map(x=>'; '+x).join('');
    const fiosTxt = has('mural') ? ' Mural: '+((d.caso.fios||[]).map((f,i)=>this.fioTxt(f,i)+' ['+f.st+']').join(' | ')||'nenhum Fio')+'.' : '';
    const seculoTxt = `${SS.canone}\nCRONOLOGIA (o que já aconteceu antes de ${era}; nunca revele à mesa o que vem depois): ${SS.cronologia.filter(([a])=>+a<+era).map(([a,t])=>a+': '+t).join('; ')}.\nTESTEMUNHAS DO SÉCULO: ${SS.testemunhas.map(t=>t[0]+' ('+t[1]+'): viu '+t[2]+'; carrega '+t[3]).join('; ')}.\n${SS.regras}`;
    const ficha = `${c.nome||'Sem nome'} — ${c.arq||'sem arquétipo'}; ${era==='1934'?'origem':'bairro'}: ${c.ori||'—'}; ${has('lado')?'trabalha por '+c.lado:'motivação: '+(c.mot||'—')}. Conceito: ${c.conceito||'—'}. Investigativas: todas com 1 ponto${inv?'; reforçadas: '+inv:''}. Especialidades gerais (+1): ${c.esp.join(', ')||'nenhuma'}. Saúde ${c.saude} (${stateOf(c.saude,'saude')}); Sangue-Frio ${c.sf} (${stateOf(c.sf,'sf')}); ${med} ${c.med}; Impulsos ${c.imp}${extraFicha}. Vício: ${c.vicio||'—'} (traços ${c.vicioTr}/3). Fontes: ${c.fontes||'—'}. Equipamento: ${c.equip||'—'}. Segredo (use uma vez, no pior momento): ${c.segredo||'—'}.`;
    const caso = d.caso;
    const casoTxt = `Título: ${caso.titulo||'—'}. Premissa: ${caso.premissa||'(ainda não aberto)'}. ${caso.segredo?'VERDADE OCULTA (só o narrador sabe; revele aos poucos): '+caso.segredo+'.':''} Pistas já obtidas: ${caso.pistas.map(p=>p.t).join(' | ')||'nenhuma'}. Provas: ${caso.provas.map(p=>p.t+' (Peso '+p.peso+')').join(' | ')||'nenhuma'} — Peso necessário ${caso.nec}. Vantagens: ${caso.vant.join(', ')||'—'}. Problemas: ${caso.prob.join(', ')||'—'}.${fiosTxt}`;
    const naCena = d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>this.fmtNpc(n)).join('\n') || '(ninguém definido)';
    const lista = LL.npcs.map(n=>n.n).join('; ');
    const reg = d.cena ? `REGIÃO DA CENA: ${d.cena}. Trecho do livro sobre ela (autoridade máxima para lugares, gente, rumores e regras locais):\n${(LL.textos[d.cena]||'').slice(0,11000)}` : 'REGIÃO DA CENA: não definida — escolha uma coerente com o caso e diga onde estamos.';
    let sys = `Você é o Diretor e narrador de uma crônica SOLO de ${RR.titulo} (${RR.sub}), criado por Felipe Malorgio sobre o GUMSHOE SRD. Siga fielmente o cenário e as regras abaixo; não invente regras novas. Tom: ${tone}
Escreva em português do Brasil, em segunda pessoa, ${words} palavras. Nunca decida ações, falas ou sentimentos do personagem do jogador. Termine sempre numa situação aberta. Texto corrido em prosa: não use markdown (nada de #, **, listas ou títulos); manchetes vão entre aspas.
Pistas centrais NUNCA exigem rolagem: o personagem tem todas as habilidades investigativas, então quando ele investiga de forma coerente, entregue a pista central. Esconda o significado, nunca a pista. Ação incerta e arriscada com habilidade GERAL: descreva a tensão e PARE, pedindo o teste.

REGRAS:
${RR.regras}

O SÉCULO (Saint Village XX Century, Edição Omni):
${seculoTxt}

FACÇÕES E CIDADE (do livro):
${LL.geral.slice(0,7000)}

${reg}

PERSONAGENS DO DIRETOR EM CENA (interprete-os pelas quatro linhas; ninguém se acha vilão):
${naCena}
Outros nomes do livro disponíveis: ${lista}

FICHA DO PERSONAGEM: ${ficha}
O CASO: ${casoTxt}

MARCAÇÕES — o app lê e aplica; escreva-as ao FINAL do texto, entre colchetes, só quando ocorrerem:
[TESTE: Habilidade geral] pede uma rolagem solo (1d6 + modificadores: Revés 1–2, Empate 3–4, Avanço 5+). Antes da marcação, explique ao jogador em uma ou duas frases a regra desta rolagem: que dado se rola, quais modificadores valem e por quê (especialidade +1; Ferido ou Abalado −1), o que cada faixa significa nesta situação e que o Impulso pode virar um Empate em Avanço. Pare a cena aí.
[CHOQUE: N] choque de Sangue-Frio de perda N (antes da marcação, explique em uma frase a regra: 1d6 contra Dificuldade 4, +1 com especialidade em Sangue-Frio, Dificuldade 5 se já Abalado; falhar perde N, passar evita ou reduz a perda) (use a tabela de horror/culpa${era==='1994'?'/fim do mundo':''}).
[BENEFICIO: Habilidade investigativa] oferece um benefício extra que custa 1 Impulso; explique em uma frase o que o benefício concede e que gastar o Impulso é opcional.
[PISTA: frase curta] a cada pista central entregue.
[PROVA: descrição | Peso 1-3] quando o personagem obtém uma prova.
[VANTAGEM: nome] / [PROBLEMA: nome] / [-VANTAGEM: nome] / [-PROBLEMA: nome].
[SAUDE: -N] dano sofrido. [${med==='Integridade'?'INTEGRIDADE':'CODIGO'}: -N] quando a regra mandar. [IMPULSO: +1] quando a regra solo der um Impulso.${has('adr')?' [ADRENALINA: +1] quando a regra der Adrenalina.':''}${has('imprensa')?' [IMPRENSA: +1] quando o personagem for filmado, fotografado ou citado em público.':''}${has('ficha')?' [FICHA: +1] quando o personagem for visto com quem a Comissão anota, assinar petição, defender alguém no Fórum ou fizer a pergunta errada ao homem de terno; [FICHA: -1] quando prestar serviço visível ao Estado (e então [INTEGRIDADE: -1]).':''}${has('ruido')?' [RUIDO: +N] quando planejar em lugar não varrido ou agir sobre Fio cortado; [RUIDO: -N] quando tomar cuidado (varrer, lugar público e barulhento, telefone público). Gaste o Ruído como a oposição gastaria o que ouviu.':''}${has('mural')?' [FIO: n | firme] ou [FIO: n | cortado] ao verificar o Fio n do Mural. Cada pista central é um Cartão; com Ruído 4 ou mais, você pode entregar um Cartão falso como pista, sem avisar.':''}
[NPC: Nome exato] quando um Personagem do Diretor do livro entrar em cena.`;
    if(npc) sys += `\n\nNESTA RESPOSTA você fala como ${npc.n}. Responda sobretudo com a fala dele, entre travessões, em primeira pessoa, com voz própria e agenda própria; no máximo uma ou duas frases de gesto e ambiente. Ele pode mentir, negociar, se fechar. Perfil: ${this.fmtNpc(npc)}`;
    return sys;
  }

  async narrate(instr, opts={}){
    if(this.state.busy) return;
    if(!window.svAI){ this.addLog({k:'mech',who:'Aviso',text:'IA indisponível neste ambiente.'}); return; }
    this.setState({busy:true});
    try{
      const d=this.cur(); const hist=d.log.slice(-18).map(e=>this.fmt(e)).join('\n');
      const model = this.props.modeloIA==='sonnet' ? 'claude-sonnet-4-5' : 'claude-haiku-4-5';
      const text = await window.svAI({ system:this.systemPrompt(opts.npc), max_tokens:1000,
        messages:[{role:'user',content:`HISTÓRICO RECENTE DA CRÔNICA:\n${hist||'(início)'}\n\nAGORA: ${instr}`}] });
      this.ingest(text||'', opts);
    }catch(err){ this.addLog({k:'mech',who:'Erro',text:'O narrador não respondeu. Tente de novo.'}); }
    this.setState({busy:false});
  }

  ingest(text, opts){
    const era=this.state.era, d=this.cur();
    const ch={...d.char}; const caso={...d.caso,pistas:[...d.caso.pistas],provas:[...d.caso.provas],vant:[...d.caso.vant],prob:[...d.caso.prob]};
    const naCena=[...d.naCena]; const acts=[]; const fx=[]; const book=L()[era].npcs; const tri0=triCount(d.caso.fios);
    const clean = text.replace(/\[([^\[\]]{1,240})\]/g,(m,inner)=>{
      const i=inner.indexOf(':'); if(i<0) return m;
      let key=norm(inner.slice(0,i)).replace(/\s+/g,''); const val=inner.slice(i+1).trim();
      const neg=key.startsWith('-'); key=key.replace(/^[-+]/,'');
      const num=parseInt(val.replace(/[−–]/g,'-').replace(/[^\d+-]/g,''),10)||0;
      switch(key){
        case 'TESTE': acts.push({t:'teste',v:this.matchSkill(val)}); break;
        case 'CHOQUE': acts.push({t:'choque',v:Math.abs(num)||2}); break;
        case 'BENEFICIO': acts.push({t:'benef',v:this.matchSkill(val)}); break;
        case 'PISTA': caso.pistas.push({id:uid(),t:val}); fx.push('Pista anotada'); break;
        case 'PROVA': { const [t,p]=val.split('|'); caso.provas.push({id:uid(),t:t.trim(),peso:clamp(parseInt((p||'').replace(/\D/g,''))||1,1,3)}); fx.push('Prova registrada'); break; }
        case 'VANTAGEM': if(neg){ caso.vant=caso.vant.filter(x=>norm(x)!==norm(val)); fx.push('Vantagem descartada: '+val);} else if(!caso.vant.includes(val)){ caso.vant.push(val); fx.push('Vantagem: '+val);} break;
        case 'PROBLEMA': if(neg){ caso.prob=caso.prob.filter(x=>norm(x)!==norm(val)); fx.push('Problema descartado: '+val);} else if(!caso.prob.includes(val)){ caso.prob.push(val); fx.push('Problema: '+val);} break;
        case 'SAUDE': ch.saude=clamp(ch.saude+num,-12,8); fx.push('Saúde '+sign(num)); break;
        case 'SANGUE-FRIO': case 'SANGUEFRIO': ch.sf=clamp(ch.sf+num,-12,8); fx.push('Sangue-Frio '+sign(num)); break;
        case 'INTEGRIDADE': case 'CODIGO': case 'MEDIDOR': ch.med=clamp(ch.med+num,0,10); fx.push(R()[era].medidor.n+' '+sign(num)); break;
        case 'IMPULSO': case 'IMPULSOS': ch.imp=clamp(ch.imp+num,0,9); fx.push('Impulso '+sign(num)); break;
        case 'ADRENALINA': ch.adr=clamp(ch.adr+num,0,3); fx.push('Adrenalina '+sign(num)); break;
        case 'IMPRENSA': ch.imprensa=clamp(ch.imprensa+num,0,6); fx.push('Imprensa '+sign(num)); break;
        case 'FICHA': { const v0=ch.ficha||0; ch.ficha=clamp(v0+num,0,6); fx.push('Ficha '+sign(num)+(ch.ficha>=6&&v0<6?' · intimação na Sala 3':ch.ficha>=4&&v0<4?' · emprego, contrato ou licença perdidos':ch.ficha>=2&&v0<2?' · documentos pedidos na rua':'')); break; }
        case 'RUIDO': ch.ruido=clamp((ch.ruido||0)+num,0,10); fx.push('Ruído '+sign(num)+' ('+ch.ruido+')'); break;
        case 'FIO': { const [n,st]=val.split('|'); const i=parseInt(n)-1; const f=(caso.fios||[])[i]; if(f){ const firme=/firme/i.test(st||''); caso.fios=caso.fios.map((x,j)=>j===i?{...x,st:firme?'firme':'cortado'}:x); fx.push('Fio '+(i+1)+': '+(firme?'firme':'cortado')); if(firme){ const vt='Fio firme: '+f.rel; if(!caso.vant.includes(vt)) caso.vant.push(vt); } } break; }
        case 'NPC': { const nv=norm(val); const idx=book.findIndex(n=>norm(n.n)===nv||norm(n.n).includes(nv)||nv.includes(norm(n.n).replace(/^(CAPITAO|TENENTE|PREFEITO|DR\.|JUIZ|PADRE|SARGENTO|DETETIVE|PROMOTOR) /,''))); if(idx>=0 && !naCena.includes('b'+idx)){ naCena.push('b'+idx); fx.push('Em cena: '+book[idx].n);} break; }
        default: return m;
      }
      return '';
    }).replace(/^#{1,6}\s*/gm,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/__(.+?)__/g,'$1').replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*/g,'$1$2').replace(/^\s*[-•]\s+/gm,'').replace(/^-{3,}$/gm,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
    const entry = opts.npc ? {id:uid(),k:'npc',who:opts.npc.n,text:clean,acts} : {id:uid(),k:'narr',who:'Narrador',text:clean,acts};
    const reveal = triCount(caso.fios) > tri0; if(reveal) fx.push('Revelação: três Fios firmes fecham um triângulo');
    const extra = fx.length ? [{id:uid(),k:'mech',who:'Ficha',text:fx.join(' · ')}] : [];
    this.upd(e=>({...e,char:ch,caso,naCena,log:[...e.log,entry,...extra]}));
    if(reveal) setTimeout(()=>this.narrate('Três Fios firmes do Mural fecham um triângulo: entregue de graça a Revelação, a pista central que está atrás dos três (o nome de quem paga, o lugar onde a coisa está ou a data em que vai acontecer), com [PISTA: ...].'),160);
  }

  rollTest(hab, src){
    const era=this.state.era, c=this.cur().char;
    const esp=c.esp.includes(hab); const mod=(esp?1:0)-(c.saude<=0?1:0)-(c.sf<=0?1:0)+(src&&src.mod||0);
    const r=rnd(6), tot=r+mod, res=tot<=2?'Revés':tot<=4?'Empate':'Avanço';
    const parts=[esp?'especialidade +1':'', c.saude<=0?'ferido −1':'', c.sf<=0?'abalado −1':'', src&&src.mod?'mod '+sign(src.mod):''].filter(Boolean).join(', ');
    if(src && src.entryId!=null) this.markAct(src.entryId, src.actIdx);
    if(!(src&&src.narrate)){ const t0=`1d6 = ${r}${mod?' '+sign(mod):''}${parts?' ('+parts+')':''} → ${tot} · ${res}`; this.setState({diceRes:{title:'Teste solo · '+hab,big:res,detail:t0,logged:false,nar:`Teste de ${hab}: ${t0}.`}}); return; }
    const pend=[];
    if(res==='Empate' && c.imp>0) pend.push('impulso');
    if(modsOf(era).includes('adr') && c.adr>0 && res!=='Avanço') pend.push('adr');
    const roll={hab,r,mod,tot,res,nar:!!(src&&src.narrate)};
    const text=`1d6 = ${r}${mod?' '+sign(mod):''}${parts?' ('+parts+')':''} → ${tot} · ${res}`;
    if(pend.length){ pend.push('aceitar'); this.addLog({k:'mech',who:'Teste · '+hab,text,roll,pend}); }
    else { this.addLog({k:'mech',who:'Teste · '+hab,text,roll}); if(roll.nar) this.afterTest(roll,''); }
    this.setState({diceRes:{title:'Teste solo · '+hab,big:res,detail:text,logged:true,nar:`Teste de ${hab}: ${text}.`}});
  }
  resolvePend(entry, how){
    const c=this.cur().char; const roll={...entry.roll}; let note='';
    if(how==='impulso'){ this.setChar({imp:c.imp-1}); roll.res='Avanço'; note='gastou 1 Impulso para virar Empate em Avanço.'; }
    if(how==='adr'){ this.setChar({adr:c.adr-1}); roll.tot+=2; roll.res=roll.tot<=2?'Revés':roll.tot<=4?'Empate':'Avanço'; note='gastou 1 de Adrenalina: +2 depois do dado ('+roll.tot+').'; }
    if(how==='aceitar') note= roll.res==='Empate' ? 'aceitou o sucesso com custo.' : 'aceitou o resultado.';
    this.patchEntry(entry.id,{pend:null,text:entry.text+' → '+roll.res+(how==='aceitar'?'':' ('+note.replace(/\.$/,'')+')')});
    if(roll.nar) this.afterTest(roll,note); else this.setState({diceRes:{...this.state.diceRes,big:roll.res}});
  }
  afterTest(roll,note){
    const reg = roll.res==='Revés' ? 'Revés: a ação falha ou sai cara — imponha um Problema com [PROBLEMA: ...].' : roll.res==='Empate' ? 'Empate: consegue, com custo — um Problema leve ou uma complicação.' : 'Avanço: consegue; se a cena for importante, conceda uma [VANTAGEM: ...].';
    setTimeout(()=>this.narrate(`O personagem rolou ${roll.hab}: ${roll.r}${roll.mod?' '+sign(roll.mod):''} = ${roll.tot}. ${note} Resultado final: ${roll.res}. ${reg} Primeiro, em uma ou duas frases, explique ao jogador como a regra funcionou nesta rolagem: o dado, cada modificador aplicado e por quê, a faixa atingida (Revés 1–2, Empate 3–4, Avanço 5+) e o que ela significa; depois narre a consequência.`),40);
  }
  markAct(entryId, idx){ this.upd(e=>({...e,log:e.log.map(x=>x.id===entryId?{...x,acts:(x.acts||[]).map((a,i)=>i===idx?{...a,done:true}:a)}:x)})); }
  rollChoque(perda, src){
    const era=this.state.era, c=this.cur().char;
    const esp=c.esp.includes('Sangue-Frio'); const dif=4+(c.sf<=0?1:0); const r=rnd(6), tot=r+(esp?1:0); const pass=tot>=dif;
    const loss = pass ? (modsOf(era).includes('adr')?Math.floor(perda/2):0) : perda;
    const sf=clamp(c.sf-loss,-12,8);
    if(src) this.markAct(src.entryId, src.actIdx);
    this.setChar({sf});
    const text=`1d6 = ${r}${esp?' +1':''} contra ${dif} · ${pass?'passou':'falhou'} · perde ${loss} (Sangue-Frio ${sf}, ${stateOf(sf,'sf')})`;
    if(src) this.addLog({k:'mech',who:'Choque · perda '+perda,text});
    this.setState({diceRes:{title:'Choque de Sangue-Frio',big:pass?'Aguentou':'Falhou',detail:text,logged:!!src,nar:'Choque de Sangue-Frio: '+text+'.'}});
    if(src) setTimeout(()=>this.narrate(`Choque de Sangue-Frio (perda ${perda}): ${pass?'passou':'falhou'}, perdeu ${loss}; agora ${sf} (${stateOf(sf,'sf')}). Primeiro explique em uma frase a regra do choque (1d6 contra a Dificuldade, o que passar ou falhar custa) e como ela se aplicou agora; depois mostre o efeito interno em uma ou duas frases e siga a cena.`),40);
  }
  spendBenef(hab, src){
    const c=this.cur().char;
    if(c.imp<=0){ this.addLog({k:'mech',who:'Impulsos',text:'Sem Impulsos para gastar neste caso.'}); return; }
    this.markAct(src.entryId, src.actIdx); this.setChar({imp:c.imp-1});
    this.addLog({k:'mech',who:'Benefício · '+hab,text:'1 Impulso gasto ('+(c.imp-1)+' restantes)'});
    setTimeout(()=>this.narrate(`O personagem gasta 1 Impulso em ${hab} para obter o benefício oferecido. Entregue um benefício concreto e útil.`),40);
  }

  rollGerador(){
    const era=this.state.era;
    if(era==='1934'){ const g=R()['1934'].gerador; const v={}; Object.keys(g).forEach(k=>v[k]=pick(g[k]));
      this.setCaso({premissa:`${v.cliente} contrata você: ${v.crime.toLowerCase()} — ${v.vitima.toLowerCase()}.`, segredo:`O culpado é ${v.culpado.toLowerCase()}, por ${v.motivo.toLowerCase()}; a reviravolta: ${v.reviravolta.toLowerCase()}.`});
    } else if(era!=='1994'){ const g=S().gerador; const v={}; ['cliente','crime','culpado','motivo','reviravolta'].forEach(k=>v[k]=pick(g[k]));
      this.setCaso({premissa:`${v.cliente} procura você: ${v.crime.toLowerCase()}.`, segredo:`O culpado é ${v.culpado.toLowerCase()}, por ${v.motivo.toLowerCase()}; a reviravolta: ${v.reviravolta.toLowerCase()}. Toque da era: ${g.toque[era]}`});
    } else { const regs=L()['1994'].regioes.filter(r=>r.gancho); const r=pick(regs); const opts=r.gancho.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/); const g=pick(opts.length>1?[opts.slice(0,Math.ceil(opts.length/2)).join(' '),opts.slice(Math.ceil(opts.length/2)).join(' ')]:opts);
      this.setCaso({premissa:g, segredo:''}); this.upd(e=>({...e,cena:r.nome}));
    }
    this.setState({showSeg:false});
  }
  openCase(){
    const d=this.cur(); if(!d.caso.premissa) this.rollGerador();
    if(!d.log.some(e=>e.k==='narr'||e.k==='npc')) this.upd(e=>({...e,log:e.log.filter(x=>x.k!=='mech')}));
    this.setTab('cronica');
    setTimeout(()=>{ const c=this.cur().caso;
      this.narrate(`Abra o caso (Ato 1 · o cliente) com uma cena de abertura marcante: comece pela cidade (manchete, rádio, clima da noite), apresente o personagem num lugar concreto de Saint Village e termine com uma pergunta — alguém morto, desaparecido ou pagando para descobrir algo. Premissa: ${c.premissa}. Se fizer sentido, sugira um título curto para o caso no fim com [PISTA: ...] apenas se houver pista real.`); },60);
  }

  loadCaso(k){
    this.setCaso({...blankCaso(), titulo:k.titulo, premissa:k.premissa, segredo:k.segredo||'', nec:k.nec||4});
    if(k.cena && L()[this.state.era].regioes.some(r=>r.nome===k.cena)) this.upd(e=>({...e,cena:k.cena}));
    this.setState({showSeg:false, tab:'caso'},()=>this.save());
  }
  fioTxt(f,i){ const P=this.cur().caso.pistas; const a=P.find(p=>p.id===f.a), b=P.find(p=>p.id===f.b); return `Fio ${i+1}: “${a?a.t:'?'}” ↔ “${b?b.t:'?'}” — ${f.rel}`; }
  verifyFio(i){ const d=this.cur(), c=d.char, f=(d.caso.fios||[])[i]; if(!f) return;
    if(c.imp<=0){ this.addLog({k:'mech',who:'Mural',text:'Sem Impulsos para verificar o Fio.'}); return; }
    this.setChar({imp:c.imp-1}); this.addLog({k:'mech',who:'Mural',text:'Verificar · '+this.fioTxt(f,i)+' · 1 Impulso ('+(c.imp-1)+' restantes)'}); this.setTab('cronica');
    setTimeout(()=>this.narrate(`O personagem verifica no Mural o ${this.fioTxt(f,i)}, usando uma habilidade investigativa coerente (Contabilidade para o dinheiro, Escuta para a fita, Faro para Mentiras para o depoimento). Responda com honestidade absoluta segundo a VERDADE OCULTA do caso: nunca minta sobre Fio verificado; se um dos Cartões foi plantado pela oposição, o Fio sai cortado. Mostre como ele descobre e termine com [FIO: ${i+1} | firme] ou [FIO: ${i+1} | cortado]. Se o Fio firme ligar um aliado ao inimigo, peça [CHOQUE: 3].`),60); }
  actFio(i){ const d=this.cur(), f=(d.caso.fios||[])[i]; if(!f) return; this.setTab('cronica');
    this.addLog({k:'action',text:'Age sobre o Fio solto · '+this.fioTxt(f,i)});
    setTimeout(()=>this.narrate(`O personagem age agora sobre o ${this.fioTxt(f,i)} sem tê-lo verificado (confronta alguém, invade, publica). Narre a ação. Se pela verdade oculta o Fio for falso, aplique a consequência pública — o inocente acusado, o processo, a matéria desmentida no telejornal das onze — com [SANGUE-FRIO: -2], [RUIDO: +2] e [FIO: ${i+1} | cortado]; se for verdadeiro, [FIO: ${i+1} | firme].`),60); }
  useMedalha(){ const d=this.cur(), c=d.char, n=(d.caso.medalhaUsos||0)+1;
    const esp=c.esp.includes('Sangue-Frio'), r=rnd(6), tot=r+(esp?1:0), pass=tot>=4, sf=pass?c.sf:clamp(c.sf-2,-12,8);
    const patch={sf}; if(n===3) patch.vicioTr=Math.min(3,c.vicioTr+1);
    this.setChar(patch); this.setCaso({medalhaUsos:n});
    this.addLog({k:'mech',who:'A Medalha · uso '+n,text:`${n===1?'+2 no próximo teste social diante de autoridade':'Já usada neste caso: abre a porta, sem o +2'} · Sangue-Frio 1d6 = ${r}${esp?' +1':''} contra 4 · ${pass?'aguentou':'falhou, perde 2'}${n===3?' · terceiro uso: um traço de Vício':''}`});
    this.setTab('cronica');
    setTimeout(()=>this.narrate(`O personagem mostra a medalha (${c.medalha||'a medalha da guerra'}) a quem manda na cena. ${n===1?'A porta se abre: trate o próximo pedido social a essa autoridade, patrão ou padre como tendo +2.':'A medalha já foi usada neste caso: ela ainda impressiona, mas não dá bônus.'} ${pass?'Ele aguenta a lembrança.':'Narre um segundo de guerra no meio da cena: o cheiro, o barulho, o nome de alguém.'}`),60); }
  flashback(){ const era=this.state.era, d=this.cur(), c=d.char; if(!c.lacoEra||d.caso.flash) return;
    const adr=modsOf(era).includes('adr'); if(adr&&c.adr<1){ this.addLog({k:'mech',who:'Flashback geracional',text:'Sem Adrenalina para pagar o flashback.'}); return; }
    this.setChar(adr?{adr:c.adr-1}:{sf:clamp(c.sf-2,-12,8)}); this.setCaso({flash:true});
    this.addLog({k:'mech',who:'Flashback geracional',text:`Em ${c.lacoEra} · ${adr?'−1 de Adrenalina':'−2 de Sangue-Frio'}`}); this.setTab('cronica');
    setTimeout(()=>this.narrate(`FLASHBACK GERACIONAL: corte para ${c.lacoEra}. O jogador assume o antepassado (${c.lacoDe||'de quem herdou o Laço'}; ficha de antepassado: ${c.antepassado||'quatro investigativas com 2 e quatro gerais com 6, coerentes com a era e o ofício'}). Narre, no ritmo e nas regras daquela era, uma cena curta em que o antepassado deixa algo pronto para hoje, ligado ao caso atual. Não desfaça nada que a mesa já viu, não contradiga a cronologia e respeite a consciência do antepassado. Se a preparação exigir risco, peça [TESTE: ...]; se falhar, a coisa existe mas deu errado, e isso se narra no presente. Termine voltando a ${era} com o que ficou pronto.`),60); }
  jaVi(){ this.setCaso({jaVi:true}); this.addLog({k:'mech',who:'Envelhecer',text:'“Já vi isso antes” · uma vez por caso'}); this.setTab('cronica');
    setTimeout(()=>this.narrate('O personagem, com setenta anos ou mais, declara que já viu isso antes. Entregue uma pista central do caso sem que ele esteja no lugar certo, como uma lembrança de outra década que de repente encaixa. Marque [PISTA: ...].'),60); }
  jumpEra(target, heir){
    const from=this.state.era; if(!target||+target<=+from) return;
    const c=this.cur().char, RT=R()[target], ex=this.state.eras[target];
    if(ex && ex.char && ex.char.nome && !confirm(`Já existe ${ex.char.nome} em ${target}. Substituir aquela ficha e arquivar a crônica de lá?`)) return;
    let nc;
    if(heir){ nc={...blankChar(target), lacoEra:from, lacoDe:c.nome||'', herancas:c.testamento||'', notas:`Herdeiro de ${c.nome||'um protagonista'} (${from}).`}; }
    else {
      const dec=Math.floor((+target - +from)/10), base=blankChar(target), inv={...base.inv};
      Object.keys(c.inv||{}).forEach(k=>{ if(k in inv) inv[k]=c.inv[k]; });
      inv['História da Cidade']=Math.min(4,(inv['História da Cidade']||1)+dec);
      const idade=c.anoNasc ? (+target - +c.anoNasc) : null;
      const toCod = !modsOf(from).includes('codigo') && modsOf(target).includes('codigo');
      const notas=[c.notas, `Salto de ${from} para ${target}: +${dec} em História da Cidade; mova até ${dec*2} pontos entre as gerais.`, idade!=null&&idade>=50?`Aos ${idade} anos: −1 de Atletismo por década depois dos 50.`:'', idade!=null&&idade>=70?'Setenta anos ou mais: −1 de Saúde máxima por década; uma vez por caso, “já vi isso antes”.':'', toCod?'A Integridade virou Código: escreva as três regras numa cena.':''].filter(Boolean).join('\n');
      nc={...base,...c,inv,esp:c.esp.filter(k=>RT.gerais.includes(k)),saude:8,sf:Math.min(8,c.sf),imp:4,adr:1,imprensa:0,ficha:0,ruido:0,vicioTr:0,ori:'',lado:c.lado||'Contrato',notas};
    }
    this.setState(s=>{ const eras={...s.eras}; eras[target]={...blankEra(target), char:nc}; return {era:target, eras, tab:'ficha', diceRes:null}; }, ()=>this.save());
  }

  renderVals(){
    const s=this.state;
    if(!s.ready) return {loading:true,noEra:false,hasEra:false};
    if(!s.era || !s.eras[s.era]) return {loading:false,noEra:true,hasEra:false,pick1934:()=>this.pickEra('1934'),pick1946:()=>this.pickEra('1946'),pick1974:()=>this.pickEra('1974'),pick1994:()=>this.pickEra('1994'),pick1999:()=>this.pickEra('1999')};
    const era=s.era, RR=R()[era], LL=L()[era], d=this.cur(), c={...blankChar(era),...d.char,inv:{...blankChar(era).inv,...d.char.inv}}, caso={...blankCaso(),...d.caso}, is94=era==='1994', SS=S();
    const has=m=>(RR.mods||[]).includes(m);
    const tabIs=k=>s.tab===k;
    const mkTrack=(label,key,min,max,boxMax,kind,hint)=>({label,v:c[key],state:kind?stateOf(c[key],kind):(key==='med'?(RR.medidor.niveis.find(([t])=>c.med>=t)||[0,''])[1]:c[key]+' / '+boxMax),hint,
      boxes:Array.from({length:boxMax},(_,i)=>({on:i<c[key],off:i>=c[key]})),
      inc:()=>this.setChar(x=>({[key]:clamp((x[key]||0)+1,min,max)})), dec:()=>this.setChar(x=>({[key]:clamp((x[key]||0)-1,min,max)}))});
    const tracks=[mkTrack('Saúde','saude',-12,8,8,'saude','0 a −5 Ferido · −6 Grave · −12 Morto'),mkTrack('Sangue-Frio','sf',-12,8,8,'sf','0 a −5 Abalado · −6 Marcado · −12 Quebrado'),mkTrack(RR.medidor.n,'med',0,10,10,null,has('codigo')?'Quebrar uma regra: −1 e choque 4':'Jogadas sujas funcionam, e custam'),mkTrack('Impulsos','imp',0,9,4,null,'4 por caso · Empate vira Avanço · benefícios')];
    if(has('adr')) tracks.push(mkTrack('Adrenalina','adr',0,3,3,null,'+2 depois do dado, ação extra, flashback'));
    if(has('imprensa')) tracks.push(mkTrack('Imprensa','imprensa',0,6,6,null,'Cheio: você vira procurado'));
    if(has('ficha')) tracks.push(mkTrack('A Ficha','ficha',0,6,6,null,'2 documentos na rua · 4 perde o emprego · 6 intimação na Sala 3'));
    if(has('ruido')) tracks.push(mkTrack('O Ruído','ruido',0,10,10,null,'O Diretor gasta 2, 3, 4 ou 6 · varrer baixa 2'));
    const field=k=>ev=>this.setChar({[k]:ev.target.value});
    const npcs=this.allNpcs();
    const send=()=>{ const txt=s.draft.trim(); if(!txt||s.busy) return; const npc=s.mode==='fala'&&s.talkTo?this.npcById(s.talkTo):null;
      this.addLog(s.mode==='fala'?{k:'speech',text:txt,to:npc?npc.n:''}:{k:'action',text:txt}); this.setState({draft:''});
      if(npc && !d.naCena.includes(npc.id)) this.upd(e=>({...e,naCena:[...e.naCena,npc.id]}));
      setTimeout(()=>this.narrate(s.mode==='fala'?(npc?`O personagem diz a ${npc.n}: "${txt}". Responda como ${npc.n}.`:`O personagem diz em voz alta: "${txt}". Narre a reação.`):`O personagem tenta: ${txt}. Narre.`, {npc}),30); };
    const logView=d.log.map(e=>{
      const acts=[];
      (e.acts||[]).forEach((a,i)=>{ if(a.done) return; const src={entryId:e.id,actIdx:i,narrate:true};
        if(a.t==='teste') acts.push({label:'Rolar '+a.v+(c.esp.includes(a.v)?' (+1)':''),go:()=>this.rollTest(a.v,src)});
        if(a.t==='choque') acts.push({label:'Choque de Sangue-Frio · perda '+a.v,go:()=>this.rollChoque(a.v,src)});
        if(a.t==='benef') acts.push({label:'Gastar 1 Impulso · '+a.v,go:()=>this.spendBenef(a.v,src)}); });
      (e.pend||[]).forEach(p=>{ if(p==='impulso') acts.push({label:'Gastar Impulso → Avanço',go:()=>this.resolvePend(e,'impulso')}); if(p==='adr') acts.push({label:'+2 com Adrenalina',go:()=>this.resolvePend(e,'adr')}); if(p==='aceitar') acts.push({label:'Aceitar resultado',go:()=>this.resolvePend(e,'aceitar')}); });
      return {...e,acts,isNarr:e.k==='narr',isNpc:e.k==='npc',isMech:e.k==='mech',isPlayer:e.k==='action'||e.k==='speech',
        who:e.k==='action'?(c.nome||'Você'):e.k==='speech'?((c.nome||'Você')+(e.to?' → '+e.to:'')):e.who, text:e.k==='speech'?'— '+e.text:(e.text||'').replace(/^#{1,6}\s*/gm,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/__(.+?)__/g,'$1')};
    });
    const regioes=LL.regioes;
    const metaOf=r=> era==='1934' ? `Dono: ${r.dono} · Dif. social ${r.dif} · Perigo à noite: ${r.perigo}` : (r.dono?'Quem manda: '+r.dono:'');
    const cenaR=regioes.find(r=>r.nome===d.cena);
    const goRegion=nome=>{ this.upd(e=>({...e,cena:nome})); this.setTab('cronica'); setTimeout(()=>this.narrate(`O personagem segue para ${nome}. Descreva a chegada como abertura de cena: um lugar concreto da região, quem está lá, o que essa pessoa quer.`),60); };
    const pesoTotal=caso.provas.reduce((a,p)=>a+p.peso,0);
    const V=caso.vant.length, P=caso.prob.length;
    const climax = V>P ? `Mais Vantagens que Problemas (${V} × ${P}): a verdade vence.` : V===P ? `Empate (${V} × ${P}): vence pela metade.` : `Mais Problemas que Vantagens (${V} × ${P}): a cidade vence.`;
    const climaxFull = climax + (c.med<=2 ? (has('codigo')?' Código vendido: alguém liga com um pedido que não se recusa.':' Integridade 2 ou menos: você aceita um acordo sujo no epílogo.') : '');
    const vpBlock=(title,key,sugs)=>({title, items:caso[key].map(t=>({t,del:()=>this.setCaso(x=>({[key]:x[key].filter(y=>y!==t)}))})), sugs:sugs.filter(t=>!caso[key].includes(t)).map(t=>({t,add:()=>this.setCaso(x=>({[key]:[...x[key],t]}))}))});
    const arqInfo=RR.arquetipos.find(a=>a.n===c.arq);
    const oriO = era==='1934' ? (RR.origens.find(o=>o.n===c.ori)) : null;
    const invAll=invList(era); const extras=invAll.reduce((a,k)=>a+Math.max(0,(c.inv[k]||1)-1),0);
    const q=norm(s.npcQ);
    const npcFiltered=npcs.filter(n=>(!s.npcReg || (s.npcReg==='__cena'?d.naCena.includes(n.id): s.npcReg==='__meus'?n.custom: n.r===s.npcReg)) && (!q || norm(n.n+' '+n.p).includes(q)));
    const armas=RR.armas.map(([l,m],i)=>({i:String(i),label:l+' · 1d6'+(m?sign(m):'')}));
    const choques=RR.choques.map(([l,p],i)=>({i:String(i),label:l+' · perda '+p}));
    const setDice=(title,big,detail)=>this.setState({diceRes:{title,big:String(big),detail,logged:false,nar:title+': '+detail}});
    const tabelas0 = (era==='1934'||era==='1946')
      ? [{label:'Cicatriz · d8',go:()=>{const r=rnd(8); setDice('Cicatriz (ao ficar Marcado)',RR.cicatrizes[r-1],'d8 = '+r);}},{label:'Perseguição a pé · trecho d8',go:()=>{const t=['Rua cheia · Atletismo 4','Varais e lençóis · Atletismo 3','Escadaria · Atletismo 5 subindo, 4 descendo','Mercado molhado · Atletismo 4','Telhados · Atletismo 5 para pular','Escada de incêndio · Atletismo 4','Porão ou túnel · Furtividade 4','Beco sem saída · escalar (Atletismo 5) ou lutar']; const r=rnd(8); setDice('Trecho da perseguição',r,t[r-1]);}},{label:'Barulho · 1 em 6',go:()=>{const r=rnd(6); setDice('A polícia chega?',r===1?'Sirenes':'Ainda não','d6 = '+r+' (a chance cresce a cada rodada de tiros)');}}]
      : [{label:'A Viúva · 3º round',go:()=>{const r=rnd(6); setDice('A Viúva entra?',r===6?'Ela entra':r===5?'Só se houver tira corrupto':'Não','d6 = '+r+' · 6 entra; 5 também, se houver policial corrupto na cena');}},{label:'Terreno · perseguição d6',go:()=>{const r=rnd(6); setDice('Terreno do round',r,RR.terreno[r-1]);}},{label:'Capangas fogem? d6',go:()=>{const r=rnd(6); setDice('Moral dos capangas',r<=3?'Fogem':'Ficam','d6 = '+r+' · 1–3 fogem');}}];
    const tabelas = (has('viuva')||era==='1934'||era==='1946') ? tabelas0 : tabelas0.filter(t=>!/Viúva/.test(t.label));
    const firmes=caso.fios.filter(f=>f.st==='firme').length, soltos=caso.fios.filter(f=>f.st==='solto').length, cortados=caso.fios.filter(f=>f.st==='cortado').length;
    const idade = c.anoNasc && /^\d{4}$/.test(String(c.anoNasc).trim()) ? (+era - +c.anoNasc) : null;
    const saltoOpts = ERAS.filter(e=>+e>+era).map(e=>({e,label:e+' · '+R()[e].sub}));
    const saltoSel = saltoOpts.some(o=>o.e===s.saltoEra) ? s.saltoEra : (saltoOpts[0]||{}).e;
    const showYear = y => s.futuro || +y <= +era;
    const splitLines = t => t.split('\n').map(l=>{const i=l.indexOf(':'); return i>0&&i<44?{h:l.slice(0,i),b:l.slice(i+1).trim()}:{h:'',b:l};});
    const regrasView=RR.regras.split('\n').map(l=>{const i=l.indexOf(':'); return i>0&&i<40?{h:l.slice(0,i),b:l.slice(i+1).trim()}:{h:'',b:l};});
    const segredoView = s.showSeg ? caso.segredo : '•••••• (só o narrador sabe)';
    return {
      loading:false,noEra:false,hasEra:true, era, eraSub:RR.sub, eraTitulo:RR.titulo, is1934:era==='1934', is1994:is94, is1946:era==='1946', is1974:era==='1974', is1999:era==='1999', hasCodigo:has('codigo'), hasMural:has('mural'), hasMedalha:has('medalha'), pjLabel:RR.pj,
      changeEra:()=>this.setState({era:null,diceRes:null},()=>this.save()),
      tabs:TABS.map(([k,label],i)=>({label,num:String(i+1).padStart(2,'0'),active:s.tab===k,inactive:s.tab!==k,go:()=>this.setTab(k)})),
      bgLayers:(()=>{ const M={cronica:'fundos/bar.jpg',caso:'fundos/mesa.jpg',ficha:'fundos/perseguicao.jpg',dados:'fundos/briga.jpg',elenco:'fundos/silhuetas.jpg',cidade:'fundos/cais.jpg',seculo:'fundo-eras.png',tutorial:'fundos/mesa.jpg'}; const cur=M[s.tab]||'fundos/cais.jpg'; return [...new Set(Object.values(M))].map(src=>({src,op:src===cur?'0.42':'0',sc:src===cur?'1.02':'1.08'})); })(),
      tabBg:({cronica:'fundos/bar.jpg',caso:'fundos/mesa.jpg',ficha:'fundos/perseguicao.jpg',dados:'fundos/briga.jpg',elenco:'fundos/silhuetas.jpg',cidade:'fundos/cais.jpg',seculo:'fundo-eras.png',tutorial:'fundos/mesa.jpg'})[s.tab]||'fundos/cais.jpg',
      tabCronica:(tabIs('cronica')||s.tab==='dados'),tabCaso:tabIs('caso'),tabFicha:tabIs('ficha'),tabDados:false,tabElenco:tabIs('elenco'),tabCidade:tabIs('cidade'),tabSeculo:tabIs('seculo'),tabTutorial:tabIs('tutorial'),
      goFicha:()=>this.setTab('ficha'), goCaso:()=>this.setTab('caso'),
      // crônica
      logRef:this.logRef, logMaxH:(d.log.some(e=>e.k==='narr'||e.k==='npc')||s.busy)?'64vh':'none', logOverflow:(d.log.some(e=>e.k==='narr'||e.k==='npc')||s.busy)?'auto':'visible',logView: d.log.some(e=>e.k==='narr'||e.k==='npc') ? logView : logView.filter(e=>!e.isMech), logEmpty:!d.log.some(e=>e.k==='narr'||e.k==='npc')&&!s.busy, busy:s.busy,
      ...(()=>{ const AB={
          '1934':{k:'Saint Village apresenta',t:'Três da Manhã',sub:'no Café Palermo',l:'A chuva escorre pela escadaria do Fórum.',r:'MCMXXXIV'},
          '1946':{k:'apresenta',t:'A Cadeira do Meio',sub:'',l:'Uma história sobre mentiras e segredos.',r:'MCMXLVI'},
          '1974':{k:'',t:'Um Clique a Mais',sub:'',l:'O telefone fez um clique a mais antes de dar linha',r:'MCMLXXIV'},
          '1994':{k:'Três e dez da manhã',t:'Palermo 24h',sub:'',l:'A única luz acesa na Rua Clay.',r:'MCMXCIV'},
          '1999':{k:'26.12.1999 03:20',t:'Três e Vinte',sub:'',l:'O sino da porta do Palermo 24h tocou.',r:'MCMXCIX'}}[era]||{k:'',t:'',sub:'',l:'',r:''};
        const ct=(caso.titulo||'').trim(), cp=(caso.premissa||'').trim();
        const short=x=>x.length>150?x.slice(0,147).replace(/\s+\S*$/,'')+'…':x;
        const sub=ct?'':AB.sub;
        return {abKicker:AB.k, abTitulo:ct||AB.t, abSub:sub, abHasSub:!!sub, abLinha:ct&&cp?short(cp):AB.l,
          abCopy:AB.r==='MCMXCIV'?'Uma história pulp de Saint Village 1994':(AB.r==='MCMXLVI'||AB.r==='MCMLXXIV')?AB.r:`${AB.r} SAINT VILLAGE XX Century`}; })(),
      emptyLine: ({'1934':'Três da manhã no Café Palermo. A chuva escorre pela escadaria do Fórum.','1946':'Março de 1946. Na Barbearia Fratelli, a cadeira do meio foi trocada; a nova não combina.','1974':'O telefone fez um clique a mais antes de dar linha.','1994':'Três e dez da manhã. O Palermo 24h é a única luz acesa na Clay.','1999':'Três e vinte da manhã. O sino da porta do Palermo 24h tocou.'})[era],
      openCase:()=>this.openCase(),
      askContinue:()=>this.narrate('Continue a cena: avance a situação um passo, com uma complicação ou um detalhe novo, sem agir pelo personagem.'),
      askClue:()=>{ this.setTab('cronica'); this.narrate('O jogador pede uma pista ou um gancho. Se o personagem estiver investigando algo, entregue a próxima pista central de forma concreta (marque com [PISTA: ...]); se não, apresente um gancho do livro ligado à região atual ou a uma facção, e mostre quem o traz.'); },
      askSummary:()=>this.narrate('Resuma a crônica até agora como um relatório datilografado: fatos, pistas, provas, Personagens do Diretor e pendências. Sem marcações.'),
      clearLog:()=>{ if(confirm('Arquivar (apagar) a crônica desta era? A ficha e o caso ficam.')) this.upd(e=>({...e,log:[]})); },
      modes:[['acao','Ação'],['fala','Fala']].map(([k,label])=>({label,active:s.mode===k,inactive:s.mode!==k,go:()=>this.setState({mode:k})})),
      modeFala:s.mode==='fala', talkTo:s.talkTo, onTalkTo:ev=>this.setState({talkTo:ev.target.value}),
      talkOptions:[...d.naCena.map(id=>this.npcById(id)).filter(Boolean), ...npcs.filter(n=>!d.naCena.includes(n.id))].map(n=>({id:n.id,nome:n.n+(d.naCena.includes(n.id)?' · em cena':'')})),
      draft:s.draft, onDraft:ev=>this.setState({draft:ev.target.value}),
      onDraftKey:ev=>{ if(ev.key==='Enter'&&!ev.shiftKey){ ev.preventDefault(); send(); } },
      sendLabel:s.busy?'Aguarde…':'Enviar', draftPh:s.mode==='fala'?'O que você diz?':'O que você faz?', send,
      cena:d.cena, onCena:ev=>{ const v=ev.target.value; this.upd(e=>({...e,cena:v})); },
      regionOptions:regioes.map(r=>({nome:r.nome})), hasCenaMeta:!!cenaR, cenaMeta:cenaR?metaOf(cenaR):'',
      naCenaView:d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>({nome:n.n,remove:()=>this.upd(e=>({...e,naCena:e.naCena.filter(x=>x!==n.id)}))})),
      naCenaEmpty:d.naCena.length===0,
      fichaTitle:c.nome||('Novo '+RR.pj), tracks,
      vantN:V, probN:P, vantView:caso.vant.map(t=>({t})), probView:caso.prob.map(t=>({t})), ...(()=>{ const st=[
          {n:1,label:'Monte a ficha',done:!!(c.nome||'').trim(),go:()=>this.setTab('ficha')},
          {n:2,label:'Abra um caso',done:!!((caso.premissa||'').trim()||(caso.titulo||'').trim()),go:()=>this.setTab('caso')},
          {n:3,label:'Jogue a primeira cena',done:d.log.some(e=>e.k==='narr'),go:()=>this.setTab('cronica')},
          {n:4,label:'Role um dado',done:!!s.lastRolls||d.log.some(e=>e.k==='mech'),go:()=>this.setTab('dados')}].map(x=>({...x,todo:!x.done}));
        return {guideSteps:st, guideShow:!s.guideOff && st.some(x=>!x.done), guideClose:()=>{ try{ localStorage.setItem('sv-guide-off','1'); }catch(e){} this.setState({guideOff:true}); }}; })(),
      pistasN:caso.pistas.length, pistasVazias:!caso.pistas.length, provasVazias:!caso.provas.length, pesoTotal, caso,
      // caso
      geradorTitulo: is94?'Arquivo · gancho do livro':era==='1934'?'Dossiê · gerador de casos (1d8 × 6)':'Dossiê · gerador de casos do século (1d6 × 5) e o toque da era', geradorBtn: is94?'Sortear gancho de uma região':era==='1934'?'Rolar o gerador de casos':'Rolar o gerador do século',
      c_titulo:ev=>this.setCaso({titulo:ev.target.value}), c_premissa:ev=>this.setCaso({premissa:ev.target.value}), c_nec:ev=>this.setCaso({nec:parseInt(ev.target.value)}),
      rollGerador:()=>this.rollGerador(), hasSegredo:!!caso.segredo, segredoView, segredoBtn:s.showSeg?'Esconder':'Espiar (estraga o mistério)', toggleSegredo:()=>this.setState({showSeg:!s.showSeg}),
      newCase:()=>{ if(confirm('Fechar o caso atual? Pistas, provas, Vantagens e Problemas são zerados e os Impulsos voltam a 4.')){ this.setCaso(blankCaso()); this.setChar(has('ruido')?{imp:4,ruido:Math.max(0,(RR.arquetipos.find(a=>a.n===c.arq)||{}).ruido||0)}:{imp:4}); } },
      pistasView:caso.pistas.map((p,i)=>({n:i+1,t:p.t,del:()=>this.setCaso(x=>({pistas:x.pistas.filter(y=>y.id!==p.id)}))})),
      pistaDraft:s.pistaDraft, onPistaDraft:ev=>this.setState({pistaDraft:ev.target.value}),
      addPista:()=>{ const t=s.pistaDraft.trim(); if(!t) return; this.setCaso(x=>({pistas:[...x.pistas,{id:uid(),t}]})); this.setState({pistaDraft:''}); },
      provasView:caso.provas.map(p=>({...p,del:()=>this.setCaso(x=>({provas:x.provas.filter(y=>y.id!==p.id)}))})),
      pesoPct:Math.min(100,Math.round(pesoTotal/caso.nec*100))+'%',
      provaDraft:s.provaDraft, onProvaDraft:ev=>this.setState({provaDraft:ev.target.value}), provaPeso:s.provaPeso, onProvaPeso:ev=>this.setState({provaPeso:ev.target.value}),
      addProva:()=>{ const t=s.provaDraft.trim(); if(!t) return; this.setCaso(x=>({provas:[...x.provas,{id:uid(),t,peso:parseInt(s.provaPeso)}]})); this.setState({provaDraft:''}); },
      vpBlocks:[vpBlock('Vantagens','vant',R().comum.vantagens),vpBlock('Problemas','prob',R().comum.problemas)], climax:climaxFull,
      // ficha
      char:c, prontos:RR.prontos.map((p,i)=>({i:String(i),nome:p.nome,arq:p.arq})),
      loadPronto:ev=>{ const p=RR.prontos[parseInt(ev.target.value)]; if(!p) return; const base=blankChar(era); Object.entries(p.inv).forEach(([k,v])=>{ if(k in base.inv) base.inv[k]=clamp(v,1,4); });
        const arq=RR.arquetipos.find(a=>a.n===p.arq)||{};
        this.setChar({...base,nome:p.nome,arq:p.arq,ori:p.ori,mot:p.mot||'',lado:p.lado||'Contrato',conceito:p.conceito,esp:p.esp,vicio:p.vicio,fontes:p.fontes||'',segredo:p.segredo,equip:p.equip,regras:p.regras||'',med:p.codigo||arq.integ||7,adr:1,sf:p.sf||8,...(p.heranca||{})}); },
      f_nome:field('nome'), f_conceito:field('conceito'), f_regras:field('regras'), f_fontes:field('fontes'), f_vicio:field('vicio'), f_segredo:field('segredo'), f_equip:field('equip'), f_notas:field('notas'),
      f_arq:ev=>{ const v=ev.target.value; const a=RR.arquetipos.find(x=>x.n===v)||{}; const p={arq:v}; if(a.integ) p.med=a.integ; if(a.ficha!=null) p.ficha=a.ficha; if(a.ruido>0) p.ruido=a.ruido; this.setChar(p); },
      f_ori:field('ori'), arqOptions:RR.arquetipos, oriLabel:era==='1934'?'Origem':'Bairro',
      oriOptions: era==='1934' ? RR.origens.map(o=>o.n) : regioes.map(r=>r.nome),
      motLabel: has('lado')?'Contrato ou Cruzada':'Motivação', motValue: has('lado')?c.lado:c.mot, motOptions: has('lado')?RR.lados:RR.motivacoes,
      f_mot:ev=>this.setChar(has('lado')?{lado:ev.target.value}:{mot:ev.target.value}),
      hasProntos:RR.prontos.length>0,
      hasCasosLivro:(RR.casos||[]).length>0, casosLivro:(RR.casos||[]).map(k=>({titulo:k.titulo,ano:k.ano,premissa:k.premissa,go:()=>this.loadCaso(k)})),
      hasGanchos:(RR.ganchos||[]).length>0, ganchos:(RR.ganchos||[]).map((g,i)=>({n:String(i+1),t:g,go:()=>{ this.setCaso({...blankCaso(),premissa:g}); this.setState({showSeg:false}); }})),
      pistaOpts:caso.pistas.map((p,i)=>({id:p.id,label:(i+1)+' · '+(p.t.length>56?p.t.slice(0,56)+'…':p.t)})),
      fioA:s.fioA, fioB:s.fioB, fioRel:s.fioRel, onFioA:ev=>this.setState({fioA:ev.target.value}), onFioB:ev=>this.setState({fioB:ev.target.value}), onFioRel:ev=>this.setState({fioRel:ev.target.value}),
      addFio:()=>{ if(!s.fioA||!s.fioB||s.fioA===s.fioB||!s.fioRel.trim()) return; this.setCaso(x=>({fios:[...(x.fios||[]),{id:uid(),a:s.fioA,b:s.fioB,rel:s.fioRel.trim(),st:'solto'}]})); this.setState({fioRel:''}); },
      fiosView:caso.fios.map((f,i)=>({n:String(i+1),txt:this.fioTxt(f,i).replace(/^Fio \d+: /,''),isFirme:f.st==='firme',isCortado:f.st==='cortado',isSolto:f.st==='solto',verify:()=>this.verifyFio(i),act:()=>this.actFio(i),del:()=>this.setCaso(x=>({fios:x.fios.filter(y=>y.id!==f.id)}))})),
      muralInfo:`${caso.pistas.length} Cartões · ${firmes} firmes · ${soltos} soltos · ${cortados} cortados · ${triCount(caso.fios)} triângulos · Ruído ${c.ruido||0}`,
      f_medalha:field('medalha'), medalhaUsos:String(caso.medalhaUsos||0), useMedalha:()=>this.useMedalha(),
      f_anoNasc:field('anoNasc'), f_lacoEra:field('lacoEra'), f_lacoDe:field('lacoDe'), f_herancas:field('herancas'), f_testamento:field('testamento'), f_antepassado:field('antepassado'),
      idadeLabel: idade!=null ? `${idade} anos em ${era}` : 'Anote o ano de nascimento para envelhecer entre as eras',
      canFlash:!!c.lacoEra && !caso.flash, doFlash:()=>this.flashback(), flashLabel:'Flashback geracional · '+(has('adr')?'1 de Adrenalina':'2 de Sangue-Frio'),
      canJaVi: idade!=null && idade>=70 && !caso.jaVi, doJaVi:()=>this.jaVi(),
      flashInfo: !c.lacoEra ? 'Com um Laço de Herança, uma vez por caso, você volta décadas e joga o antepassado que deixou algo pronto para hoje.' : caso.flash ? 'Flashback geracional já usado neste caso.' : `Uma vez por caso: “em ${c.lacoEra}…”`,
      hasSalto:saltoOpts.length>0, saltoOptions:saltoOpts, saltoEra:saltoSel, onSaltoEra:ev=>this.setState({saltoEra:ev.target.value}),
      jumpSame:()=>this.jumpEra(saltoSel,false), jumpHeir:()=>this.jumpEra(saltoSel,true),
      futuroLabel: s.futuro?'Esconder o futuro':'Mostrar o futuro (spoilers)', toggleFuturo:()=>this.setState({futuro:!s.futuro}),
      cronoLabel: s.futuro ? '1792–1999' : 'até '+era,
      seculoEras:SS.eras.map(([e,g,q])=>({e,g,q,atual:e===era,outra:e!==era,go:()=>this.pickEra(e)})),
      cronoView:SS.cronologia.filter(([a])=>showYear(a)).map(([a,t])=>({a,t})),
      testemunhasView:SS.testemunhas.map(([n,vida,viu,carrega])=>({n,vida,viu,carrega})),
      linhagensView:SS.linhagens.map(([fam,...cols])=>({fam,cols:cols.map((t,i)=>({y:ERAS[i],t})).filter(x=>showYear(x.y))})),
      camadasView:Object.entries(SS.camadas).map(([k,v])=>({k,cols:['1934','1946','1974','1994'].filter(showYear).map(y=>({y,t:v[y]}))})),
      ancorasView:SS.ancoras.map(([n,t])=>({n,t})),
      hasDestinos: s.futuro || era!=='1934', destinosView:SS.destinos.map(([n,t])=>({n,t})),
      vozesView:SS.vozes.map(([n,t])=>({n,t})),
      intermezzosView:SS.intermezzos.map(i=>({ano:i.ano,titulo:i.titulo,premissa:i.premissa,btn:i.era===era?'Carregar no caderno':'Jogar em '+i.era,go:()=>{ if(i.era===era) this.loadCaso(i); else { this.pickEra(i.era); setTimeout(()=>this.loadCaso(i),40); } }})),
      seculoRegras:splitLines(SS.regras),
      canoneView:SS.canone.replace(/^[^:]+:\s*/,'').split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/).map(t=>({t})),
      hasArqInfo:!!arqInfo, arqInfo:arqInfo||{}, hasOriInfo:!!oriO, oriInfo:oriO?`${oriO.rep}${oriO.pt?'; 1 ponto grátis em '+oriO.pt:''}; contato: ${oriO.c}`:'',
      extrasLabel:`Todas com 1 · extras ${extras} de 8 · máx. 3 numa`,
      invView:invAll.map(k=>({k,v:c.inv[k]||1,inc:()=>{ if(extras>=8||(c.inv[k]||1)>=4) return; this.setChar(x=>({inv:{...x.inv,[k]:(x.inv[k]||1)+1}})); },dec:()=>this.setChar(x=>({inv:{...x.inv,[k]:Math.max(1,(x.inv[k]||1)-1)}}))})),
      espLabel:c.esp.length+' de 3',
      geraisView:RR.gerais.map(k=>{const on=c.esp.includes(k); return {k,on,off:!on,label:k+(on?' (+1)':''),toggle:()=>this.setChar(x=>({esp:on?x.esp.filter(y=>y!==k):(x.esp.length>=3?x.esp:[...x.esp,k])}))};}),
      vicioBoxes:[0,1,2].map(i=>({on:i<c.vicioTr,off:i>=c.vicioTr})),
      useVicio:()=>{ const tr=c.vicioTr+1; if(tr>=3){ this.setChar({sf:clamp(c.sf+2,-12,8),vicioTr:0}); this.addLog({k:'mech',who:'A Garrafa',text:`${c.vicio||'O vício'}: +2 de Sangue-Frio · terceiro traço — o vício cobra na próxima cena`}); }
        else { this.setChar({sf:clamp(c.sf+2,-12,8),vicioTr:tr}); this.addLog({k:'mech',who:'A Garrafa',text:`${c.vicio||'O vício'}: +2 de Sangue-Frio · traço ${tr} de 3`}); } },
      resetChar:()=>{ if(confirm('Apagar a ficha desta era?')) this.setChar(blankChar(era)); },
      // dados
      soloHab:s.soloHab, onSoloHab:ev=>this.setState({soloHab:ev.target.value}), soloModLabel:sign(s.soloMod)||'0',
      soloModInc:()=>this.setState({soloMod:s.soloMod+1}), soloModDec:()=>this.setState({soloMod:s.soloMod-1}),
      rollSolo:()=>this.rollTest(s.soloHab,{mod:s.soloMod,narrate:false}),
      gold:s.gold, goldNeed:Math.max(1,(s.gold.dif||0)-(s.gold.gasto||0)), goldImpossivel:(s.gold.dif||0)-(s.gold.gasto||0)>6, goldCerto:(s.gold.dif||0)-(s.gold.gasto||0)<=1, goldNormal:((s.gold.dif||0)-(s.gold.gasto||0))>1&&((s.gold.dif||0)-(s.gold.gasto||0))<=6,
      lastDice:(s.lastRolls||[]).map(r=>({isD6:r.n===6,isD8:r.n!==6,v:r.v,pips:Array.from({length:9},(_,k)=>({on:r.n===6&&SV_PIPS[r.v].includes(k),off:!(r.n===6&&SV_PIPS[r.v].includes(k))}))})), hasLastDice:!!(s.lastRolls&&s.lastRolls.length), goldGInc:()=>this.setState({gold:{...s.gold,gasto:s.gold.gasto+1}}), goldGDec:()=>this.setState({gold:{...s.gold,gasto:Math.max(0,s.gold.gasto-1)}}),
      goldDInc:()=>this.setState({gold:{...s.gold,dif:Math.min(8,s.gold.dif+1)}}), goldDDec:()=>this.setState({gold:{...s.gold,dif:Math.max(2,s.gold.dif-1)}}),
      rollGold:()=>{ const r=rnd(6), t=r+s.gold.gasto; setDice('Regra de ouro',t>=s.gold.dif?'Conseguiu':'Falhou',`1d6 = ${r} + ${s.gold.gasto} gastos = ${t} contra Dificuldade ${s.gold.dif}`); },
      armas, danoArma:s.danoArma, onDanoArma:ev=>this.setState({danoArma:ev.target.value}), qrLabel:s.qr?'Queima-roupa +2 ✓':'Queima-roupa +2', toggleQR:()=>this.setState({qr:!s.qr}),
      rollDano:()=>{ const [l,m]=RR.armas[parseInt(s.danoArma)]; const r=rnd(6); const t=Math.max(0,r+m+(s.qr?2:0)); setDice('Dano · '+l,t,`1d6 = ${r}${m?' '+sign(m):''}${s.qr?' +2 queima-roupa':''} = ${t} de Saúde`); },
      choques, choqueI:s.choqueI, onChoque:ev=>this.setState({choqueI:ev.target.value}),
      rollChoqueSel:()=>this.rollChoque(RR.choques[parseInt(s.choqueI)][1],null),
      tabelas, livre:s.livre, livreInc:()=>this.setState({livre:{n:Math.min(10,s.livre.n+1)}}), livreDec:()=>this.setState({livre:{n:Math.max(1,s.livre.n-1)}}),
      rollD6:()=>{ const f=Array.from({length:s.livre.n},()=>rnd(6)); setDice(s.livre.n+'d6',f.reduce((a,b)=>a+b,0),f.join(' · ')); },
      rollD8:()=>{ const f=Array.from({length:s.livre.n},()=>rnd(8)); setDice(s.livre.n+'d8',f.reduce((a,b)=>a+b,0),f.join(' · ')); },
      diceRes:s.diceRes||{}, hasDiceRes:!!s.diceRes, noDiceRes:!s.diceRes, diceResNotLogged:!!s.diceRes&&!s.diceRes.logged,
      diceToLog:()=>{ const r=s.diceRes; if(!r) return; this.addLog({k:'mech',who:r.title,text:r.big+' · '+r.detail}); this.setState({diceRes:{...r,logged:true}}); },
      diceNarrate:()=>{ const r=s.diceRes; if(!r) return; if(!r.logged) this.addLog({k:'mech',who:r.title,text:r.big+' · '+r.detail}); this.setState({diceRes:{...r,logged:true}}); this.setTab('cronica'); setTimeout(()=>this.narrate(`O jogador rolou fora de um pedido seu — ${r.nar} Resultado: ${r.big}. Interprete na ficção atual e narre.`),50); },
      // elenco
      elencoCount:LL.npcs.length, npcQ:s.npcQ, onNpcQ:ev=>this.setState({npcQ:ev.target.value}), npcReg:s.npcReg, onNpcReg:ev=>this.setState({npcReg:ev.target.value}),
      npcView:npcFiltered.map(n=>{const inScene=d.naCena.includes(n.id); return {...n,inScene,hasQuad:!!(n.v||n.pe||n.q||n.t),custom:!!n.custom,toggleLabel:inScene?'Tirar de cena':'Pôr em cena',
        toggle:()=>this.upd(e=>({...e,naCena:inScene?e.naCena.filter(x=>x!==n.id):[...e.naCena,n.id]})),
        talk:()=>{ this.upd(e=>({...e,naCena:e.naCena.includes(n.id)?e.naCena:[...e.naCena,n.id]})); this.setState({tab:'cronica',mode:'fala',talkTo:n.id},()=>this.save()); },
        del:()=>this.upd(e=>({...e,custom:e.custom.filter(x=>'c'+x.cid!==n.id),naCena:e.naCena.filter(x=>x!==n.id)}))};}),
      npcForm:s.npcForm, n_nome:ev=>this.setState({npcForm:{...s.npcForm,nome:ev.target.value}}), n_papel:ev=>this.setState({npcForm:{...s.npcForm,papel:ev.target.value}}), n_desc:ev=>this.setState({npcForm:{...s.npcForm,desc:ev.target.value}}),
      addNpc:()=>{ const f=s.npcForm; if(!f.nome.trim()) return; this.upd(e=>({...e,custom:[...(e.custom||[]),{cid:uid(),n:f.nome.trim(),p:f.papel.trim()||'Desconhecido',d:f.desc.trim(),r:d.cena||''}]})); this.setState({npcForm:{nome:'',papel:'',desc:''}}); },
      genNpc:async()=>{ if(!window.svAI||this.state.busy) return; this.setState({busy:true});
        try{ const txt=await window.svAI({system:`Crie um Personagem do Diretor original para ${RR.titulo}, coerente com o livro. Região: ${d.cena||'à sua escolha'}. Trecho do livro:\n${(LL.textos[d.cena]||LL.geral).slice(0,6000)}\nTodo PdD tem quatro linhas: virtude, pecado, quer, teme. Responda SOMENTE JSON: {"n":"nome","p":"papel, idade","d":"duas frases","v":"","pe":"","q":"","t":""}`,
            messages:[{role:'user',content:'Novo personagem, diferente destes: '+npcs.map(n=>n.n).slice(-40).join(', ')}],max_tokens:500});
          const j=JSON.parse(txt.slice(txt.indexOf('{'),txt.lastIndexOf('}')+1)); this.upd(e=>({...e,custom:[...(e.custom||[]),{cid:uid(),...j,r:d.cena||''}]})); this.setState({npcReg:'__meus'});
        }catch(err){ this.addLog({k:'mech',who:'Erro',text:'Não foi possível gerar o NPC.'}); }
        this.setState({busy:false}); },
      // cidade
      ...this.mapVals(s,era,d,SS,goRegion),
      regionView:regioes.map(r=>{ const ns=LL.npcs.filter(n=>n.r===r.nome).map(n=>n.n); return {nome:r.nome,atual:d.cena===r.nome,meta:metaOf(r),resumo:r.resumo,lugares:(r.lugares||[]).map(([n,dd])=>({n,d:dd})),hasLugares:(r.lugares||[]).length>0,hasGancho:!!r.gancho,gancho:r.gancho,hasNpcs:ns.length>0,npcs:ns.join(', '),go:()=>goRegion(r.nome),set:()=>this.upd(e=>({...e,cena:r.nome}))}; }),
      // tutorial
      tutorial:[
        {n:'1',t:'O que é isto',d:`Um narrador e Diretor para jogar ${RR.titulo} sozinho. O narrador conhece as regras, as facções, as regiões e os Personagens do Diretor do livro, e lê o capítulo da região onde a cena acontece.`},
        {n:'2',t:'A regra do jogo solo',d:'O livro traz “Jogando a dois” (inspirado no GUMSHOE One-2-One). O app usa essa regra: você tem todas as habilidades investigativas com 1 ponto, mais 8 para distribuir, três especialidades gerais, Saúde e Sangue-Frio 8 e 4 Impulsos por caso.'+({'1934':'','1946':' Em 1946, a Ficha e a Medalha entram em jogo.','1974':' Em 1974, o Código, o Mural e o Ruído entram em jogo.','1994':' Em 1994, Adrenalina, Código, Imprensa e a Viúva continuam valendo.','1999':' Em 1999, Adrenalina, Código, o Mural e o Ruído valem juntos; a Viúva não.'})[era]},
        {n:'3',t:'Monte a ficha',d:`Na Ficha, carregue um ${RR.pj.toLowerCase()} pronto do livro ou crie o seu: conceito, arquétipo, ${has('lado')?'bairro, Contrato ou Cruzada, as três regras do Código':has('codigo')?'bairro, motivação, as três regras do Código':era==='1934'?'origem, motivação':'bairro, motivação'}, vício, fontes de Sangue-Frio e um segredo.`},
        {n:'4',t:'Abra um caso',d: !['1934','1994'].includes(era)?'Na aba Caso, carregue um Arquivo pronto ou um Intermezzo do livro, escolha um gancho da era ou role o gerador de casos do século. Você vê só a premissa; a verdade fica com o narrador.': is94?'Na aba Caso, sorteie um gancho do livro (dois por região) ou escreva sua premissa, e peça a abertura.':'Na aba Caso, role o gerador de casos do livro (cliente, crime, vítima, culpado, motivo, reviravolta). Você vê só a premissa; a verdade fica com o narrador.'},
        {n:'5',t:'Investigue, não role',d:'Diga o que você faz e onde procura. Pistas centrais nunca exigem rolagem: elas chegam e vão para o caderno. Quando o narrador oferecer um benefício extra, aparece um botão para gastar 1 Impulso.'},
        {n:'6',t:'Role quando houver risco',d:'Ações gerais incertas viram um botão de teste: 1d6 + modificadores. Revés (1–2) traz um Problema; Empate (3–4) consegue com custo, ou gaste um Impulso para virar Avanço; Avanço (5+) consegue e pode render uma Vantagem.'},
        {n:'7',t:'Pague o preço',d:`Choques de Sangue-Frio, dano e quedas de ${RR.medidor.n} são aplicados na ficha automaticamente. Ceder ao vício devolve 2 de Sangue-Frio; com três traços, ele cobra.`},
        {n:'8',t:'Converse e feche o caso',d:'No Elenco, ponha Personagens do Diretor em cena ou converse com eles: a IA assume a voz de cada um pelas quatro linhas. No clímax, mais Vantagens que Problemas, a verdade vence; o Peso das provas decide se ela sobrevive ao Fórum.'},
        {n:'9',t:'Jogue o século',d:'Na aba Século estão a cronologia, as famílias, as Testemunhas e o cânone que corrige os livros. Na Ficha, anote o ano de nascimento, o Laço de Herança e o testamento; leve o mesmo protagonista para uma era posterior (ele envelhece) ou crie um herdeiro que recebe o testamento.'}
      ],
      regrasView
    };
  }
}
