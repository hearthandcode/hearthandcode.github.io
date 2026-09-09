// Catalog pop-up info card system — fixed filter logic + animated grid
if(document.querySelector('.catalog-grid')){
  // Filter buttons — single pass, no redundant loop
  document.querySelectorAll('.catalog-filter').forEach(btn=>{
    btn.onclick=()=>{
      const type=btn.dataset.type;
      // Single pass: update each button's active state
      document.querySelectorAll('.catalog-filter').forEach(b=>{
        const isActive=b===btn;
        b.classList.toggle('active',isActive);
        b.setAttribute('aria-pressed',String(isActive));
      });
      // Animate: filter cards with staggered fade
      let delay=0;
      document.querySelectorAll('.catalog-card').forEach(card=>{
        const show=type==='all'||card.dataset.type===type;
        card.hidden=!show;
        // Animate visible cards with stagger
        if(show){
          card.style.transition='opacity .25s ease, transform .25s ease';
          card.style.opacity='0';
          card.style.transform='translateY(6px)';
          setTimeout(()=>{
            card.style.opacity='1';
            card.style.transform='translateY(0)';
          },delay);
          delay+=12; // stagger each card by 12ms
        }else{
          card.style.transition='opacity .15s ease';
          card.style.opacity='0';
        }
      });
      // Update search status
      const visible=document.querySelectorAll('.catalog-card:not([hidden])').length;
      const status=document.getElementById('catalog-status');
      if(status)status.textContent=`${visible} of 128 techniques shown`;
    };
  });
  // Search
  const searchInput=document.getElementById('catalog-search');
  if(searchInput){
    searchInput.oninput=()=>{
      const q=searchInput.value.toLowerCase().trim();
      let visible=0;
      document.querySelectorAll('.catalog-card').forEach(card=>{
        if(card.hidden)return;
        const match=!q||card.textContent.toLowerCase().includes(q);
        card.style.display=match?'flex':'none';
        if(match)visible++;
      });
      const status=document.getElementById('catalog-status');
      if(status)status.textContent=`${visible} of 128 techniques shown`;
    };
  }
  // Pop-up info cards
  const overlay=document.getElementById('catalog-overlay');
  const popupBody=document.getElementById('catalog-popup-body');
  const popupTitle=document.getElementById('catalog-popup-title');
  const popupType=document.getElementById('catalog-popup-type');
  const popupNumber=document.getElementById('catalog-popup-number');
  const closeBtn=document.getElementById('catalog-popup-close');
  const dataStore=document.getElementById('catalog-data');
  const entries=dataStore?JSON.parse(dataStore.textContent):[];

  function showEntry(slug){
    const entry=entries.find(e=>e.slug===slug);
    if(!entry||!entry.sections)return;
    popupTitle.textContent=entry.title;
    popupType.textContent=entry.type;
    popupNumber.textContent=`#${entry.number}`;
    popupBody.innerHTML=entry.sections.map(s=>`<section><h3>${s.title}</h3>${s.body_html||s.body||''}</section>`).join('');
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
  }

  document.querySelectorAll('.catalog-card').forEach(card=>{
    card.onclick=()=>showEntry(card.dataset.slug);
    card.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showEntry(card.dataset.slug);}};
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
  });

  closeBtn.onclick=()=>{overlay.classList.remove('open');document.body.style.overflow='';};
  overlay.onclick=(e)=>{if(e.target===overlay){overlay.classList.remove('open');document.body.style.overflow='';}};
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){overlay.classList.remove('open');document.body.style.overflow='';}});
}