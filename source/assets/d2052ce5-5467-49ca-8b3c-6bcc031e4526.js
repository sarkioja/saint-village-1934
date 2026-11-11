/* Saint Village · trilha ambiente com "Tocando agora" e volume (desktop, tablet e celular) */
(function(){
  if (window.__svSom) return; window.__svSom = true;

  var M = 'musica/';
  var TRACKS_34 = [
    {f:'noirtales-film-noir-566510.mp3', t:'Film Noir', a:'NoirTales'},
    {f:'markmusicstudio-noir-piano-club-572124.mp3', t:'Noir Piano Club', a:'Mark Music Studio'},
    {f:'konstantinpazuzustudio-crime-scene-investigation-asmr-noir-jazz-520242.mp3', t:'Crime Scene Investigation', a:'Konstantin Pazuzu'},
    {f:'alex-morgan-noir-jazz-detective-midnight-mystery-587403.mp3', t:'Midnight Mystery', a:'Alex Morgan'},
    {f:'konstantinpazuzustudio-forensic-evidence-asmr-noir-jazz-520236.mp3', t:'Forensic Evidence', a:'Konstantin Pazuzu'},
    {f:'madstock-noir-340140.mp3', t:'Noir', a:'Madstock'},
    {f:'konstantinpazuzustudio-suspect-profiling-asmr-noir-jazz-520237.mp3', t:'Suspect Profiling', a:'Konstantin Pazuzu'},
    {f:'konstantinpazuzustudio-my-crime-story-asmr-noir-jazz-520241.mp3', t:'My Crime Story', a:'Konstantin Pazuzu'},
    {f:'konstantinpazuzustudio-police-interrogation-asmr-noir-jazz-520244.mp3', t:'Police Interrogation', a:'Konstantin Pazuzu'},
    {f:'konstantinpazuzustudio-unsolved-mystery-asmr-noir-jazz-520239.mp3', t:'Unsolved Mystery', a:'Konstantin Pazuzu'},
    {f:'konstantinpazuzustudio-gritty-noir-asmr-noir-jazz-520243.mp3', t:'Gritty Noir', a:'Konstantin Pazuzu'}
  ];

  var TRACKS_94 = [
    {f:'alex-morgan-surf-rock-591326.mp3', t:'Surf Rock', a:'Alex Morgan'},
    {f:'vlad_annenkov-tarantino-blues-quotmidnight-mirage-471931.mp3', t:'Midnight Mirage', a:'Vlad Annenkov'},
    {f:'sub_clair-funk-instrumental-610619.mp3', t:'Funk Instrumental', a:'Sub Clair'},
    {f:'emand_edroff-la-siesta-del-pistolero-616040.mp3', t:'La Siesta del Pistolero', a:'Emand Edroff'},
    {f:'remstunes-spy-surf-392415.mp3', t:'Spy Surf', a:'RemsTunes'},
    {f:'octosound-cobra-169065.mp3', t:'Cobra', a:'Octosound'},
    {f:'positive_sound-spaghetti-western-491538.mp3', t:'Spaghetti Western', a:'Positive Sound'},
    {f:'abydos_music-energetic-garage-rock-171763.mp3', t:'Energetic Garage Rock', a:'Abydos Music'},
    {f:'luis_humanoide-western-theme-162884.mp3', t:'Western Theme', a:'Luis Humanoide'}
  ];
  /* trilha por era: 1934 noir jazz; 1994 surf, funk e western do cinema pulp */
  var LISTS = {'1934':TRACKS_34, '1994':TRACKS_94};
  var curEra = window.__svEraSent || 'home';
  var TRACKS = LISTS[curEra] || TRACKS_34;
  function get(k,d){ try{ var v=localStorage.getItem('svSom.'+k); return v===null?d:v; }catch(e){ return d; } }
  function set(k,v){ try{ localStorage.setItem('svSom.'+k,String(v)); }catch(e){} }

  var vol = Math.min(1, Math.max(0, parseFloat(get('vol','0.35')) || 0.35));
  var muted = get('mute','0')==='1';
  var wantOff = get('off','0')==='1';
  var collapsed = get('min','0')==='1';
  var idx = 0; /* cada era começa pela faixa-tema: Film Noir (1934), Surf Rock (1994) */
  var audio = new Audio(); audio.preload='none'; audio.volume=0;
  var fadeT=null, started=false;

  var css = ''
  /* player clean: uma faixa fina, sem moldura pesada; o equalizador indica que está tocando */
  + '.svs{position:fixed;z-index:70;right:20px;bottom:calc(20px + env(safe-area-inset-bottom,0px));width:300px;'
  + 'background:rgba(12,12,13,.82);border:1px solid rgba(255,255,255,.07);border-radius:3px;box-shadow:0 10px 30px rgba(0,0,0,.45);'
  + 'color:#d4d4d4;font-family:"Oswald",sans-serif;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);overflow:hidden}'
  + '.svs *{box-sizing:border-box}'
  + '.svs button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;-webkit-tap-highlight-color:transparent}'
  + '.svs button:focus-visible,.svs input:focus-visible{outline:1px solid #e0e0e0;outline-offset:1px}'
  + '.svs-row{display:flex;align-items:center;gap:12px;padding:10px 8px 10px 14px}'
  /* equalizador (3 barras) no lugar do disco */
  + '.svs-disc{flex:none;width:14px;height:14px;display:flex;align-items:flex-end;gap:2px}'
  + '.svs-disc i{flex:1;height:30%;background:#6f7073;border-radius:1px;transition:background .3s}'
  + '.svs.on .svs-disc i{background:#e6e6e6;animation:svsEq 1.1s ease-in-out infinite}'
  + '.svs.on .svs-disc i:nth-child(2){animation-delay:-.45s;animation-duration:.9s}'
  + '.svs.on .svs-disc i:nth-child(3){animation-delay:-.2s;animation-duration:1.3s}'
  + '@keyframes svsEq{0%,100%{height:25%}50%{height:100%}}'
  + '.svs-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}'
  + '.svs-lbl{font-size:9px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;color:#6f7073;line-height:1.2}'
  + '.svs-tw{overflow:hidden;white-space:nowrap;-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}'
  + '.svs-title{display:inline-block;font-family:"Oswald",sans-serif;font-weight:400;font-size:13px;letter-spacing:.06em;color:#ededed;line-height:1.3}'
  + '.svs-title.scroll{animation:svsMarq 14s linear infinite;padding-right:40px}'
  + '@keyframes svsMarq{0%,12%{transform:translateX(0)}88%,100%{transform:translateX(var(--svs-x,0))}}'
  + '.svs-art{display:none}'
  + '.svs-ctl{display:flex;align-items:center;flex:none}'
  + '.svs-b{width:34px;height:34px;color:#9a9a9d;transition:color .2s}'
  + '.svs-b:hover,.svs-b[aria-expanded="true"]{color:#fff}'
  + '.svs-b svg{width:13px;height:13px;fill:currentColor}'
  + '.svs-play{color:#ededed}'
  + '.svs-play svg{width:14px;height:14px}'
  + '.svs-prev{display:none !important}'
  + '.svs-bar{position:absolute;left:0;right:0;bottom:0;height:1px;background:transparent}'
  + '.svs-bar i{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(230,230,230,.55)}'
  + '.svs-vol{display:none;align-items:center;gap:10px;padding:0 14px 12px}'
  + '.svs.vopen .svs-vol{display:flex}'
  + '.svs-mute{width:20px;height:20px;color:#9a9a9d}'
  + '.svs-mute:hover{color:#fff}'
  + '.svs-mute svg{width:14px;height:14px;fill:currentColor}'
  + '.svs-range{-webkit-appearance:none;appearance:none;flex:1;height:20px;background:transparent;cursor:pointer;--p:35%}'
  + '.svs-range::-webkit-slider-runnable-track{height:2px;background:linear-gradient(90deg,#d4d4d4 var(--p),#2a2a2d var(--p))}'
  + '.svs-range::-moz-range-track{height:2px;background:#2a2a2d}'
  + '.svs-range::-moz-range-progress{height:2px;background:#d4d4d4}'
  + '.svs-range::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;margin-top:-4px;border-radius:50%;background:#efefef;border:0}'
  + '.svs-range::-moz-range-thumb{width:10px;height:10px;border-radius:50%;background:#efefef;border:0}'
  + '.svs-pct{width:24px;text-align:right;font-size:10px;letter-spacing:.08em;color:#6f7073}'
  + '.svs .svs-min{display:none}'
  + '@media (max-width:1024px){.svs{right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));width:280px}}'
  + '@media (max-width:640px){'
  + '.svs{left:12px;right:12px;width:auto;bottom:calc(12px + env(safe-area-inset-bottom,0px))}'
  + '.svs-row{padding:6px 4px 6px 14px}'
  + '.svs-b{width:42px;height:42px}'
  + '.svs-lbl{font-size:8px}'
  + 'body.svs-pad .sv-content{padding-bottom:120px !important}'
  + '}'
  + '@media (prefers-reduced-motion:reduce){.svs.on .svs-disc i,.svs-title.scroll{animation:none}.svs.on .svs-disc i{height:70%}}'
  + '@media print{.svs{display:none}}';

  var I = {
    play:'<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9.5-5.5z"/></svg>',
    pause:'<svg viewBox="0 0 16 16"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
    next:'<svg viewBox="0 0 16 16"><path d="M2.5 2.5v11l7.5-5.5zM10.5 2.5h2.5v11h-2.5z"/></svg>',
    prev:'<svg viewBox="0 0 16 16"><path d="M13.5 2.5v11L6 8zM3 2.5h2.5v11H3z"/></svg>',
    vol:'<svg viewBox="0 0 16 16"><path d="M2 6h3l4-3v10l-4-3H2z"/><path d="M11 5.2a4 4 0 0 1 0 5.6l-.8-.8a2.9 2.9 0 0 0 0-4z"/><path d="M12.6 3.6a6.3 6.3 0 0 1 0 8.8l-.8-.8a5.2 5.2 0 0 0 0-7.2z"/></svg>',
    mute:'<svg viewBox="0 0 16 16"><path d="M2 6h3l4-3v10l-4-3H2z"/><path d="M11 5.5l1 -1 1.5 1.5 1.5-1.5 1 1L14.5 7l1.5 1.5-1 1L13.5 8 12 9.5l-1-1L12.5 7z"/></svg>'
  };

  function build(){
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var el=document.createElement('div');
    el.className='svs';
    el.setAttribute('role','region'); el.setAttribute('aria-label','Trilha sonora');
    el.innerHTML=''
      + '<div class="svs-bar" aria-hidden="true"><i></i></div>'
      + '<div class="svs-row">'
      +   '<div class="svs-disc" aria-hidden="true"><i></i><i></i><i></i></div>'
      +   '<div class="svs-meta"><div class="svs-lbl"><span class="svs-st">Tocando agora</span></div>'
      +     '<div class="svs-tw"><span class="svs-title" aria-live="polite"></span></div><div class="svs-art"></div></div>'
      +   '<div class="svs-ctl">'
      +     '<button class="svs-b svs-prev" aria-label="Faixa anterior">'+I.prev+'</button>'
      +     '<button class="svs-b svs-play" aria-label="Tocar">'+I.play+'</button>'
      +     '<button class="svs-b svs-next" aria-label="Próxima faixa">'+I.next+'</button>'
      +     '<button class="svs-b svs-vbtn" aria-label="Volume" aria-expanded="false">'+I.vol+'</button>'
      +   '</div>'
      + '</div>'
      + '<div class="svs-vol"><button class="svs-mute" aria-label="Silenciar">'+I.vol+'</button>'
      +   '<input class="svs-range" type="range" min="0" max="100" step="1" aria-label="Volume da trilha"><span class="svs-pct"></span></div>'
      + '<button class="svs-min" aria-label="Recolher player" title="Recolher">–</button>';
    document.body.appendChild(el);
    document.body.classList.add('svs-pad');

    var q=function(s){return el.querySelector(s);};
    var bPlay=q('.svs-play'), bNext=q('.svs-next'), bPrev=q('.svs-prev'), bMute=q('.svs-mute'), bV=q('.svs-vbtn'), bMin=q('.svs-min');
    var rng=q('.svs-range'), pct=q('.svs-pct'), ttl=q('.svs-title'), art=q('.svs-art'), bar=q('.svs-bar i'), stx=q('.svs-st'), disc=q('.svs-disc');

    function target(){ return muted?0:vol; }
    function fadeTo(v,ms,cb){
      clearInterval(fadeT); var from=audio.volume, t0=performance.now();
      fadeT=setInterval(function(){ var k=Math.min(1,(performance.now()-t0)/ms); audio.volume=Math.max(0,Math.min(1,from+(v-from)*k)); if(k>=1){clearInterval(fadeT); cb&&cb();} },40);
    }
    function paintVol(){
      var p=Math.round(vol*100); rng.value=p; rng.style.setProperty('--p',p+'%'); pct.textContent=muted?'—':p;
      bMute.innerHTML=(muted||vol===0)?I.mute:I.vol; bMute.setAttribute('aria-label',muted?'Ativar som':'Silenciar');
    }
    function paintTrack(){
      var tr=TRACKS[idx]; ttl.textContent=tr.t+'  ·  '+tr.a; art.textContent=tr.a; ttl.classList.remove('scroll');
      requestAnimationFrame(function(){ var w=ttl.scrollWidth, c=ttl.parentNode.clientWidth; if(w>c+4){ ttl.style.setProperty('--svs-x',(c-w-40)+'px'); ttl.classList.add('scroll'); } });
    }
    function paintState(){
      var on=!audio.paused; el.classList.toggle('on',on);
      bPlay.innerHTML=on?I.pause:I.play; bPlay.setAttribute('aria-label',on?'Pausar':'Tocar');
      stx.textContent=on?'Tocando agora':'Em pausa';
    }
    /* carregamento robusto: tenta tocar direto (streaming); se o aparelho falhar (comum no celular),
       baixa a faixa inteira uma vez e toca do arquivo local. Nunca pula mais de 3 faixas seguidas por erro. */
    var blobUrl=null, triedBlob=false, fails=0, loadTok=0;
    function load(i){
      idx=(i+TRACKS.length)%TRACKS.length; triedBlob=false; loadTok++;
      if(blobUrl){ try{ URL.revokeObjectURL(blobUrl); }catch(_){} blobUrl=null; }
      audio.src=M+TRACKS[idx].f; paintTrack();
    }
    function viaBlob(){
      triedBlob=true; var tok=loadTok, at=audio.currentTime||0;
      stx.textContent='Carregando…';
      fetch(M+TRACKS[idx].f).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){
        if(tok!==loadTok) return;
        blobUrl=URL.createObjectURL(b); audio.src=blobUrl;
        if(at>1){ try{ audio.currentTime=at; }catch(_){} }
        if(started&&!wantOff) play();
      }).catch(function(){ if(tok===loadTok) failed(); });
    }
    function failed(){
      fails++;
      if(fails>=3){ fails=0; audio.pause(); stx.textContent='Trilha indisponível'; return; }
      load(idx+1); if(started&&!wantOff) play();
    }
    function play(){
      if(!audio.src) load(idx);
      audio.volume=0;
      var p=audio.play(); if(p&&p.catch) p.catch(function(){ paintState(); });
      fadeTo(target(),1800); started=true; wantOff=false; set('off','0');
    }
    function pause(){ fadeTo(0,500,function(){ audio.pause(); }); wantOff=true; set('off','1'); }
    function skip(d){ var was=!audio.paused||!started; fadeTo(0,350,function(){ load(idx+d); if(was) play(); }); }
    /* abrir uma era: troca a lista e toca a faixa-tema na hora; voltar ao início mantém o que estava tocando */
    function setEra(e){ e=e||'home'; if(e===curEra) return; var prev=curEra; curEra=e;
      var list=LISTS[e]||TRACKS_34, isEra=!!LISTS[e];
      if(!isEra){ if(TRACKS===list) return; var was=started&&!audio.paused&&!wantOff; fadeTo(0,450,function(){ audio.pause(); TRACKS=list; load(0); fails=0; if(was) play(); }); return; }
      fadeTo(0,450,function(){ audio.pause(); TRACKS=list; load(0); fails=0; play(); }); }
    window.addEventListener('sv-era',function(ev){ setEra(ev.detail); });

    bPlay.addEventListener('click',function(){ audio.paused?play():pause(); });
    bNext.addEventListener('click',function(){ skip(1); });
    bPrev.addEventListener('click',function(){ skip(-1); });
    bMute.addEventListener('click',function(){ muted=!muted; set('mute',muted?'1':'0'); clearInterval(fadeT); audio.volume=target(); paintVol(); });
    rng.addEventListener('input',function(){ vol=rng.value/100; muted=false; set('vol',vol); set('mute','0'); clearInterval(fadeT); audio.volume=vol; paintVol(); });
    bV.addEventListener('click',function(){ var o=el.classList.toggle('vopen'); bV.setAttribute('aria-expanded',o?'true':'false'); });
    bMin.addEventListener('click',function(){ el.classList.add('min'); set('min','1'); });
    disc.addEventListener('click',function(){ if(el.classList.contains('min')){ el.classList.remove('min'); set('min','0'); paintTrack(); } });
    audio.addEventListener('play',paintState); audio.addEventListener('pause',paintState);
    audio.addEventListener('playing',function(){ fails=0; });
    audio.addEventListener('ended',function(){
      var d=audio.duration;
      /* fim falso (faixa cortada no meio do download): recarrega em vez de pular */
      if(!triedBlob && (!isFinite(d) || audio.currentTime < Math.min(30, d*0.9))){ viaBlob(); return; }
      load(idx+1); play();
    });
    audio.addEventListener('error',function(){
      if(!audio.error || audio.error.code===1) return; /* abortado por troca de faixa: ignora */
      if(!triedBlob) viaBlob(); else failed();
    });
    audio.addEventListener('timeupdate',function(){ if(audio.duration) bar.style.width=(audio.currentTime/audio.duration*100)+'%'; });

    /* ambientação: começa no primeiro toque/clique na página, a menos que a pessoa tenha pausado antes */
    function kick(e){
      if(el.contains(e.target)) return;
      ['click','touchend','keydown'].forEach(function(t){ document.removeEventListener(t,kick,true); });
      if(!wantOff && audio.paused) play();
    }
    ['click','touchend','keydown'].forEach(function(t){ document.addEventListener(t,kick,true); });
    document.addEventListener('visibilitychange',function(){ if(document.hidden&&!audio.paused){ fadeTo(0,300,function(){ audio.pause(); el.dataset.resume='1'; }); } else if(!document.hidden&&el.dataset.resume==='1'){ el.dataset.resume=''; play(); } });

    /* efeito: papel ao clicar nas abas (segue o volume e o silenciar do player) */
    var sfx=[0,1,2].map(function(){ var a=new Audio('sons/papel.mp3'); a.preload='auto'; return a; }), sfxI=0;
    document.addEventListener('click',function(e){
      var tab=e.target.closest&&e.target.closest('[role="tab"],.sv-tab');
      if(!tab||tab.getAttribute('aria-selected')==='true'||muted) return;
      var a=sfx[sfxI++%sfx.length]; try{ a.currentTime=0; }catch(_){}
      a.volume=Math.min(1,0.25+vol*0.75);
      var p=a.play(); if(p&&p.catch) p.catch(function(){});
    },true);

    load(idx); paintVol(); paintState();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();

/* Crônica: o topo da barra de texto alinha com o topo da caixa Vantagens (desktop, 1934 e 1994) */
(function(){
  if (window.__svAlign) return; window.__svAlign = true;
  var root=document.documentElement, cur=420;
  function tick(){
    var mb=document.querySelector('.sv-side-lim'); if(mb&&mb.offsetParent){ var bw=Math.floor(mb.clientWidth); if(bw>0&&bw!==window.__svBarT){ window.__svBarT=bw; try{ window.__svApp&&window.__svApp.setState({_barT:bw}); }catch(e){} } }
    var log=document.querySelector('.sv-log'), cmp=document.querySelector('.sv-compose'), vant=document.querySelector('.sv-vant');
    if(!log||!cmp||!vant||!log.offsetParent||!vant.offsetParent){ return; }
    var lr=log.getBoundingClientRect(), vr=vant.getBoundingClientRect(), cr=cmp.getBoundingClientRect();
    var side = vr.left >= lr.right - 2;
    var want = 420;
    if(side){ want = Math.max(420, Math.round(log.offsetHeight + (vr.top - cr.top))); }
    if(Math.abs(want-cur)>=1){ cur=want; root.style.setProperty('--sv-log-min', want+'px'); }
  }
  setInterval(tick, 250); window.addEventListener('resize', tick);
})();
