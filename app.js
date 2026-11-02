(()=>{
const $=s=>document.querySelector(s);
const fmt=n=>'$'+Math.round(n).toLocaleString('en-US');
const S=JSON.parse(localStorage.nn||'null')||{cash:10000000,owned:[],mods:{}};
const save=()=>localStorage.nn=JSON.stringify(S);
// ---------- sound (made live, no files) ----------
let AC;const ac=()=>AC||(AC=new (window.AudioContext||window.webkitAudioContext)());
function tone(f,d=.07,type='square',v=.05,when=0){try{const a=ac(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime+when;o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
function noise(d=1.4,v=.08,when=0){try{const a=ac(),b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length);const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.frequency.value=600;g.gain.value=v;s.buffer=b;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+when)}catch(e){}}
const snd={move:()=>tone(880,.04,'square',.03),pick:()=>{tone(660,.06);tone(990,.08,'square',.04,.05)},back:()=>tone(420,.07,'triangle',.05),err:()=>{tone(180,.18,'sawtooth',.05)},
buy:()=>{noise(1.6,.06);[523,659,784,1046].forEach((f,i)=>tone(f,.25,'triangle',.07,1.7+i*.09));tone(1568,.5,'sine',.05,2.1)}};
// ---------- gradients/paint ----------
let gid=0;
function paintDef(p){const id='p'+(++gid);let d;
 if(p.t==='chrome')d=`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#9aa3ad"/><stop offset=".5" stop-color="#3d434b"/><stop offset=".65" stop-color="#cfd6de"/><stop offset="1" stop-color="#6c737b"/></linearGradient>`;
 else if(p.t==='pearl')d=`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.c}"/><stop offset=".5" stop-color="${p.c2}"/><stop offset="1" stop-color="${p.c}"/></linearGradient>`;
 else if(p.t==='camo')d=`<pattern id="${id}" width="60" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="${p.c}"/><path d="M5 8q10-8 20 0t15 10q-12 6-22 2zM35 25q12-6 22 2t-6 10q-10 2-16-12z" fill="${p.c2}"/><circle cx="48" cy="8" r="6" fill="#0005"/></pattern>`;
 else d=`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.c}" stop-opacity="1"/><stop offset="1" stop-color="${p.c}" stop-opacity="${p.t==='matte'?1:.75}"/></linearGradient>`;
 return [d,`url(#${id})`]}
// ---------- vehicle drawings (original simple shapes) ----------
function wheel(x,y,r,rim){const R=r*.62;let s=`<circle cx="${x}" cy="${y}" r="${r}" fill="#0d0d10"/><circle cx="${x}" cy="${y}" r="${r-2}" fill="none" stroke="#2a2a30" stroke-width="2"/>`;
 const col=rim.col||'#c9ced6';s+=`<circle cx="${x}" cy="${y}" r="${R}" fill="${rim.dish?col:'#1a1b20'}" stroke="${col}" stroke-width="2"/>`;
 const n=rim.sp||5;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;s+=`<line x1="${x}" y1="${y}" x2="${x+Math.cos(a)*R}" y2="${y+Math.sin(a)*R}" stroke="${rim.dish?'#0006':col}" stroke-width="${n>12?1:3}"/>`}
 return s+`<circle cx="${x}" cy="${y}" r="${R*.22}" fill="${col}"/>`}
const BODIES={
 low:'M18 108 L22 86 Q30 80 70 78 L120 76 Q150 52 200 50 L250 50 Q280 52 300 74 L360 78 Q384 82 386 98 L384 110 Z',
 sedan:'M20 110 L22 90 Q28 80 64 76 L110 72 Q140 44 190 42 L240 42 Q275 46 300 70 L356 76 Q382 82 384 100 L382 112 Z',
 muscle:'M16 108 L18 86 Q22 76 60 72 L130 70 Q160 50 210 48 L250 48 Q275 52 290 68 L370 74 Q388 78 388 96 L386 110 Z',
 super:'M14 110 L16 98 Q24 86 80 80 L150 64 Q190 44 240 46 Q290 50 330 76 L376 84 Q392 90 390 104 L386 112 Z',
 hyper:'M12 112 L14 100 Q40 88 110 80 L170 58 Q210 42 250 48 Q300 58 340 80 L380 88 Q394 94 392 106 L388 114 Z'};
const GLASS={low:'M130 76 Q155 56 200 55 L245 55 Q270 58 288 74 Z',sedan:'M120 72 Q146 48 190 47 L238 47 Q268 51 290 70 Z',muscle:'M140 70 Q165 54 210 53 L248 53 Q268 56 280 68 Z',super:'M160 66 Q195 50 238 51 Q278 55 310 74 Z',hyper:'M180 62 Q212 49 248 52 Q290 60 322 78 Z'};
function car(cfg){const sh=cfg.shape||'sedan';const [pd,pf]=paintDef(cfg.paint||{c:'#c22',t:'gloss'});const id=++gid;
 const tint=cfg.tint??.35,neon=cfg.neon,rim=cfg.rim||{},low=cfg.hyd?6:0,big=sh==='super'||sh==='hyper';
 let s=`<svg class="v" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg"><defs>${pd}<filter id="b${id}" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="8"/></filter><linearGradient id="h${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
 if(neon)s+=`<ellipse cx="200" cy="${132}" rx="175" ry="10" fill="${neon}" filter="url(#b${id})"/><ellipse cx="200" cy="132" rx="150" ry="3" fill="${neon}"/>`;
 s+=`<ellipse cx="200" cy="138" rx="185" ry="7" fill="#000a"/>`;
 s+=`<g transform="translate(0,${low})"><path d="${BODIES[sh]}" fill="${pf}" stroke="#0008" stroke-width="1.5"/><path d="${BODIES[sh]}" fill="url(#h${id})"/>`;
 s+=`<path d="${GLASS[sh]}" fill="rgb(15,22,32)" fill-opacity="${.35+tint*.65}" stroke="#0009"/>`;
 s+=`<line x1="40" y1="95" x2="370" y2="93" stroke="#0005"/><rect x="${big?370:368}" y="86" width="14" height="6" rx="2" fill="#fff7c9"/><rect x="18" y="90" width="10" height="6" rx="2" fill="#ff2a3a"/>`;
 if(cfg.stripe)s+=`<path d="M30 100 L380 96 L380 101 L30 105Z" fill="${cfg.stripe}"/>`;
 if(cfg.spoiler==1)s+=`<path d="M22 84 L60 80 L60 76 L22 79Z" fill="#111"/>`;
 if(cfg.spoiler==2)s+=`<rect x="34" y="74" width="4" height="12" fill="#111"/><rect x="58" y="72" width="4" height="12" fill="#111"/><path d="M14 66 L80 62 L80 70 L14 72Z" fill="#111" stroke="${cfg.neon||'#444'}"/>`;
 if(cfg.engine>=2)s+=`<rect x="318" y="${sh==='sedan'?60:64}" width="26" height="12" rx="2" fill="#bfc5cc" stroke="#555"/><rect x="324" y="${sh==='sedan'?52:56}" width="14" height="9" fill="#333"/>`;
 if(cfg.turbo)s+=`<circle cx="70" cy="114" r="4" fill="#555"/><path d="M14 112 L30 112" stroke="#999" stroke-width="4"/>`;
 s+=`</g>`;const wy=118,r=big?20:rim.big?23:20;s+=wheel(92,wy,r,rim)+wheel(318,wy,r,rim)+`</svg>`;return s}
function tank(cfg){const [pd,pf]=paintDef(cfg.paint);let s=`<svg class="v" viewBox="0 0 400 160"><defs>${pd}</defs><ellipse cx="200" cy="148" rx="185" ry="8" fill="#000a"/>`;
 if(cfg.kind==='tank'){s+=`<rect x="30" y="104" width="340" height="40" rx="20" fill="#1c1d1a"/>`;for(let i=0;i<7;i++)s+=`<circle cx="${58+i*47}" cy="124" r="15" fill="#3a3c36" stroke="#111" stroke-width="3"/>`;
  s+=`<path d="M24 104 L48 80 L352 80 L380 104Z" fill="${pf}" stroke="#0008"/><path d="M130 80 L150 50 L270 50 L290 80Z" fill="${pf}" stroke="#0008"/><rect x="270" y="58" width="${cfg.gun?120:110}" height="9" fill="#2b2d28"/><rect x="${cfg.gun?380:370}" y="55" width="16" height="15" fill="#2b2d28"/>`;
  if(cfg.armor)s+=`<path d="M40 96 L360 96" stroke="#000a" stroke-width="10" stroke-dasharray="26 4"/>`;}
 else{s+=`<path d="M30 120 L40 70 L90 50 L340 50 L370 80 L372 120Z" fill="${pf}" stroke="#0008"/><path d="M300 56 L336 56 L360 80 L300 80Z" fill="#14202a"/>`;for(const x of[80,160,250,320])s+=`<circle cx="${x}" cy="128" r="22" fill="#111"/><circle cx="${x}" cy="128" r="10" fill="#444"/>`;
  s+=`<rect x="140" y="36" width="60" height="16" fill="${pf}" stroke="#0008"/><rect x="196" y="40" width="70" height="6" fill="#2b2d28"/>`;if(cfg.armor)s+=`<rect x="44" y="84" width="240" height="18" fill="#0006"/>`;}
 return s+`</svg>`}
function air(cfg){const [pd,pf]=paintDef(cfg.paint);let s=`<svg class="v" viewBox="0 0 400 160"><defs>${pd}</defs><ellipse cx="200" cy="150" rx="170" ry="6" fill="#000a"/>`;
 if(cfg.kind==='heli'){s+=`<g class="rotor"><rect x="40" y="26" width="300" height="4" rx="2" fill="#222"/></g><rect x="186" y="28" width="8" height="18" fill="#333"/><path d="M110 70 Q120 44 190 44 L250 46 Q290 52 296 86 Q290 110 240 112 L150 112 Q110 108 110 70Z" fill="${pf}" stroke="#0008"/><path d="M240 50 Q284 56 290 84 L240 84Z" fill="#132232" fill-opacity=".85"/><path d="M110 76 L20 70 L14 50 L26 50 L40 66 L110 66Z" fill="${pf}" stroke="#0008"/><circle cx="20" cy="58" r="13" fill="none" stroke="#333" stroke-width="3"/><path d="M150 112 L140 130 M250 112 L260 130 M120 132 L290 132" stroke="#333" stroke-width="5" stroke-linecap="round"/>`;}
 else if(cfg.kind==='jet'){s+=`<path d="M20 90 Q60 76 140 74 L330 72 Q384 76 392 90 Q384 104 330 106 L140 106 Q60 104 20 90Z" fill="${pf}" stroke="#0008"/><path d="M60 78 L30 30 L56 30 L110 76Z" fill="${pf}" stroke="#0008"/><path d="M160 98 L240 98 L190 140 L160 140Z" fill="#0004"/><path d="M330 76 Q370 78 384 88 L330 88Z" fill="#132232"/>`;for(let i=0;i<8;i++)s+=`<circle cx="${150+i*20}" cy="84" r="3.5" fill="#132232"/>`;s+=`<rect x="100" y="104" width="4" height="34" fill="#333"/><circle cx="102" cy="140" r="7" fill="#111"/><circle cx="320" cy="140" r="7" fill="#111"/><rect x="318" y="104" width="4" height="34" fill="#333"/>`;}
 else{s+=`<path d="M40 92 Q80 80 160 80 L300 82 Q340 86 350 96 Q340 106 300 108 L160 108 Q80 106 40 92Z" fill="${pf}" stroke="#0008"/><path d="M60 84 L44 50 L64 50 L100 82Z" fill="${pf}" stroke="#0008"/><rect x="170" y="74" width="80" height="8" rx="3" fill="#0006"/><path d="M290 84 Q320 86 334 94 L290 94Z" fill="#132232"/><rect x="352" y="78" width="4" height="36" fill="#333"/><rect x="348" y="94" width="4" height="4" fill="#666"/><path d="M200 108 L196 136 M260 108 L264 136" stroke="#333" stroke-width="4"/><circle cx="196" cy="140" r="7" fill="#111"/><circle cx="264" cy="140" r="7" fill="#111"/>`;}
 return s+`</svg>`}
const draw=c=>c.kind==='car'?car(c):(c.kind==='tank'||c.kind==='apc')?tank(c):air(c);
// ---------- data ----------
const P=(n,p,c,t='gloss',c2)=>({n,p,v:{c,t,c2}});
const paints=[P('Factory Red',0,'#c41e2a'),P('Midnight Black',2500,'#14151a'),P('Candy Purple',6000,'#7a1fd1'),P('Ocean Blue',4000,'#1e5fd6'),P('Lime Rush',4500,'#7ed321'),P('Sunset Orange',4000,'#ff6a1a'),P('Matte Gray',8000,'#4a4d55','matte'),P('Pearl White',12000,'#f4f4f8','pearl','#c7e3ff'),P('Pearl Pink Ice',14000,'#ff7ab8','pearl','#8ad8ff'),P('Full Chrome',45000,'#ccc','chrome')];
const SHOPS=[
{id:'lowside',name:'Lowside Customs',url:'lowsidecustoms.nn',c:'#ff2e88',tag:'Paint • Rims • Hydraulics • Neon',anim:'garage',verb:'Upgrade Purchased',
 bg:'linear-gradient(#1a0d18,#0b0710 70%,#1c1220)',
 vehicles:[{n:'Del Ray Lowrider',kind:'car',shape:'low',price:0},{n:'Sedona Sedan',kind:'car',shape:'sedan',price:0},{n:'Brawler Muscle',kind:'car',shape:'muscle',price:0}],
 cats:[{n:'Paint',k:'paint',o:paints},
 {n:'Rims',k:'rim',o:[{n:'Stock Steel',p:0,v:{sp:5}},{n:'Wire Spokes',p:9000,v:{sp:24,col:'#e9edf2'}},{n:'Gold Wires',p:22000,v:{sp:24,col:'#f1c232'}},{n:'Deep Dish',p:12000,v:{sp:6,dish:1,col:'#d8dde3'}},{n:'Blade Black',p:15000,v:{sp:7,col:'#2b2d33',big:1}}]},
 {n:'Hydraulics',k:'hyd',o:[{n:'None',p:0,v:0},{n:'Street Bounce',p:20000,v:1},{n:'Hopper Pro',p:40000,v:2}]},
 {n:'Neon Underglow',k:'neon',o:[{n:'None',p:0,v:''},{n:'Hot Pink',p:5000,v:'#ff2e88'},{n:'Ice Blue',p:5000,v:'#20e3ff'},{n:'Toxic Green',p:5000,v:'#3dff6a'},{n:'Royal Purple',p:5000,v:'#a84dff'},{n:'Gold',p:6000,v:'#ffc83d'}]},
 {n:'Window Tint',k:'tint',o:[{n:'Clear',p:0,v:0},{n:'Light Smoke',p:1500,v:.4},{n:'Dark Smoke',p:3000,v:.75},{n:'Limo Black',p:5000,v:1}]},
 {n:'Spoiler',k:'spoiler',o:[{n:'None',p:0,v:0},{n:'Ducktail',p:3500,v:1},{n:'Big Wing',p:9000,v:2}]},
 {n:'Engine',k:'engine',o:[{n:'Stock',p:0,v:0},{n:'Level 2 Tune',p:18000,v:1},{n:'Supercharged',p:45000,v:2}]},
 {n:'Turbo',k:'turbo',o:[{n:'None',p:0,v:0},{n:'Turbo Kit',p:50000,v:1}]}]},
{id:'velvet',name:'Velvet Motorworks',url:'velvetmotor.nn',c:'#ffc83d',tag:'Super & luxury cars',anim:'showroom',verb:'Welcome Home',
 bg:'linear-gradient(#1b1608,#0b0a07 70%,#1d190c)',
 vehicles:[{n:'Aurelio GT',kind:'car',shape:'super',price:795000},{n:'Stratos X9',kind:'car',shape:'hyper',price:1950000},{n:'Monarch Coupe',kind:'car',shape:'sedan',price:420000},{n:'Viper Line R',kind:'car',shape:'muscle',price:310000}],
 cats:[{n:'Paint',k:'paint',o:paints},{n:'Racing Stripe',k:'stripe',o:[{n:'None',p:0,v:''},{n:'White',p:8000,v:'#fff'},{n:'Black',p:8000,v:'#111'},{n:'Gold',p:15000,v:'#ffc83d'}]},
 {n:'Wheels',k:'rim',o:[{n:'Forged Silver',p:0,v:{sp:10}},{n:'Carbon Black',p:25000,v:{sp:7,col:'#2b2d33'}},{n:'Gold Forged',p:40000,v:{sp:10,col:'#f1c232'}}]},
 {n:'Window Tint',k:'tint',o:[{n:'Clear',p:0,v:0},{n:'Dark Smoke',p:3000,v:.75}]},{n:'Wing',k:'spoiler',o:[{n:'Clean',p:0,v:0},{n:'Lip',p:12000,v:1},{n:'Track Wing',p:30000,v:2}]}]},
{id:'skyhaul',name:'SkyHaul Aviation',url:'skyhaul.nn',c:'#20e3ff',tag:'Planes & helicopters',anim:'hangar',verb:'Cleared For Takeoff',
 bg:'linear-gradient(#0a1a24,#070b10 70%,#0d1a22)',
 vehicles:[{n:'Cumulus Prop',kind:'prop',price:650000},{n:'Halcyon Business Jet',kind:'jet',price:2400000},{n:'Dragonfly Heli',kind:'heli',price:1350000}],
 cats:[{n:'Livery',k:'paint',o:[P('Sky White',0,'#eef2f6'),P('Navy',30000,'#1b2a4a'),P('Racing Red',30000,'#c41e2a'),P('Sunrise Pearl',80000,'#ffb36b','pearl','#ff6aa8'),P('Polished Chrome',250000,'#ccc','chrome')]}]},
{id:'ironclad',name:'Ironclad Surplus',url:'ironclad.nn',c:'#9cff3d',tag:'Armored vehicles (pretend)',anim:'drop',verb:'Delivery Complete',
 bg:'linear-gradient(#121608,#090a06 70%,#14180b)',
 vehicles:[{n:'Bulwark MBT',kind:'tank',price:3200000},{n:'Rhinox APC',kind:'apc',price:1600000}],
 cats:[{n:'Camo',k:'paint',o:[{n:'Olive',p:0,v:{c:'#4f5a2e',t:'matte'}},{n:'Woodland',p:40000,v:{c:'#556b2f',c2:'#2f3a1c',t:'camo'}},{n:'Desert',p:40000,v:{c:'#c2a66b',c2:'#8a6f3d',t:'camo'}},{n:'Urban',p:40000,v:{c:'#8a8d91',c2:'#3c3f44',t:'camo'}},{n:'Night Ops',p:60000,v:{c:'#1b1d22',c2:'#0b0c0e',t:'matte'}}]},
 {n:'Armor',k:'armor',o:[{n:'Standard',p:0,v:0},{n:'Reactive Plates',p:250000,v:1}]}]}];
const ADS=[
 {h:'Lowside Customs',p:'Drop it. Bounce it. Shine it.',big:'LOW & SLOW',g:'linear-gradient(120deg,#3a0020,#ff2e88 60%,#ff8a3d)',gl:'#ff2e88',to:'lowside'},
 {h:'Velvet Motorworks',p:'Built for people who arrive.',big:'0–60 IN 2.4',g:'linear-gradient(120deg,#1a1200,#b8860b 55%,#ffe08a)',gl:'#ffc83d',to:'velvet'},
 {h:'SkyHaul Aviation',p:'The whole sky, no traffic.',big:'FLY TODAY',g:'linear-gradient(120deg,#001a2a,#0077b6 50%,#20e3ff)',gl:'#20e3ff',to:'skyhaul'},
 {h:'Ironclad Surplus',p:'Delivered by parachute. Seriously.',big:'HEAVY DUTY',g:'linear-gradient(120deg,#0e1405,#4f6b12 55%,#9cff3d)',gl:'#9cff3d',to:'ironclad'},
 {h:'Fizzle Cola',p:'Tastes like neon.',big:'ZAP!',g:'linear-gradient(120deg,#2a0040,#7a1fd1 50%,#00ffd5)',gl:'#00ffd5'},
 {h:'Nova Phone 9',p:'Thinner than your excuses.',big:'NOVA 9',g:'linear-gradient(120deg,#000,#232a6b 50%,#ff2e88)',gl:'#9aa6ff'}];
function tower(slim,start=0){return `<div class="tower${slim?' slim':''}" data-i="${start}">${ADS.map((a,i)=>`<div class="ad" style="--g:${a.g};--gl:${a.gl}" ${a.to?`data-go="${a.to}"`:''}><div class="sweep"></div><div style="position:relative"><h3>${a.h}</h3><p>${a.p}</p></div><div class="big" style="position:relative">${a.big}</div></div>`).join('')}<div class="grid"></div><div class="dots">${ADS.map(()=>'<i></i>').join('')}</div></div>`}
function spinTowers(){document.querySelectorAll('.tower').forEach(t=>{let i=(+t.dataset.i+1)%ADS.length;t.dataset.i=i;showAd(t)})}
function showAd(t){const i=+t.dataset.i;t.querySelectorAll('.ad').forEach((a,j)=>a.classList.toggle('on',j===i));t.querySelectorAll('.dots i').forEach((a,j)=>a.classList.toggle('on',j===i))}
setInterval(spinTowers,4200);
// ---------- chrome ----------
function wallet(hit){const w=$('#wallet');w.textContent=fmt(S.cash);if(hit){w.classList.remove('hit');void w.offsetWidth;w.classList.add('hit')}}
function marks(cur){$('#marks').innerHTML=`<button data-go="" class="${!cur?'on':''}">🏠 Home</button>`+SHOPS.map(s=>`<button data-go="${s.id}" style="--c:${s.c}" class="${cur===s.id?'on':''}">${s.name}</button>`).join('')}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2600)}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){snd.pick();location.hash='#/'+g.dataset.go}});
$('#back').onclick=()=>{snd.back();history.back()};$('#home').onclick=()=>{snd.back();location.hash='#/'};
// ---------- portal ----------
function portal(){$('#addr').innerHTML='neonnet://<b>home</b>';marks('');
 $('#app').innerHTML=`<section class="hero"><h1 class="logo">NeonNet</h1><p>Your pretend city web. Pick a store below.</p>
 <form class="search" id="q"><input placeholder="Search: cars, planes, rims, tanks…" aria-label="Search"><button>Go</button></form></section>
 ${tower(0,0)}
 <div class="tiles">${SHOPS.map(s=>`<button class="tile" data-go="${s.id}" style="--c:${s.c}">${draw(Object.assign({paint:s.cats[0].o[s.id==='lowside'?8:s.id==='ironclad'?1:3].v,rim:{sp:24,col:'#e9edf2'},neon:s.id==='lowside'?'#ff2e88':''},s.vehicles[0]))}<h4>${s.name}</h4><p>${s.tag}</p></button>`).join('')}</div>
 <div class="twin">${tower(1,2)}${tower(1,4)}</div>
 <p class="help" style="text-align:center;margin-top:18px">Wallet: ${fmt(S.cash)} play money • Owned: ${S.owned.length} vehicle${S.owned.length==1?'':'s'} • <button class="ghost" id="refill" style="padding:4px 10px">Reset wallet to $10M</button></p>`;
 document.querySelectorAll('.tower').forEach(showAd);
 $('#refill').onclick=()=>{S.cash=10000000;save();wallet(1);snd.pick();portal()};
 $('#q').onsubmit=e=>{e.preventDefault();const q=e.target[0].value.toLowerCase();const m={lowside:/rim|neon|hyd|bounce|paint|low|tint|spoil|turbo|mod/,velvet:/super|lux|sport|fast|coupe/,skyhaul:/plane|jet|heli|fly|air/,ironclad:/tank|apc|army|military|armor/};const hit=Object.keys(m).find(k=>m[k].test(q));if(hit)location.hash='#/'+hit;else{snd.err();toast('No match. Try "rims", "jet" or "tank".')}};
 window.onkeydown=null}
// ---------- shop ----------
function shop(s){$('#addr').innerHTML=`neonnet://www.<b>${s.url}</b>`;marks(s.id);document.documentElement.style.setProperty('--c',s.c);
 let vi=0,cfg,base,level='root',ri=0,oi=0,cur;
 function reset(){const v=s.vehicles[vi];cfg=Object.assign({},v);base={};s.cats.forEach(c=>{const k=S.mods[s.id+v.n]?.[c.k];base[c.k]=k??0;cfg[c.k]=c.o[base[c.k]].v});cur=Object.assign({},base)}
 const rootItems=()=>[{n:s.id==='lowside'?'Choose Car':'Choose Model',sub:'veh'},...s.cats.map(c=>({n:c.n,sub:c.k})),{n:'Buy Now',buy:1}];
 function cost(){let t=0;const v=s.vehicles[vi];const owned=S.owned.includes(s.id+v.n)||!v.price;if(!owned)t+=v.price;s.cats.forEach(c=>{if(cur[c.k]!==base[c.k]||!owned)t+=c.o[cur[c.k]].p});return t}
 $('#app').innerHTML=`<div class="shophead"><h2>${s.name}</h2><span>${s.tag}</span></div>${tower(1,SHOPS.indexOf(s))}
 <div class="stage" id="stage" style="--stagebg:${s.bg}"><div class="light"></div><div class="floor"></div><div id="veh"></div></div>
 <div class="layout"><div class="menu"><div class="mh"><span id="mt"></span><small id="mc"></small></div><ul id="ml"></ul><div class="mf">↑ ↓ to move • Enter to choose • Backspace to go back. Or just tap.</div></div>
 <div class="side"><h4>Your order</h4><div id="sum"></div><div class="row total"><span>Total</span><span id="tot"></span></div><button class="buy" id="buy">Buy</button><div class="owned" id="own"></div></div></div>`;
 document.querySelectorAll('.tower').forEach(showAd);
 function render(){const v=s.vehicles[vi];$('#veh').innerHTML=draw(cfg);const svg=$('#veh svg');if(cfg.hyd)svg.classList.add(cfg.hyd==2?'hop':'bounce');
  const ul=$('#ml');let items,title;
  if(level==='root'){items=rootItems().map(x=>({n:x.n,r:x.buy?fmt(cost()):x.sub==='veh'?v.n:(s.cats.find(c=>c.k===x.sub).o[cur[x.sub]].n)}));title=s.name;}
  else if(level==='veh'){items=s.vehicles.map(x=>({n:x.n,r:x.price?(S.owned.includes(s.id+x.n)?'OWNED':fmt(x.price)):'Your ride',t:x===v}));title=rootItems()[0].n}
  else{const c=s.cats.find(c=>c.k===level);items=c.o.map((o,i)=>({n:(o.v&&o.v.c?`<span class="sw" style="background:${o.v.t==='chrome'?'linear-gradient(#fff,#666)':o.v.t==='pearl'?`linear-gradient(135deg,${o.v.c},${o.v.c2})`:o.v.c}"></span>`:typeof o.v==='string'&&o.v?`<span class="sw" style="background:${o.v};box-shadow:0 0 6px ${o.v}"></span>`:'')+o.n,r:i===base[c.k]?'OWNED':o.p?fmt(o.p):'FREE',t:i===cur[c.k]}));title=c.n}
  const sel=level==='root'?ri:oi;$('#mt').textContent=title;$('#mc').textContent=(sel+1)+' / '+items.length;
  ul.innerHTML=items.map((x,i)=>`<li><button data-i="${i}" class="${i===sel?'sel':''}"><span>${x.n}</span><span class="pr">${x.t?'<span class="tick">✓ </span>':''}${x.r}</span></button></li>`).join('');
  ul.querySelector('.sel')?.scrollIntoView({block:'nearest'});
  const lines=[];const owned=S.owned.includes(s.id+v.n)||!v.price;if(!owned)lines.push([v.n,v.price]);s.cats.forEach(c=>{if(cur[c.k]!==base[c.k]||(!owned&&c.o[cur[c.k]].p))lines.push([c.n+': '+c.o[cur[c.k]].n,c.o[cur[c.k]].p])});
  $('#sum').innerHTML=lines.length?lines.map(l=>`<div class="row"><span>${l[0]}</span><span>${fmt(l[1])}</span></div>`).join(''):'<p class="help">Nothing picked yet. Choose something from the menu.</p>';
  const t=cost();$('#tot').textContent=fmt(t);const b=$('#buy');b.disabled=!lines.length;b.textContent=t>S.cash?'Not enough cash':'Buy • '+fmt(t);
  $('#own').innerHTML=owned?`<b>${v.n}</b> is yours.`:`You don't own the <b>${v.n}</b> yet.`}
 function preview(i){if(level==='veh'){vi=i;reset()}else if(level!=='root'){const c=s.cats.find(c=>c.k===level);cur[c.k]=i;cfg[c.k]=c.o[i].v}}
 function choose(i){if(level==='root'){ri=i;const x=rootItems()[i];if(x.buy)return doBuy();level=x.sub;oi=x.sub==='veh'?vi:cur[x.sub];snd.pick()}else{preview(i);level='root';snd.pick()}render()}
 function move(d){const n=level==='root'?rootItems().length:level==='veh'?s.vehicles.length:s.cats.find(c=>c.k===level).o.length;if(level==='root')ri=(ri+d+n)%n;else{oi=(oi+d+n)%n;preview(oi)}snd.move();render()}
 $('#ml').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i;if(level!=='root'&&i!==oi){oi=i;preview(i);snd.move();render();return}choose(i)};
 window.onkeydown=e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowDown'){e.preventDefault();move(1)}else if(e.key==='ArrowUp'){e.preventDefault();move(-1)}else if(e.key==='Enter'){e.preventDefault();choose(level==='root'?ri:oi)}else if(e.key==='Backspace'||e.key==='Escape'){e.preventDefault();if(level!=='root'){if(level==='veh'){vi=S._vi??vi}level='root';snd.back();render()}}};
 $('#buy').onclick=doBuy;
 function doBuy(){const t=cost();const v=s.vehicles[vi];if(!$('#sum .row')){snd.err();return toast('Pick something first.')}if(t>S.cash){snd.err();return toast('Not enough cash. Reset your wallet on the Home page.')}
  S.cash-=t;if(v.price&&!S.owned.includes(s.id+v.n))S.owned.push(s.id+v.n);S.mods[s.id+v.n]=Object.assign({},cur);save();
  playBuy(s,cfg,t,()=>{reset();level='root';render();wallet(1)})}
 reset();render()}
// ---------- buy animation ----------
function playBuy(s,cfg,t,done){const ov=$('#ov'),box=$('#ovs');box.style.setProperty('--c',s.c);snd.buy();
 const a=s.anim;let h='';
 if(a==='garage')h=`<div class="turn"></div>${draw(cfg)}<div class="door"></div>`;
 if(a==='showroom')h=`<div class="spot"></div><div class="spot" style="animation-delay:-1s"></div><div class="turn"></div>${draw(cfg)}<div class="curtain"></div>`;
 if(a==='hangar')h=`<div style="position:absolute;inset:auto 0 0;height:20%;background:#1c1f26"></div><div style="position:absolute;bottom:14%;left:0;right:0;border-top:3px dashed #ffd84a66"></div>${draw(cfg)}<div class="door l"></div><div class="door r"></div>`;
 if(a==='drop')h=`<div style="position:absolute;inset:auto 0 0;height:18%;background:#2a2a1c"></div><svg class="chute" viewBox="0 0 100 70"><path d="M5 40 Q50 -20 95 40Z" fill="#c2a66b" stroke="#6b5a35"/><path d="M5 40 L50 70 M95 40 L50 70 M35 22 L50 70 M65 22 L50 70" stroke="#6b5a35"/></svg>${draw(cfg)}`;
 box.innerHTML=h+`<div class="banner" id="bn"><h3>${s.verb.toUpperCase()}</h3><p>−${fmt(t)}</p></div><button class="ovclose" id="oc">Done</button>`;
 ov.classList.add('on');const v=box.querySelector('svg.v');
 if(a==='drop'){v.classList.add('drop');setTimeout(()=>{dust(box)},2000)}
 setTimeout(()=>{box.querySelectorAll('.door,.curtain').forEach(d=>d.classList.add('up'));},250);
 setTimeout(()=>{if(a==='garage'||a==='showroom'){v.classList.add('spin');sparks(box)}if(a==='hangar')v.classList.add('taxi')},1700);
 setTimeout(()=>{$('#bn').classList.add('on');wallet(1)},2300);
 const close=()=>{ov.classList.remove('on');done()};$('#oc').onclick=close;}
function sparks(box){for(let i=0;i<40;i++){const p=document.createElement('i');p.className='spark';p.style.left=(30+Math.random()*40)+'%';p.style.bottom='14%';p.style.setProperty('--x',(Math.random()*300-150)+'px');p.style.setProperty('--y',(-Math.random()*200)+'px');p.style.animationDelay=Math.random()*.5+'s';box.appendChild(p)}for(let i=0;i<5;i++){const m=document.createElement('i');m.className='smoke';m.style.left=(15+i*16)+'%';m.style.animationDelay=i*.15+'s';box.appendChild(m)}}
function dust(box){for(let i=0;i<6;i++){const m=document.createElement('i');m.className='smoke';m.style.left=(20+i*11)+'%';box.appendChild(m)}}
// rotor spin
const st=document.createElement('style');st.textContent='.rotor{transform-origin:190px 28px;animation:rot .25s linear infinite}@keyframes rot{50%{transform:scaleX(.1)}}';document.head.appendChild(st);
// ---------- router ----------
function route(){$('#ov').classList.remove('on');const id=location.hash.replace('#/','');const s=SHOPS.find(x=>x.id===id);document.documentElement.style.removeProperty('--c');s?shop(s):portal();window.scrollTo(0,0)}
addEventListener('hashchange',route);wallet();route();
})();
