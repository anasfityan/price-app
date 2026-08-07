(function(){
  'use strict';

  const KEY='gacela_calc_recent_v1';
  const MAX=4;

  function byId(id){return document.getElementById(id);}
  function cleanText(value){return String(value||'').replace(/\u00a0/g,' ').trim();}
  function roundValue(value){
    if(!Number.isFinite(value)) return null;
    const rounded=Math.round(value*1e10)/1e10;
    return Number.isInteger(rounded)?String(rounded):String(rounded);
  }
  function currentLiveResult(){
    try{
      if(typeof scCalcOp==='undefined'||typeof scCalcPrev==='undefined'||typeof scCalcCur==='undefined') return null;
      if(!scCalcOp||scCalcPrev===''||scCalcCur===''||scCalcCur==='Err') return null;
      const a=parseFloat(scCalcPrev), b=parseFloat(scCalcCur);
      if(!Number.isFinite(a)||!Number.isFinite(b)) return null;
      let result;
      if(scCalcOp==='÷') result=b===0?null:a/b;
      else if(scCalcOp==='×') result=a*b;
      else if(scCalcOp==='-') result=a-b;
      else if(scCalcOp==='+') result=a+b;
      else return null;
      return roundValue(result);
    }catch(e){return null;}
  }
  function updateLiveResult(){
    const result=byId('sc-calcResult');
    const label=document.querySelector('#screen-calc .calc-mem-lbl');
    if(!result) return;
    const live=currentLiveResult();
    if(label) label.textContent=live===null?'النتيجة':'النتيجة المباشرة';
    if(live===null){
      const display=cleanText(byId('sc-calcDisplay')&&byId('sc-calcDisplay').textContent);
      if(!display||display==='0'){
        result.textContent='—';
        result.classList.add('calc-live-pending');
      }
      return;
    }
    result.textContent=live;
    result.classList.remove('calc-live-pending');
  }

  function readRecent(){
    try{
      const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');
      return Array.isArray(parsed)?parsed.slice(0,MAX):[];
    }catch(e){return [];}
  }
  function writeRecent(items){
    try{localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX)));}catch(e){}
  }
  function saveCurrent(labelOverride){
    const display=cleanText(byId('sc-calcDisplay')&&byId('sc-calcDisplay').textContent);
    if(!display||display==='Err') return;
    const history=cleanText(byId('sc-calcHistory')&&byId('sc-calcHistory').textContent);
    const expr=cleanText(byId('sc-calcExpr')&&byId('sc-calcExpr').textContent);
    const label=labelOverride||history||expr||display;
    const items=readRecent().filter(function(item){return !(item.result===display&&item.expr===label);});
    items.unshift({expr:label,result:display,time:Date.now()});
    writeRecent(items);
    renderRecent();
  }
  function reuseResult(value){
    try{
      if(typeof scCalcCur!=='undefined') scCalcCur=String(value);
      if(typeof scCalcPrev!=='undefined') scCalcPrev='';
      if(typeof scCalcOp!=='undefined') scCalcOp='';
      if(typeof scCalcJust!=='undefined') scCalcJust=true;
    }catch(e){}
    const display=byId('sc-calcDisplay');
    const expr=byId('sc-calcExpr');
    const result=byId('sc-calcResult');
    if(display) display.textContent=String(value);
    if(expr) expr.textContent='';
    if(result){result.textContent=String(value);result.classList.remove('calc-live-pending');}
  }
  function renderRecent(){
    const list=document.querySelector('.calc-recent-list');
    if(!list) return;
    const items=readRecent();
    list.textContent='';
    if(!items.length){
      const empty=document.createElement('div');
      empty.className='calc-recent-empty';
      empty.textContent='ستظهر هنا آخر العمليات المثبتة';
      list.appendChild(empty);
      return;
    }
    items.forEach(function(item){
      const button=document.createElement('button');
      button.type='button';
      button.className='calc-recent-item';
      const expr=document.createElement('span');
      expr.className='calc-recent-expr';
      expr.textContent=item.expr;
      const result=document.createElement('span');
      result.className='calc-recent-result';
      result.textContent=item.result;
      button.append(expr,result);
      button.addEventListener('click',function(){reuseResult(item.result);});
      list.appendChild(button);
    });
  }
  function buildRecentPanel(){
    if(document.querySelector('.calc-recent-panel')) return;
    const keyboard=document.querySelector('#screen-calc .calc-kb-card');
    if(!keyboard||!keyboard.parentElement) return;
    const panel=document.createElement('section');
    panel.className='calc-recent-panel';
    panel.innerHTML='<div class="calc-recent-head"><div class="calc-recent-title">آخر العمليات</div><button type="button" class="calc-recent-clear">مسح السجل</button></div><div class="calc-recent-list"></div>';
    keyboard.insertAdjacentElement('afterend',panel);
    panel.querySelector('.calc-recent-clear').addEventListener('click',function(){writeRecent([]);renderRecent();});
    renderRecent();
  }
  function bindCalculator(){
    const screen=byId('screen-calc');
    if(!screen||screen.dataset.liveCalcBound==='1') return;
    screen.dataset.liveCalcBound='1';
    screen.addEventListener('click',function(event){
      const button=event.target.closest('button');
      if(!button) return;
      setTimeout(function(){
        updateLiveResult();
        if(button.classList.contains('ck-eq')) saveCurrent();
        else if(button.classList.contains('ck-sci')) saveCurrent(cleanText(button.textContent));
      },0);
    });
    const display=byId('sc-calcDisplay');
    const expr=byId('sc-calcExpr');
    const observer=new MutationObserver(updateLiveResult);
    if(display) observer.observe(display,{childList:true,characterData:true,subtree:true});
    if(expr) observer.observe(expr,{childList:true,characterData:true,subtree:true});
    updateLiveResult();
  }
  function init(){buildRecentPanel();bindCalculator();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  window.addEventListener('load',init,{once:true});
  new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});
})();
