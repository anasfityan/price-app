/* Final production safeguards and browser chrome sync. */
(function(){
  'use strict';

  const THEME_COLORS = {
    gold: '#070b10',
    pearl: '#eef3f6'
  };

  function currentTheme(){
    try {
      const stored = localStorage.getItem('theme');
      return stored === 'pearl' ? 'pearl' : 'gold';
    } catch(e) {
      return 'gold';
    }
  }

  function updateBrowserChrome(){
    const color = THEME_COLORS[currentTheme()];
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', color);
  }

  function wrapThemeChromeSync(){
    if(typeof window.setTheme !== 'function' || window.setTheme.__chromeSyncWrapped) return;
    const original = window.setTheme;
    const wrapped = function(){
      const result = original.apply(this, arguments);
      requestAnimationFrame(updateBrowserChrome);
      return result;
    };
    wrapped.__chromeSyncWrapped = true;
    window.setTheme = wrapped;
  }

  function annotateNavigation(){
    document.querySelectorAll('.bn-tab').forEach(function(tab){
      tab.setAttribute('aria-current', tab.classList.contains('active') ? 'page' : 'false');
    });
  }

  function observeNavigation(){
    const nav = document.querySelector('.bottom-nav');
    if(!nav || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(annotateNavigation);
    observer.observe(nav, {subtree:true, attributes:true, attributeFilter:['class']});
  }

  function init(){
    wrapThemeChromeSync();
    updateBrowserChrome();
    annotateNavigation();
    observeNavigation();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.addEventListener('load', wrapThemeChromeSync, {once:true});
})();
