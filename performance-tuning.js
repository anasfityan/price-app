/* Lightweight runtime performance tuning. No layout or pricing behavior changes. */
(function(){
  'use strict';

  let chartFrame = 0;

  function wrapChartUpdates(){
    if(typeof window.updateChart !== 'function' || window.updateChart.__perfWrapped) return;
    const original = window.updateChart;

    const wrapped = function(){
      const args = arguments;
      const ctx = this;
      if(document.hidden) return;
      if(chartFrame) cancelAnimationFrame(chartFrame);
      chartFrame = requestAnimationFrame(function(){
        chartFrame = 0;
        original.apply(ctx, args);
      });
    };

    wrapped.__perfWrapped = true;
    window.updateChart = wrapped;
  }

  function suspendVisualWorkWhenHidden(){
    document.addEventListener('visibilitychange', function(){
      document.documentElement.classList.toggle('app-hidden', document.hidden);
      if(!document.hidden && typeof window.updateChart === 'function') window.updateChart();
    }, {passive:true});
  }

  function init(){
    wrapChartUpdates();
    suspendVisualWorkWhenHidden();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.addEventListener('load', wrapChartUpdates, {once:true});
})();
