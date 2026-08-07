/* GACELA PRICE interaction sound tuning: calculator = haptics only, bottom nav = soft dedicated tone. */
(function(){
  'use strict';

  let calculatorPointer = false;
  let navPointerUntil = 0;

  function isCalculatorTarget(target){
    return !!(target && target.closest && target.closest('#screen-calc'));
  }

  function isBottomNavTarget(target){
    return !!(target && target.closest && target.closest('.bottom-nav .bn-tab'));
  }

  function rememberTarget(event){
    calculatorPointer = isCalculatorTarget(event.target);
    if(isBottomNavTarget(event.target)) navPointerUntil = Date.now() + 180;
  }

  document.addEventListener('pointerdown', rememberTarget, true);
  document.addEventListener('touchstart', rememberTarget, {capture:true, passive:true});
  document.addEventListener('mousedown', rememberTarget, true);

  function calculatorInteractionActive(){
    if(calculatorPointer) return true;
    const active = document.activeElement;
    return isCalculatorTarget(active);
  }

  function softTone(startHz, endHz, duration, volume, type){
    try{
      if(typeof soundEnabled !== 'undefined' && !soundEnabled) return;
      if(typeof getACtx !== 'function') return;
      const ctx = getACtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(startHz, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endHz, ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    }catch(e){}
  }

  function playNavTone(){
    /* Short, soft confirmation rather than the old bright UI chirp. */
    softTone(315, 380, 0.055, 0.014, 'sine');
  }

  window.playClick = function(){
    if(calculatorInteractionActive()) return;
    /* Bottom navigation has its own dedicated sound; prevent a second click tone. */
    if(Date.now() < navPointerUntil) return;
    softTone(360, 300, 0.045, 0.018, 'sine');
  };

  window.playDrawerOpen = function(){
    if(calculatorInteractionActive()) return;
    softTone(260, 320, 0.07, 0.016, 'sine');
  };

  document.addEventListener('click', function(event){
    const tab = event.target && event.target.closest && event.target.closest('.bottom-nav .bn-tab');
    if(!tab) return;
    navPointerUntil = Date.now() + 180;
    playNavTone();
  }, true);
})();
