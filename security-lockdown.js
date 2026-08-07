/* Security lockdown: keep the calculator UI/logic, remove unsafe browser-side admin writes. */
(function(){
  'use strict';

  function safeLocalSave(){
    const iqd = document.getElementById('usdIqd');
    const tr = document.getElementById('usdTry');
    if(!iqd || !tr || !iqd.value || !tr.value) return;

    const settings = { usdIqd: iqd.value, usdTry: tr.value };
    try {
      localStorage.setItem('settings', JSON.stringify(settings));
      localStorage.setItem('settings_time', Date.now().toString());
    } catch(e) {}

    try { if(typeof window.calc === 'function') window.calc(); } catch(e) {}

    const ok = document.getElementById('saveOk');
    if(ok){
      ok.textContent = document.documentElement.lang === 'ar' ? '✅ تم الحفظ على هذا الجهاز' : '✅ Saved on this device';
      ok.style.opacity = '1';
      setTimeout(function(){ ok.style.opacity = '0'; }, 2500);
    }
  }

  function disableLegacyAdmin(){
    try { localStorage.removeItem('admin_cfg'); } catch(e) {}

    ['adminBadge','adminUnlock','adminSetup','adminSaveRow'].forEach(function(id){
      const el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });

    window.saveSettings = safeLocalSave;
    window.pushRatesToGitHub = function(){
      const status = document.getElementById('syncStatus');
      if(status){
        status.textContent = document.documentElement.lang === 'ar' ? 'المزامنة المباشرة مع GitHub معطلة للأمان' : 'Direct GitHub sync disabled for security';
        status.style.display = 'inline-block';
      }
    };
    window.openAdminUnlock = function(){};
    window.saveAdminSetup = function(){};
    window.checkAdminCode = function(){};

    const credit = document.getElementById('drawer-credit');
    if(credit){
      credit.onclick = null;
      credit.style.cursor = 'default';
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', disableLegacyAdmin, {once:true});
  } else {
    disableLegacyAdmin();
  }
})();
