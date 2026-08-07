/* Final UI polish helpers — visual only. */
(function(){
  'use strict';

  const ICONS = {
    theme:'<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-2.3a2 2 0 0 1-1.8-2.9l.8-1.6A1.7 1.7 0 0 0 14.2 3H12Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.8" r="1"/><circle cx="7.8" cy="14" r="1"/></svg>',
    language:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.7 5.5 3.7 9S14.4 18.5 12 21M12 3C9.6 5.5 8.3 8.5 8.3 12S9.6 18.5 12 21"/></svg>',
    keyboard:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 9h.01M9 9h.01M12 9h.01M15 9h.01M18 9h.01M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01M8 15h8"/></svg>',
    display:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>',
    settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
    backspace:'<svg class="key-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9.5L3 12l6.5-6Z"/><path d="m13 9 6 6M19 9l-6 6"/></svg>',
    check:'<svg class="key-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4 4L19 7"/></svg>'
  };

  function pickIcon(text){
    const t=(text||'').toLowerCase();
    if(/مظهر|ألوان|theme|appearance|style/.test(t)) return ICONS.theme;
    if(/لغة|language/.test(t)) return ICONS.language;
    if(/لوحة|keyboard|كيبورد/.test(t)) return ICONS.keyboard;
    if(/عرض|display|screen/.test(t)) return ICONS.display;
    return ICONS.settings;
  }

  function cleanTitleText(text){return String(text||'').replace(/^[^\p{L}\p{N}]+/u,'').trim();}

  function upgradeSectionTitles(){
    document.querySelectorAll('.appear-section-title').forEach(function(title){
      if(title.dataset.uiPolished==='1') return;
      const text=cleanTitleText(title.textContent);
      title.textContent='';
      const icon=document.createElement('span');icon.className='ui-section-icon';icon.innerHTML=pickIcon(text);
      const label=document.createElement('span');label.textContent=text;
      title.append(icon,label);title.dataset.uiPolished='1';
    });
  }

  function addAccessibleNames(){
    document.querySelectorAll('.theme-choice').forEach(function(el){
      if(!el.getAttribute('title')){const label=el.querySelector('.theme-choice-label');if(label) el.title=label.textContent.trim();}
    });
  }

  function setIcon(el,svg,label){
    if(!el||el.dataset.keyIcon==='1') return;
    el.innerHTML=svg;
    el.setAttribute('aria-label',label);
    el.setAttribute('title',label);
    el.dataset.keyIcon='1';
  }

  function upgradeKeyboardSymbols(root){
    const scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll('.ck-bs').forEach(function(el){setIcon(el,ICONS.backspace,'حذف رقم');});
    scope.querySelectorAll('.k.k-del').forEach(function(el){setIcon(el,ICONS.backspace,'حذف رقم');});
    scope.querySelectorAll('.k.k-ok').forEach(function(el){setIcon(el,ICONS.check,'تأكيد');});
  }

  function init(){upgradeSectionTitles();addAccessibleNames();upgradeKeyboardSymbols(document);}

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  window.addEventListener('load',init,{once:true});

  const observer=new MutationObserver(function(mutations){
    mutations.forEach(function(m){m.addedNodes.forEach(function(node){if(node.nodeType===1) upgradeKeyboardSymbols(node);});});
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
