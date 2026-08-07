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

  const KB_STYLE_ICONS = [
    '<svg class="kb-style-svg" viewBox="0 0 32 26" aria-hidden="true"><rect x="2" y="3" width="28" height="20" rx="5"/><rect x="6" y="7" width="5" height="4" rx="1"/><rect x="13.5" y="7" width="5" height="4" rx="1"/><rect x="21" y="7" width="5" height="4" rx="1"/><rect x="6" y="14" width="5" height="4" rx="1"/><rect x="13.5" y="14" width="12.5" height="4" rx="1"/></svg>',
    '<svg class="kb-style-svg" viewBox="0 0 32 26" aria-hidden="true"><rect x="2" y="3" width="28" height="20" rx="7"/><circle cx="8.5" cy="9" r="2.2"/><circle cx="16" cy="9" r="2.2"/><circle cx="23.5" cy="9" r="2.2"/><rect x="7" y="14" width="18" height="4" rx="2"/></svg>',
    '<svg class="kb-style-svg" viewBox="0 0 32 26" aria-hidden="true"><rect x="2" y="3" width="28" height="20" rx="4"/><rect x="6" y="7" width="7" height="4" rx="1"/><rect x="19" y="7" width="7" height="4" rx="1"/><rect x="6" y="14" width="7" height="4" rx="1"/><rect x="19" y="14" width="7" height="4" rx="1"/><path d="m17 5-4 7h4l-3 7"/></svg>',
    '<svg class="kb-style-svg" viewBox="0 0 32 26" aria-hidden="true"><rect x="2" y="3" width="28" height="20" rx="3"/><path d="M6 8h5M14 8h5M22 8h4M6 13h5M14 13h5M22 13h4M8 18h16"/></svg>'
  ];

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

  function keyboardStyleIndex(el,index){
    if(el.id){
      const match=el.id.match(/(?:kb-dot-|kbdot-?)(\d+)/i);
      if(match) return Math.max(0,Math.min(3,Number(match[1])-1));
    }
    const raw=el.dataset&&el.dataset.kb;
    if(raw) return Math.max(0,Math.min(3,Number(raw)-1));
    return index%4;
  }

  function upgradeKeyboardStyleSelectors(){
    const dots=Array.from(document.querySelectorAll('.kbdot'));
    dots.forEach(function(el,index){
      const i=keyboardStyleIndex(el,index);
      el.innerHTML=KB_STYLE_ICONS[i];
      el.setAttribute('aria-label','نمط لوحة المفاتيح '+(i+1));
      el.setAttribute('title','نمط لوحة المفاتيح '+(i+1));
      el.dataset.kbStyleIcon='1';
    });
  }

  function tagLiveRateCards(){
    const primary=document.getElementById('tickerRate2');
    const secondary=document.getElementById('eurUsdRate');
    if(primary&&primary.parentElement) primary.parentElement.classList.add('fx-card-primary');
    if(secondary&&secondary.parentElement) secondary.parentElement.classList.add('fx-card-secondary');
  }

  function applyGacelaBrand(){
    document.title='GACELA STUDIO';
    const name=document.getElementById('store-name');
    const sub=document.getElementById('store-sub');
    if(name){name.textContent='GACELA';name.classList.add('gacela-brand-name');}
    if(sub){sub.textContent='STUDIO';sub.classList.add('gacela-brand-studio');}
    document.querySelectorAll('.drawer div').forEach(function(el){
      if(el.children.length<=1 && /Trendy\s*Store/i.test((el.textContent||'').trim())){
        el.innerHTML='<span class="gacela-drawer-name">GACELA</span> <span class="gacela-drawer-studio">STUDIO</span>';
      }
    });
  }

  function activeScreenName(){
    const active=document.querySelector('[id^="screen-"].active');
    return active ? active.id.replace('screen-','') : 'home';
  }

  function syncTickerForScreen(name){
    const hide=name==='rates'||name==='appear';
    document.body.classList.toggle('hide-global-rate-ticker',hide);
  }

  function wrapScreenSwitch(){
    if(typeof window.switchScreen!=='function'||window.switchScreen.__gacelaWrapped) return;
    const original=window.switchScreen;
    const wrapped=function(name){
      const result=original.apply(this,arguments);
      syncTickerForScreen(name);
      applyGacelaBrand();
      return result;
    };
    wrapped.__gacelaWrapped=true;
    window.switchScreen=wrapped;
  }

  function wrapLanguage(){
    if(typeof window.setLang!=='function'||window.setLang.__gacelaWrapped) return;
    const original=window.setLang;
    const wrapped=function(){
      const result=original.apply(this,arguments);
      setTimeout(applyGacelaBrand,0);
      return result;
    };
    wrapped.__gacelaWrapped=true;
    window.setLang=wrapped;
  }

  function tagRatesHeading(){
    document.querySelectorAll('.rates-screen-scroll > div').forEach(function(block){
      Array.from(block.children||[]).forEach(function(el){
        if(/Live\s*&\s*Custom\s*Rates/i.test((el.textContent||'').trim())) el.classList.add('rates-live-custom-title');
      });
    });
  }

  function init(){
    upgradeSectionTitles();
    addAccessibleNames();
    upgradeKeyboardSymbols(document);
    upgradeKeyboardStyleSelectors();
    tagLiveRateCards();
    tagRatesHeading();
    applyGacelaBrand();
    wrapScreenSwitch();
    wrapLanguage();
    syncTickerForScreen(activeScreenName());
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  window.addEventListener('load',init,{once:true});

  const observer=new MutationObserver(function(mutations){
    let needsKeyboardStyles=false;
    let needsRateCards=false;
    mutations.forEach(function(m){
      m.addedNodes.forEach(function(node){
        if(node.nodeType===1){
          upgradeKeyboardSymbols(node);
          if(node.matches?.('.kbdot')||node.querySelector?.('.kbdot')) needsKeyboardStyles=true;
          if(node.id==='tickerRate2'||node.id==='eurUsdRate'||node.querySelector?.('#tickerRate2,#eurUsdRate')) needsRateCards=true;
        }
      });
    });
    if(needsKeyboardStyles) upgradeKeyboardStyleSelectors();
    if(needsRateCards) tagLiveRateCards();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
