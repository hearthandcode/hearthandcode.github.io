// Catalog pop-up info card system
// Loaded on prompt-catalog.html page
if(document.querySelector('.catalog-grid')){
  // Filter buttons
  document.querySelectorAll('.catalog-filter').forEach(btn=>{
    btn.onclick=()=>{
      const type=btn.dataset.type;
      document.querySelectorAll('.catalog-filter').forEach(b=>{b.classList.toggle('active',b===b);b.setAttribute('aria-pressed',String(b===b));});
      document.querySelectorAll('.catalog-card').forEach(card=>{
        card.hidden=!(type==='all'||card.dataset.type===type);
      });
      // Re-highlight active
      document.querySelectorAll('.catalog-filter').forEach(b=>{
        b.classList.toggle('active',b===btn);
        b.setAttribute('aria-pressed',String(b===btn));
      });
    };
  });
  // Search
  const searchInput=document.getElementById('catalog-search');
  if(searchInput){
    searchInput.oninput=()=>{
      const q=searchInput.value.toLowerCase().trim();
      document.querySelectorAll('.catalog-card').forEach(card=>{
        if(card.hidden)return; // already hidden by filter
        card.hidden=!card.textContent.toLowerCase().includes(q);
      });
    };
  }
  // Pop-up cards
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