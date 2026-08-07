(function(){
  'use strict';

  const ALLOWED = new Set(['gold','pearl']);
  const FALLBACK = 'gold';

  function normalizeTheme(theme){
    return ALLOWED.has(theme) ? theme : FALLBACK;
  }

  function iconMoon(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.6 8.6 0 1 0 20 15.2Z"/></svg>';
  }

  function iconSun(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  }

  function iconCheck(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 12.5 3.2 3.2 7.8-8"/></svg>';
  }

  function card(theme,label,kind,icon){
    return '<div class="tswatch theme-choice '+kind+'-preview" data-th="th-'+theme+'" onclick="setThemeRow(this,\''+theme+'\')" role="button" tabindex="0" aria-label="'+label+'">'+
      '<div class="theme-choice-head">'+
        '<div class="theme-choice-label"><span class="theme-choice-icon">'+icon+'</span><span>'+label+'</span></div>'+
        '<span class="theme-check">'+iconCheck()+'</span>'+
      '</div>'+
      '<div class="theme-preview"><span class="theme-preview-dot"></span><span class="theme-preview-line"></span><span class="theme-preview-button"></span></div>'+
    '</div>';
  }

  function rebuildThemeSelector(){
    const darkRow = document.getElementById('sc-theme-row-dark');
    const lightRow = document.getElementById('sc-theme-row-light');
    if(!darkRow) return;

    darkRow.innerHTML = card('gold','داكن','dark',iconMoon()) + card('pearl','فاتح','light',iconSun());
    if(lightRow) lightRow.style.display = 'none';

    const darkLabel = darkRow.previousElementSibling;
    if(darkLabel) {
      darkLabel.textContent = 'المظهر';
      darkLabel.style.textTransform = 'none';
      darkLabel.style.letterSpacing = '.2px';
      darkLabel.style.fontSize = '10px';
      darkLabel.style.opacity = '.75';
    }

    if(lightRow && lightRow.previousElementSibling && lightRow.previousElementSibling !== darkRow){
      lightRow.previousElementSibling.style.display = 'none';
    }

    const section = darkRow.closest('.appear-section');
    if(section){
      const title = section.querySelector('.appear-section-title');
      if(title) title.textContent = 'المظهر والألوان';
    }

    darkRow.querySelectorAll('.theme-choice').forEach(function(el){
      el.addEventListener('keydown',function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          el.click();
        }
      });
    });

    syncActive();
  }

  function syncActive(){
    let stored = FALLBACK;
    try { stored = normalizeTheme(localStorage.getItem('theme') || FALLBACK); } catch(e) {}
    document.querySelectorAll('.theme-choice').forEach(function(el){
      el.classList.toggle('active', el.dataset.th === 'th-'+stored);
    });
  }

  function enforceAllowedTheme(){
    let stored = FALLBACK;
    try { stored = localStorage.getItem('theme') || FALLBACK; } catch(e) {}
    if(!ALLOWED.has(stored)) {
      try { localStorage.setItem('theme', FALLBACK); } catch(e) {}
      if(typeof window.setTheme === 'function') window.setTheme(FALLBACK);
    }
  }

  function wrapThemeSetter(){
    if(typeof window.setTheme !== 'function' || window.setTheme.__twoThemeWrapped) return;
    const original = window.setTheme;
    const wrapped = function(theme){
      const normalized = normalizeTheme(theme);
      const result = original(normalized);
      setTimeout(syncActive,0);
      return result;
    };
    wrapped.__twoThemeWrapped = true;
    window.setTheme = wrapped;
  }

  function init(){
    wrapThemeSetter();
    enforceAllowedTheme();
    rebuildThemeSelector();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.addEventListener('load',function(){
    wrapThemeSetter();
    enforceAllowedTheme();
    rebuildThemeSelector();
  },{once:true});
})();
