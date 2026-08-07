/* GACELA PRICE bottom navigation icons. Keeps existing navigation behavior. */
(function(){
  'use strict';

  const ICONS={
    'bn-home':'<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.8 10.6v8.1c0 .7.6 1.3 1.3 1.3h9.8c.7 0 1.3-.6 1.3-1.3v-8.1"/><path d="M9.3 20v-5.6h5.4V20"/>',
    'bn-calc':'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8"/><path d="M8.3 11.2h.01M12 11.2h.01M15.7 11.2h.01M8.3 14.8h.01M12 14.8h.01M15.7 14.8h.01M8.3 18.2h.01M12 18.2h3.7"/>',
    'bn-rates':'<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M7 9h10"/><path d="M7 15h4.2"/><circle cx="15.8" cy="14.9" r="2.15"/>',
    'bn-appear':'<path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8c0-1.1-.9-2-2-2h-2.2a2 2 0 0 1-1.8-2.9l.7-1.4A1.8 1.8 0 0 0 13.9 3.2H12Z"/><circle cx="7.4" cy="10" r=".8"/><circle cx="10" cy="6.8" r=".8"/><circle cx="8" cy="14" r=".8"/>'
  };

  function upgrade(){
    Object.keys(ICONS).forEach(function(id){
      const tab=document.getElementById(id);
      if(!tab) return;
      const svg=tab.querySelector('.bn-svg');
      if(!svg) return;
      svg.setAttribute('viewBox','0 0 24 24');
      svg.innerHTML=ICONS[id];
      svg.dataset.gacelaIcon='2';
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',upgrade,{once:true});
  else upgrade();
  window.addEventListener('load',upgrade,{once:true});
})();
