/* Runtime cleanup layer: remove legacy UI leftovers and keep calculation history intentional. */
(function(){
  'use strict';

  let recordNextCalc = false;

  function cleanLegacyAdminDom(){
    ['adminBadge','adminUnlock','adminSetup','adminSaveRow'].forEach(function(id){
      const el = document.getElementById(id);
      if(el) el.remove();
    });
  }

  function fixKnownDuplicateIds(){
    ['lang-ar','lang-en'].forEach(function(id){
      const nodes = document.querySelectorAll('#' + id);
      nodes.forEach(function(el, index){
        if(index === 0) return;
        el.id = id + '--dup-' + index;
      });
    });
  }

  function persistCalcHistory(){
    try {
      if(typeof calcHistory !== 'undefined') {
        sessionStorage.setItem('calc_h', JSON.stringify({t:Date.now(), d:calcHistory}));
      }
    } catch(e) {}
  }

  function wrapPriceCalcHistory(){
    if(typeof window.calc !== 'function' || window.calc.__historyCleaned) return;
    const originalCalc = window.calc;

    const wrappedCalc = function(){
      let before = null;
      try {
        if(typeof calcHistory !== 'undefined') before = calcHistory.slice();
      } catch(e) {}

      const result = originalCalc.apply(this, arguments);

      if(!recordNextCalc && before){
        try {
          calcHistory.splice(0, calcHistory.length);
          Array.prototype.push.apply(calcHistory, before);
          persistCalcHistory();
          if(typeof currentChart !== 'undefined' && currentChart === 'calc' && typeof window.updateChart === 'function') {
            window.updateChart();
          }
        } catch(e) {}
      }
      return result;
    };

    wrappedCalc.__historyCleaned = true;
    window.calc = wrappedCalc;
  }

  function wrapPriceKeyboard(){
    if(typeof window.kbPress !== 'function' || window.kbPress.__historyCleaned) return;
    const originalKbPress = window.kbPress;

    const wrappedKbPress = function(key){
      const shouldRecord = key === '✓';
      if(shouldRecord) recordNextCalc = true;
      try {
        return originalKbPress.apply(this, arguments);
      } finally {
        if(shouldRecord) recordNextCalc = false;
      }
    };

    wrappedKbPress.__historyCleaned = true;
    window.kbPress = wrappedKbPress;
  }

  function tidyStaticAccessibility(){
    document.querySelectorAll('.bn-tab').forEach(function(tab){
      if(!tab.hasAttribute('type')) tab.setAttribute('type','button');
    });

    document.querySelectorAll('input[type="password"]').forEach(function(input){
      input.setAttribute('autocomplete','off');
    });
  }

  function init(){
    cleanLegacyAdminDom();
    fixKnownDuplicateIds();
    wrapPriceCalcHistory();
    wrapPriceKeyboard();
    tidyStaticAccessibility();
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }

  window.addEventListener('load', function(){
    wrapPriceCalcHistory();
    wrapPriceKeyboard();
  }, {once:true});
})();
