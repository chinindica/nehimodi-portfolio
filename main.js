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

// design POV lamp: hidden above at first, drops down on its cord as you scroll
const bulb=document.querySelector('.bulb');
if(bulb){
  const qs=bulb.closest('.qs');
  const drop=()=>{
    const r=qs.getBoundingClientRect(),H=innerHeight;
    const p=Math.min(Math.max((H*.95-r.top)/(H*.6),0),1);
    const e=1-Math.pow(1-p,2);
    bulb.style.setProperty('--drop',(e*331).toFixed(1)+'px');bulb.style.opacity=Math.min(1,e*5);
  };
  addEventListener('scroll',drop,{passive:true});addEventListener('resize',drop);drop();
}

// design POV: flowing red silk behind the heading (WebGL), falls back to the static drawing
(function(){
  const c=document.querySelector('canvas.silk');if(!c)return;
  const gl=c.getContext('webgl',{antialias:false,premultipliedAlpha:false});if(!gl)return;
  const vs='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fs=`precision mediump float;uniform vec2 r;uniform float t;
  void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y*1.6;
  float T=t*.6;
  for(float i=1.;i<5.;i++){p.x+=.38/i*sin(i*1.4*p.y+T*.9+i*1.3);p.y+=.30/i*cos(i*1.2*p.x+T+i*.7);}
  float s=dot(p,vec2(1.,1.65))*1.7+T*.4;
  float v=.5+.5*sin(s);
  float w=.5+.5*sin(s*.5+T*.25+p.x*.6);
  float band=smoothstep(.45,.97,v)*(.35+.65*w);
  float edge=smoothstep(.36,.45,v)*(1.-smoothstep(.45,.58,v));
  vec3 bg=vec3(.067);vec3 red=vec3(.50,.09,.03);vec3 hi=vec3(.80,.20,.07);
  vec3 col=mix(bg,red,band);col=mix(col,hi,pow(band,2.5)*.6);col=mix(col,vec3(.02,.005,.005),edge*.6*w);
  col=mix(bg,col,.55+.45*smoothstep(.0,.5,uv.x));
  gl_FragColor=vec4(col,1.);}`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
  gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const ur=gl.getUniformLocation(pr,'r'),ut=gl.getUniformLocation(pr,'t');
  c.parentElement.classList.add('gl');
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let vis=true;new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(c);
  const size=()=>{const s=Math.min(devicePixelRatio||1,1.25);c.width=Math.round(c.clientWidth*s);c.height=Math.round(c.clientHeight*s);gl.viewport(0,0,c.width,c.height)};
  size();addEventListener('resize',size);
  const t0=performance.now();
  const frame=now=>{if(vis){gl.uniform2f(ur,c.width,c.height);gl.uniform1f(ut,still?4:(now-t0)/1000);gl.drawArrays(gl.TRIANGLES,0,3)}if(!still)requestAnimationFrame(frame)};
  requestAnimationFrame(frame);
})();

// intro (home only, once per visit)
const intro=document.getElementById('intro');
if(intro){let seen=false;try{seen=sessionStorage.getItem('intro')}catch(e){}
 if(seen){intro.remove()}else{
  setTimeout(()=>{intro.classList.add('done');intro.querySelector('p').textContent='Unlocked'},1600);
  setTimeout(()=>{intro.style.opacity=0;try{sessionStorage.setItem('intro',1)}catch(e){}},2400);
  setTimeout(()=>intro.remove(),3300)}}

// footer: clicking the phone number or email copies it
document.querySelectorAll('button.copy').forEach(b=>b.addEventListener('click',async()=>{
  const v=b.dataset.copy;let ok=false;
  try{await navigator.clipboard.writeText(v);ok=true}catch(e){
    const t=document.createElement('textarea');t.value=v;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();
    try{ok=document.execCommand('copy')}catch(_){}t.remove()}
  let toast=document.querySelector('.toast');if(!toast){toast=document.createElement('div');toast.className='toast';document.body.appendChild(toast)}
  toast.textContent=ok?'Copied '+v:v;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove('show'),1800);
}));
