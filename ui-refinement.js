(function(){
  'use strict';

  const ALLOWED = new Set(['gold','midnight','pearl']);
  const FALLBACK = 'gold';

  function normalizeTheme(theme){
    return ALLOWED.has(theme) ? theme : FALLBACK;
  }

  function simplifyThemeSelectors(){
    document.querySelectorAll('[id^="ts-"]').forEach(function(el){
      const theme = el.id.replace(/^ts-/, '');
      const allowed = ALLOWED.has(theme);
      el.style.display = allowed ? '' : 'none';
      el.classList.toggle('ui-theme-allowed', allowed);
    });

    document.querySelectorAll('[data-th]').forEach(function(el){
      const theme = String(el.dataset.th || '').replace(/^th-/, '');
      if(theme && !ALLOWED.has(theme)) el.style.display = 'none';
    });

    document.querySelectorAll('#sc-theme-row-dark, #sc-theme-row-light').forEach(function(row){
      if(row) {
        row.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        row.style.justifyContent = 'start';
      }
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
    if(typeof window.setTheme !== 'function' || window.setTheme.__threeThemeWrapped) return;
    const original = window.setTheme;
    const wrapped = function(theme){ return original(normalizeTheme(theme)); };
    wrapped.__threeThemeWrapped = true;
    window.setTheme = wrapped;
  }

  function init(){
    wrapThemeSetter();
    enforceAllowedTheme();
    simplifyThemeSelectors();
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }

  window.addEventListener('load', function(){
    wrapThemeSetter();
    enforceAllowedTheme();
    simplifyThemeSelectors();
  }, {once:true});
})();
