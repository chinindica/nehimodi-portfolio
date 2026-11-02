// Project pages: scale the 1512px canvas to the window, or stack it on tablets/phones.
(function(){
  const pc=document.querySelector('.pc');if(!pc)return;
  const wrap=document.createElement('div');wrap.className='pcw';pc.parentNode.insertBefore(wrap,pc);wrap.appendChild(pc);
  const hb=pc.querySelector('.band');if(hb)pc.style.setProperty('--herobg',hb.style.background);
  const fit=()=>{
    const w=document.documentElement.clientWidth;
    const lin=w<1000;
    document.documentElement.classList.toggle('lin',lin);
    if(lin){pc.style.removeProperty('--z');wrap.style.height='';
      document.querySelectorAll('.mfig').forEach(f=>{const bw=+getComputedStyle(f).getPropertyValue('--bw'),bh=+getComputedStyle(f).getPropertyValue('--bh');const k=f.clientWidth/bw;
        f.style.setProperty('--k',k.toFixed(4));f.style.setProperty('--boost',Math.min(1.9,Math.max(1,.7/k)).toFixed(3));f.style.height=(bh*k+8)+'px'});
      return}
    const z=Math.min(1,w/1512);
    pc.style.setProperty('--z',z);
    pc.style.setProperty('--bleed',Math.max(0,(w-1512)/2)+'px');
    wrap.style.height=(parseFloat(getComputedStyle(pc).getPropertyValue('--H'))*z)+'px';
  };
  fit();addEventListener('resize',fit);
  const top=()=>{if(!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'})};top();addEventListener('load',top);addEventListener('pageshow',top);

  // Kshovik survey stat: 70% → 58% → 60% → 65%
  const sv=[...document.querySelectorAll('.stat .sv')];
  if(sv.length){let i=0;setInterval(()=>{sv[i].classList.remove('on');i=(i+1)%sv.length;sv[i].classList.add('on')},2600)}

  // "Utensil washing can feel…" lines
  const fl=[...document.querySelectorAll('.feel span')];
  if(fl.length){let i=0;fl[0].classList.add('on');setInterval(()=>{const a=fl[i];a.classList.remove('on');a.classList.add('out');setTimeout(()=>a.classList.remove('out'),650);i=(i+1)%fl.length;fl[i].classList.add('on')},2200)}

  // Ecohumps survey stats reveal one by one when the section comes into view
  const seq=[...document.querySelectorAll('.seq')];
  if(seq.length){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){seq.sort((a,b)=>a.dataset.seq-b.dataset.seq).forEach((e,k)=>setTimeout(()=>e.classList.add('in'),k*650));io.disconnect()}},{threshold:.3});io.observe(seq[0])}
  // Ecohumps: hovering a stat lights up that share of the people row
  const hov=document.querySelector('.hov');
  if(hov){const imgs=[...hov.querySelectorAll('img')];document.querySelectorAll('.seq').forEach(s=>{const n=s.dataset.seq;s.addEventListener('mouseenter',()=>imgs.forEach(i=>i.classList.toggle('on',i.dataset.for===n)))})}
})();

// videos start from the beginning when scrolled into view, pause when they leave
(function(){
  const vids=document.querySelectorAll('video[data-inview]');if(!vids.length)return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;
    if(e.isIntersecting){if(!v._playing){v.currentTime=0;v._playing=true;const p=v.play();if(p)p.catch(()=>{})}}
    else if(e.intersectionRatio===0||!e.isIntersecting){v.pause();v._playing=false}
  }),{threshold:.35});
  vids.forEach(v=>io.observe(v));
})();
