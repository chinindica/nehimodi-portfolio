// cursor dot
const dot=document.createElement('div');dot.id='dot';document.body.appendChild(dot);
addEventListener('mousemove',e=>{dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';dot.classList.toggle('hov',!!e.target.closest('a,button,video'))});

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

// design POV lamp: the cord gets longer as you scroll, so the bulb drifts down past the quotes
const bulb=document.querySelector('.bulb');
if(bulb){
  const qs=bulb.parentElement;
  const drop=()=>{
    if(getComputedStyle(bulb).display==='none')return;
    const r=qs.getBoundingClientRect();
    const p=Math.min(Math.max((innerHeight*.75-r.top)/(innerHeight*.75+r.height*.5),0),1);
    bulb.style.setProperty('--drop',(p*130).toFixed(1)+'px');
  };
  addEventListener('scroll',drop,{passive:true});addEventListener('resize',drop);drop();
}

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
