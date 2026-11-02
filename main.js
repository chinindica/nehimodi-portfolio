// cursor dot
const dot=document.createElement('div');dot.id='dot';document.body.appendChild(dot);
addEventListener('mousemove',e=>{dot.classList.add('on');dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';dot.classList.toggle('hov',!!e.target.closest('a,button,video'))});
document.addEventListener('mouseleave',()=>dot.classList.remove('on'));


// reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

// "Nehi / Starts with the user..." — the block pins in place and each scroll step lights the next line
const sec=document.querySelector('.lines');
if(sec){
  const lines=[...sec.querySelectorAll('p')];
  const update=()=>{
    const r=sec.getBoundingClientRect();
    const travel=sec.offsetHeight-innerHeight;
    const prog=Math.min(Math.max(-r.top/Math.max(travel,1),0),.9999);
    const i=Math.floor(prog*lines.length);
    lines.forEach((p,k)=>p.classList.toggle('lit',k===i));
  };
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
}

// design POV lamp: hidden above at first, then lowers slowly on its cord as you scroll, warming up as it comes
const bulb=document.querySelector('.bulb');
if(bulb){
  const qs=bulb.closest('.qs');let cur=0,tgt=0,raf=0;
  const target=()=>{const r=qs.getBoundingClientRect(),H=innerHeight;
    const p=Math.min(Math.max((H*1.0-r.top)/(H*.85),0),1);tgt=p*p*(3-2*p)};
  const step=()=>{cur+=(tgt-cur)*.045;if(Math.abs(tgt-cur)<.0005)cur=tgt;
    bulb.style.setProperty('--drop',(cur*331).toFixed(1)+'px');
    bulb.style.opacity=Math.min(1,cur*3).toFixed(3);
    bulb.style.setProperty('--lit',Math.max(0,Math.min(1,(cur-.25)/.6)).toFixed(3));
    raf=cur!==tgt?requestAnimationFrame(step):0};
  const kick=()=>{target();if(!raf)raf=requestAnimationFrame(step)};
  addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);kick();
}

// design POV: flowing red silk behind the heading (WebGL warp, same settings as the Framer gradient), falls back to the static drawing
(function(){
  const c=document.querySelector('canvas.silk');if(!c)return;
  let gl=c.getContext('webgl2',{antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});let v2=!!gl;
  if(!gl){gl=c.getContext('webgl',{antialias:false,premultipliedAlpha:false})||c.getContext('experimental-webgl');if(!gl)return;gl.getExtension('OES_standard_derivatives')}
  const body=`
  uniform vec2 r;uniform float t,dpr,k;
  void main(){
    vec2 css=r/dpr;
    vec2 uv=(gl_FragCoord.xy/dpr-.5*css)-vec2(.63*css.x,-.36*css.y);
    uv/=k;
    float a=-217.*3.14159265/180.;uv=mat2(cos(a),sin(a),-sin(a),cos(a))*uv;uv*=.005;
    float T=.0625*(t+118.);
    for(int i=1;i<16;i++){float f=float(i);uv.x+=.47/f*cos(T+f*1.5*uv.y);uv.y+=.47/f*cos(T+f*uv.x);}
    vec2 cu=uv*.85;
    float shape=.5+.5*sin(cu.x)*cos(cu.y)+.48*sqrt(.5);
    float mixer=shape*2.;float aa=fwidth(shape);
    vec3 c0=vec3(.071),c1=vec3(.839,.220,.051);vec3 g=c0;
    for(int i=1;i<3;i++){float m=clamp(mixer-float(i-1),0.,1.);float ls=floor(m);
      float sf=.235+fwidth(m);float sm=smoothstep(max(0.,.5-sf-aa),min(1.,.5+sf+aa),m-ls);
      m=mix(ls+sm,m,.47);g=mix(g,i==1?c1:c0,m);}
    g=mix(c0,g,.68);
    g+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.035;
    OUT=vec4(g,1.);}`;
  const fs=v2?'#version 300 es\nprecision highp float;out vec4 o;\n#define OUT o\n'+body
             :'#extension GL_OES_standard_derivatives : enable\nprecision highp float;\n#define OUT gl_FragColor\n'+body;
  const vs=v2?'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}':'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const sh=(ty,s)=>{const o=gl.createShader(ty);gl.shaderSource(o,s);gl.compileShader(o);return o};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));
  gl.bindAttribLocation(pr,0,'a');gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
  gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const U=n=>gl.getUniformLocation(pr,n),ur=U('r'),ut=U('t'),ud=U('dpr'),uk=U('k');
  c.parentElement.classList.add('gl');
  let vis=true;new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(c);
  let dpr=1;
  const size=()=>{dpr=Math.min(window.devicePixelRatio||1,1.5);c.width=Math.max(1,Math.round(c.clientWidth*dpr));c.height=Math.max(1,Math.round(c.clientHeight*dpr));gl.viewport(0,0,c.width,c.height)};
  size();addEventListener('resize',size);
  const SPEED=16,t0=performance.now();
  const frame=now=>{if(vis&&!document.hidden){const k=Math.max(.45,c.clientWidth/1512);
    gl.uniform2f(ur,c.width,c.height);gl.uniform1f(ud,dpr);gl.uniform1f(uk,k);gl.uniform1f(ut,(now-t0)/1000*SPEED);gl.drawArrays(gl.TRIANGLES,0,3)}
    requestAnimationFrame(frame)};
  requestAnimationFrame(frame);
})();

// intro (home only, once per visit)
const intro=document.getElementById('intro');
if(intro){let seen=false;try{seen=sessionStorage.getItem('intro')}catch(e){}
 if(seen){intro.remove()}else{
  setTimeout(()=>{intro.classList.add('done');intro.querySelector('p').textContent='Unlocked'},2900);
  setTimeout(()=>{intro.style.opacity=0;try{sessionStorage.setItem('intro',1)}catch(e){}},4000);
  setTimeout(()=>intro.remove(),4900)}}

// footer: clicking the phone number or email copies it
document.querySelectorAll('button.copy').forEach(b=>b.addEventListener('click',async()=>{
  const v=b.dataset.copy;let ok=false;
  try{await navigator.clipboard.writeText(v);ok=true}catch(e){
    const t=document.createElement('textarea');t.value=v;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();
    try{ok=document.execCommand('copy')}catch(_){}t.remove()}
  let toast=document.querySelector('.toast');if(!toast){toast=document.createElement('div');toast.className='toast';document.body.appendChild(toast)}
  toast.textContent=ok?'Copied '+v:v;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove('show'),1800);
}));

// home: keep the "Explore my work" tile centred between the tagline and "I question to know…"
(function(){
  const tile=document.querySelector('.hero .work-tile'),tag=document.querySelector('.hero .intro-txt p'),next=document.querySelector('.mid h3');
  if(!tile||!tag||!next)return;
  const place=()=>{tile.style.translate='0 0';if(getComputedStyle(tile).display==='none')return;
    const a=tag.getBoundingClientRect().bottom,b=next.getBoundingClientRect().top,r=tile.getBoundingClientRect();
    const want=(a+b)/2-r.height/2;tile.style.translate='0 '+Math.round(want-r.top)+'px'};
  addEventListener('resize',place);addEventListener('load',place);place();
})();

// footer: the big NEHI MODI rises up from below as you reach the end of the page (eased, a touch behind the scroll)
(function(){
  const big=document.querySelector('footer .big'),svg=big&&big.querySelector('svg');if(!svg)return;
  let cur=0,tgt=0,raf=0;
  const target=()=>{const t=big.getBoundingClientRect().top,h=big.offsetHeight||1;tgt=Math.min(Math.max((innerHeight-t)/h,0),1)};
  const step=()=>{cur+=(tgt-cur)*.12;if(Math.abs(tgt-cur)<.001)cur=tgt;
    const e=cur*cur*(3-2*cur);svg.style.transform='translate3d(0,'+((1-e)*100).toFixed(2)+'%,0)';
    raf=cur!==tgt?requestAnimationFrame(step):0};
  const kick=()=>{target();if(!raf)raf=requestAnimationFrame(step)};
  addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);kick();
})();

// every page opens at the top (e.g. "Next project" lands on the project's start), instantly, no scrolling animation
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
const toTop=()=>{if(!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'})};
toTop();addEventListener('pageshow',toTop);
// in-page links (e.g. Contact) still glide smoothly
document.addEventListener('click',e=>{const a=e.target.closest('a[href*="#"]');if(!a)return;
  const u=new URL(a.href,location.href);if(u.pathname!==location.pathname||!u.hash)return;
  const t=document.querySelector(u.hash);if(!t)return;e.preventDefault();t.scrollIntoView({behavior:'smooth'});history.replaceState(null,'',u.hash)});
