/* GACELA PRICE interaction sound tuning: calculator = haptics only, global UI = subtle audio. */
(function(){
  'use strict';

  let calculatorPointer = false;

  function isCalculatorTarget(target){
    return !!(target && target.closest && target.closest('#screen-calc'));
  }

  function rememberTarget(event){
    calculatorPointer = isCalculatorTarget(event.target);
  }

  document.addEventListener('pointerdown', rememberTarget, true);
  document.addEventListener('touchstart', rememberTarget, {capture:true, passive:true});
  document.addEventListener('mousedown', rememberTarget, true);

  function calculatorInteractionActive(){
    if(calculatorPointer) return true;
    const active = document.activeElement;
    return isCalculatorTarget(active);
  }

  function softTone(startHz, endHz, duration, volume){
    try{
      if(typeof soundEnabled !== 'undefined' && !soundEnabled) return;
      if(typeof getACtx !== 'function') return;
      const ctx = getACtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startHz, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endHz, ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    }catch(e){}
  }

  window.playClick = function(){
    if(calculatorInteractionActive()) return;
    softTone(360, 300, 0.045, 0.018);
  };

  window.playDrawerOpen = function(){
    if(calculatorInteractionActive()) return;
    softTone(260, 320, 0.07, 0.016);
  };
})();
