const TITLES={A:'Membros inferiores, mobilidade e core',B:'Costas, bíceps e ombros',C:'Peito, tríceps, ombros e core'};
let DATA={},MEDIA={},current='A',deferredPrompt,timerId=null,timerEnd=0;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const stateKey=t=>`treino-elias-${t}`;
function loadState(t){try{return JSON.parse(localStorage.getItem(stateKey(t)))||{done:{},loads:{},notes:''}}catch{return{done:{},loads:{},notes:''}}}
function saveState(t,s){localStorage.setItem(stateKey(t),JSON.stringify(s))}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
function exerciseImage(t,i){return `assets/exercises/${t.toLowerCase()}_${String(i+1).padStart(2,'0')}.webp`}
function mediaKey(t,i){return `${t}:${i}`}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._hide);t._hide=setTimeout(()=>t.classList.remove('show'),2200)}
function restSeconds(rest){const m=String(rest).match(/(\d+)\s*min/i);return m?Number(m[1])*60:0}
function renderMedia(t,i,name){
  const m=MEDIA[mediaKey(t,i)];
  if(m&&m.type==='animation'){
    const chips=(m.secondary||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join('');
    const approx=m.approx?`<span class="referenceBadge">Referência visual</span>`:'';
    return `<div class="mediaWrap animatedMedia">
      <div class="mediaStage">
        <img class="exerciseMedia" src="${escapeHtml(m.src)}" alt="Animação: ${escapeHtml(name)}" loading="lazy" decoding="async">
        <div class="mediaTop"><span class="mediaBadge">${escapeHtml(m.badge||'ANIMAÇÃO')}</span>${approx}</div>
        <button class="expandMedia" type="button" data-src="${escapeHtml(m.src)}" data-title="${escapeHtml(name)}" aria-label="Ampliar animação de ${escapeHtml(name)}">⛶</button>
      </div>
      <div class="muscles"><div><small>Principal</small><strong>${escapeHtml(m.primary||'—')}</strong></div><div><small>Secundários</small><div class="muscleChips">${chips||'<span>—</span>'}</div></div></div>
      ${m.note?`<div class="visualNote">${escapeHtml(m.note)}</div>`:''}
    </div>`;
  }
  return `<div class="mediaWrap staticMedia"><div class="mediaStage"><img class="exerciseMedia staticImg" src="${exerciseImage(t,i)}" alt="Ilustração: ${escapeHtml(name)}" loading="lazy"><div class="mediaTop"><span class="mediaBadge stretch">ALONGAMENTO</span></div><button class="expandMedia" type="button" data-src="${exerciseImage(t,i)}" data-title="${escapeHtml(name)}" aria-label="Ampliar imagem de ${escapeHtml(name)}">⛶</button></div></div>`;
}
function renderWorkout(t){
  current=t;$('#historyView').classList.add('hidden');$('#workoutView').classList.remove('hidden');
  $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.workout===t));
  $('#workoutTag').textContent=`TREINO ${t}`;$('#workoutTitle').textContent=TITLES[t];
  const s=loadState(t),cards=$('#cards');cards.innerHTML='';
  DATA[t].forEach((e,i)=>{
    const [name,series,reps,load,rest]=e,done=!!s.done[i],secs=restSeconds(rest);
    const card=document.createElement('article');card.className='card'+(done?' done':'');
    card.innerHTML=`${renderMedia(t,i,name)}
      <div class="cardContent">
        <div class="exerciseHead"><span class="number">${String(i+1).padStart(2,'0')}</span><div><small>EXERCÍCIO</small><h3>${escapeHtml(name)}</h3></div></div>
        <div class="stats">
          <div class="stat"><small>Séries</small><strong>${series}</strong></div>
          <div class="stat"><small>Repetições</small><strong>${reps}</strong></div>
          <div class="stat loadStat"><small>Carga</small><input class="loadInput" data-i="${i}" value="${escapeHtml(s.loads[i]??load)}" aria-label="Carga de ${escapeHtml(name)}"></div>
          <div class="stat"><small>Intervalo</small><strong>${rest}</strong></div>
        </div>
        <div class="cardActions">
          <label class="completeToggle"><input type="checkbox" data-i="${i}" ${done?'checked':''}><span class="checkIcon">✓</span><span>${done?'Concluído':'Marcar como concluído'}</span></label>
          ${secs?`<button class="restBtn" type="button" data-seconds="${secs}">⏱ Descanso</button>`:''}
        </div>
      </div>`;
    cards.appendChild(card);
  });
  $('#notes').value=s.notes||'';wireCards();wireMedia();updateProgress();
}
function wireCards(){
  $$('.completeToggle input').forEach(el=>el.onchange=()=>{const i=el.dataset.i,s=loadState(current);s.done[i]=el.checked;saveState(current,s);const card=el.closest('.card');card.classList.toggle('done',el.checked);el.nextElementSibling.nextElementSibling.textContent=el.checked?'Concluído':'Marcar como concluído';updateProgress();if(el.checked)showToast('Exercício concluído ✓')});
  $$('.loadInput').forEach(el=>el.onchange=()=>{const s=loadState(current);s.loads[el.dataset.i]=el.value.trim();saveState(current,s);showToast('Carga salva')});
  $$('.restBtn').forEach(btn=>btn.onclick=()=>startTimer(Number(btn.dataset.seconds)));
}
function wireMedia(){$$('.expandMedia').forEach(btn=>btn.onclick=()=>openMedia(btn.dataset.src,btn.dataset.title))}
function openMedia(src,title){$('#mediaModalTitle').textContent=title;$('#mediaModalImg').src=src;$('#mediaModal').classList.remove('hidden');document.body.classList.add('modalOpen')}
function closeMedia(){$('#mediaModalImg').removeAttribute('src');$('#mediaModal').classList.add('hidden');document.body.classList.remove('modalOpen')}
function updateProgress(){if(current==='history')return;const s=loadState(current),total=DATA[current].length,done=Object.values(s.done).filter(Boolean).length,pct=total?done/total*100:0;$('#doneCount').textContent=done;$('#totalCount').textContent=total;$('#progressBar').style.width=`${pct}%`}
function renderHistory(){
  current='history';$('#workoutView').classList.add('hidden');$('#historyView').classList.remove('hidden');$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.workout==='history'));
  let h=[];try{h=JSON.parse(localStorage.getItem('treino-elias-history'))||[]}catch{}
  const box=$('#historyList');if(!h.length){box.innerHTML='<div class="emptyState"><span>↻</span><b>Nenhum treino finalizado</b><small>Seu histórico aparecerá aqui.</small></div>';return}
  box.innerHTML=h.slice().reverse().map(x=>`<article class="historyItem"><div class="historyMark">${x.workout}</div><div><b>Treino ${x.workout}</b><small>${x.date} • ${x.done}/${x.total} exercícios</small></div><strong>${x.percent}%</strong></article>`).join('')
}
function startTimer(seconds){clearInterval(timerId);timerEnd=Date.now()+seconds*1000;$('#timerBar').classList.remove('hidden');tickTimer();timerId=setInterval(tickTimer,250)}
function tickTimer(){const left=Math.max(0,Math.ceil((timerEnd-Date.now())/1000)),m=Math.floor(left/60),s=String(left%60).padStart(2,'0');$('#timerValue').textContent=`${m}:${s}`;if(left<=0){clearInterval(timerId);timerId=null;$('#timerBar').classList.add('finished');showToast('Intervalo concluído');if(navigator.vibrate)navigator.vibrate([120,80,120]);setTimeout(()=>{$('#timerBar').classList.add('hidden');$('#timerBar').classList.remove('finished')},1800)}}
function cancelTimer(){clearInterval(timerId);timerId=null;$('#timerBar').classList.add('hidden');$('#timerBar').classList.remove('finished')}
function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem('treino-elias-theme',theme);document.querySelector('meta[name="theme-color"]').setAttribute('content',theme==='dark'?'#050d14':'#071827')}
async function init(){
  [DATA,MEDIA]=await Promise.all([fetch('data.json').then(r=>r.json()),fetch('media.json').then(r=>r.json())]);
  setTheme(localStorage.getItem('treino-elias-theme')||'light');renderWorkout('A');
  $$('.tab').forEach(b=>b.onclick=()=>b.dataset.workout==='history'?renderHistory():renderWorkout(b.dataset.workout));
  $('#notes').oninput=()=>{if(current==='history')return;const s=loadState(current);s.notes=$('#notes').value;saveState(current,s)};
  $('#resetBtn').onclick=()=>{if(!confirm('Limpar as marcações de concluído deste treino?'))return;const s=loadState(current);s.done={};saveState(current,s);renderWorkout(current);showToast('Marcações limpas')};
  $('#finishBtn').onclick=()=>{const s=loadState(current),total=DATA[current].length,done=Object.values(s.done).filter(Boolean).length;if(!done&&!confirm('Nenhum exercício foi marcado. Finalizar mesmo assim?'))return;let h=[];try{h=JSON.parse(localStorage.getItem('treino-elias-history'))||[]}catch{}const now=new Date();h.push({workout:current,date:now.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}),done,total,percent:Math.round(done/total*100),notes:s.notes||''});localStorage.setItem('treino-elias-history',JSON.stringify(h.slice(-100)));s.done={};saveState(current,s);renderWorkout(current);showToast('Treino registrado no histórico')};
  $('#clearHistory').onclick=()=>{if(confirm('Apagar todo o histórico deste aparelho?')){localStorage.removeItem('treino-elias-history');renderHistory();showToast('Histórico apagado')}};
  $('#mediaModalClose').onclick=closeMedia;$('#mediaModal').onclick=e=>{if(e.target.id==='mediaModal')closeMedia()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMedia()});
  $('#timerCancel').onclick=cancelTimer;
  $('#themeBtn').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
  $('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')};
  if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
init().catch(err=>{console.error(err);$('#cards').innerHTML='<div class="emptyState"><b>Não foi possível carregar a ficha.</b><small>Atualize a página.</small></div>'});
