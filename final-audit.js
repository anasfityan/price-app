/* Final audit safeguards and PWA polish. */
(function(){
  'use strict';

  const THEME_COLORS = {
    gold: '#0b0c0f',
    midnight: '#0a0f17',
    pearl: '#f2f1ed'
  };

  function currentTheme(){
    try {
      const stored = localStorage.getItem('theme');
      return THEME_COLORS[stored] ? stored : 'gold';
    } catch(e) {
      return 'gold';
    }
  }

  function updateBrowserChrome(){
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', THEME_COLORS[currentTheme()]);
  }

  function wrapThemeChromeSync(){
    if(typeof window.setTheme !== 'function' || window.setTheme.__chromeSyncWrapped) return;
    const original = window.setTheme;
    const wrapped = function(theme){
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
