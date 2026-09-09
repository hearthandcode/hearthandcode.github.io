// Prompt Lab — interactive template form per technique
// Opens from catalog cards; renders form fields prefilled from the selected domain's samples.
(function(){
  let LAB_DATA = null;

  async function loadLab(){
    if(LAB_DATA) return LAB_DATA;
    const res = await fetch('./catalog-templates.json');
    LAB_DATA = await res.json();
    return LAB_DATA;
  }

  // Inject lab styles once
  const labCss = document.createElement('link');
  labCss.rel = 'stylesheet'; labCss.href = 'catalog-lab.css';
  document.head.appendChild(labCss);

  function el(tag, cls, html){ const n=document.createElement(tag); if(cls)n.className=cls; if(html!==undefined)n.innerHTML=html; return n; }

  function buildLab(data, entry, cardEl){
    const tech = data.techniques.find(t=>t.slug===entry.slug) || entry;
    const overlay = el('div','catalog-overlay open');
    overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true');
    const popup = el('div','catalog-popup lab-popup');
    // header
    const head = el('div','catalog-popup-header');
    head.innerHTML = `<span class="popup-type">${tech.type||''} · PROMPT LAB</span><h2>${tech.title}</h2>`;
    const closeBtn = el('button','catalog-popup-close','×'); closeBtn.setAttribute('aria-label','Close');
    head.appendChild(closeBtn);
    popup.appendChild(head);
    const body = el('div','catalog-popup-body lab-body');
    // domain selector
    const domWrap = el('div','lab-domain');
    const domLabel = el('label','lab-label','Practice domain');
    const domSel = el('select','lab-select');
    domSel.id='lab-domain';
    data.domains.forEach((d,i)=>{ const o=document.createElement('option'); o.value=d.id; o.textContent=d.label; domSel.appendChild(o); });
    domWrap.append(domLabel, domSel);
    body.appendChild(domWrap);
    // description of domain
    const domNote = el('p','lab-note');
    body.appendChild(domNote);
    // fields
    const fieldsWrap = el('div','lab-fields');
    body.appendChild(fieldsWrap);
    // output
    const outWrap = el('div','lab-output-wrap');
    const outLabel = el('label','lab-label','Generated prompt');
    const out = el('textarea','lab-output'); out.readOnly = false; out.rows = 8;
    const actions = el('div','lab-actions');
    const copyBtn = el('button','lab-copy','Copy prompt');
    const resetBtn = el('button','lab-reset','Reset to domain example');
    actions.append(copyBtn, resetBtn);
    outWrap.append(outLabel, out, actions);
    body.appendChild(outWrap);
    // worked example
    const exWrap = el('details','lab-example');
    exWrap.innerHTML = `<summary>Worked example from the catalog</summary><div class="lab-example-body">${tech.worked_example||''}</div>`;
    body.appendChild(exWrap);
    popup.appendChild(body);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.body.style.overflow='hidden';

    let currentDomain = data.domains[0].id;

    function renderFields(){
      const dom = data.domains.find(d=>d.id===currentDomain);
      domNote.innerHTML = `<strong>${dom.label}</strong> — fields are prefilled with a worked ${dom.label.toLowerCase()} example; edit freely.`;
      fieldsWrap.replaceChildren();
      tech.fields.forEach(f=>{
        const w = el('div','lab-field');
        const l = el('label'); l.htmlFor = 'f-'+f.key; l.textContent = f.label;
        const i = document.createElement('textarea'); i.id='f-'+f.key; i.rows=2; i.className='lab-input';
        i.value = (dom.samples[f.key] || '');
        i.placeholder = f.label;
        i.dataset.key = f.key;
        w.append(l,i);
        fieldsWrap.appendChild(w);
      });
      update();
    }

    function update(){
      let t = tech.template || '';
      fieldsWrap.querySelectorAll('.lab-input').forEach(inp=>{
        const key = inp.dataset.key;
        const val = inp.value.trim() || `{${key}}`;
        t = t.split('{'+key+'}').join(val);
      });
      // Any remaining {{...}} in atlas templates
      t = t.replace(/\{\{([^}]+)\}\}/g, (m,k)=>{ 
        const inp = fieldsWrap.querySelector('#f-'+CSS.escape(k.trim()));
        return (inp && inp.value.trim()) || `{${k.trim()}}`;
      });
      out.value = t;
    }

    fieldsWrap.addEventListener('input', update);
    domSel.onchange = ()=>{ currentDomain = domSel.value; renderFields(); };
    resetBtn.onclick = ()=>{ renderFields(); };
    copyBtn.onclick = async ()=>{
      try{ await navigator.clipboard.writeText(out.value); copyBtn.textContent='Copied ✓'; }
      catch(e){ out.select(); document.execCommand('copy'); copyBtn.textContent='Copied ✓'; }
      setTimeout(()=>copyBtn.textContent='Copy prompt', 1500);
    };
    const close = ()=>{ overlay.remove(); document.body.style.overflow=''; };
    closeBtn.onclick = close;
    overlay.onclick = e=>{ if(e.target===overlay) close(); };
    document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown', esc);} });

    renderFields();
  }

  // Wire: add a "Open Prompt Lab" action to each catalog card's popup, plus a lab button on cards
  document.querySelectorAll('.catalog-card').forEach(card=>{
    const labBtn = el('button','card-lab-btn','Open in Prompt Lab ↗');
    labBtn.setAttribute('aria-label', 'Open '+card.querySelector('h3')?.textContent+' in Prompt Lab');
    labBtn.onclick = async ev=>{
      ev.stopPropagation();
      const data = await loadLab();
      const slug = card.dataset.slug;
      const entry = { slug };
      // pull minimal entry info from data
      const tech = data.techniques.find(t=>t.slug===slug);
      buildLab(data, tech, card);
    };
    card.appendChild(labBtn);
  });
})();