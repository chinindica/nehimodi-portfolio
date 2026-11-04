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
  // Ecohumps: the stats take turns; the active percentage turns bold and the row of people fills in one by one to match it
  const ppl=document.querySelector('.el.people');
  if(ppl){const icons=[...ppl.querySelectorAll('.pp')];const stats=[...document.querySelectorAll('.seq')].sort((a,b)=>a.dataset.seq-b.dataset.seq);
    const pct=s=>{const m=s.textContent.match(/([\d.]+)\s*%/);return m?parseFloat(m[1]):0};
    let k=0,auto=null,idle=null;
    const show=i=>{const s=stats[i],n=pct(s)/10;stats.forEach(x=>x.classList.toggle('act',x===s));document.documentElement.classList.add('statson');
      icons.forEach((ic,j)=>{const f=Math.max(0,Math.min(1,n-j));ic.style.transitionDelay=(j*70)+'ms';ic.style.setProperty('--f',f.toFixed(2))})};
    const start=()=>{clearInterval(auto);auto=setInterval(()=>{k=(k+1)%stats.length;show(k)},2600)};
    stats.forEach((s,i)=>{s.addEventListener('mouseenter',()=>{clearInterval(auto);clearTimeout(idle);k=i;show(i)});
      s.addEventListener('mouseleave',()=>{clearTimeout(idle);idle=setTimeout(start,2600)})});
    new IntersectionObserver(es=>{if(es[0].isIntersecting){if(!auto){show(k);start()}}else{clearInterval(auto);auto=null}},{threshold:.3}).observe(ppl);}
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

// Off-Clock: demographic bars fill in; the dashed path draws itself as you scroll down to it
(function(){
  const bars=[...document.querySelectorAll('.el.bar')];
  if(bars.length){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){bars.forEach((b,k)=>setTimeout(()=>b.classList.add('in'),k*180));io.disconnect()}}),{threshold:.4});io.observe(bars[0])}
  const paths=[['YGUPwCpHlD0MY5LhPLBasfDctA','draw'],['3J8ZDwPjdo8BmCso4gRZwHbZVc','draw']].map(([id,c])=>{const i=document.querySelector('img[src*="'+id+'"]');if(i)i.classList.add(c);return i}).filter(Boolean);
  if(!paths.length)return;
  const upd=()=>{if(document.documentElement.classList.contains('lin'))return;const H=innerHeight;
    paths.forEach(i=>{const r=i.getBoundingClientRect();const p=Math.min(Math.max((H*.9-r.top)/(r.height+H*.35),0),1);i.style.setProperty('--dr',((1-p)*100).toFixed(1)+'%')})};
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
})();

// videos with sound: they start muted (browsers only allow that), a speaker button turns the sound on
(function(){
  const ON='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const OFF='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6M22 9l-6 6"/></svg>';
  document.querySelectorAll('video[data-sound]').forEach(v=>{
    const b=document.createElement('button');b.type='button';b.className='vsound';b.setAttribute('aria-label','Turn sound on');b.innerHTML=OFF+'<span>Sound</span>';
    b.style.cssText=v.getAttribute('style');v.after(b);
    if(v.parentElement.classList.contains('xl'))v.parentElement.classList.add('hasv');
    const set=on=>{v.muted=!on;b.innerHTML=(on?ON:OFF)+'<span>'+(on?'Sound on':'Sound')+'</span>';b.classList.toggle('on',on);b.setAttribute('aria-label',on?'Mute':'Turn sound on');if(on&&v.paused){const p=v.play();if(p)p.catch(()=>{})}};
    b.addEventListener('click',e=>{e.stopPropagation();set(v.muted)});
    v.addEventListener('click',()=>set(v.muted));v.style.cursor='pointer';
  });
})();
