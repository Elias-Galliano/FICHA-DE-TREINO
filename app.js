const TITLES={A:'Membros inferiores, mobilidade e core',B:'Costas, bíceps e ombros',C:'Peito, tríceps, ombros e core'};
let DATA={},MEDIA={};let current='A';let deferredPrompt;let mediaObserver;
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const stateKey=t=>`treino-elias-${t}`;
function loadState(t){try{return JSON.parse(localStorage.getItem(stateKey(t)))||{done:{},loads:{},notes:''}}catch{return{done:{},loads:{},notes:''}}}
function saveState(t,s){localStorage.setItem(stateKey(t),JSON.stringify(s))}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
function exerciseImage(t,i){return `assets/exercises/${t.toLowerCase()}_${String(i+1).padStart(2,'0')}.webp`}
function mediaKey(t,i){return `${t}:${i}`}
function renderMedia(t,i,name){
  const m=MEDIA[mediaKey(t,i)];
  if(m&&m.type==='video'){
    const secondary=(m.secondary||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join('');
    return `<div class="mediaWrap hasVideo">
      <div class="mediaStage">
        <video class="exerciseVideo" muted loop playsinline preload="metadata" poster="${exerciseImage(t,i)}" data-src="${escapeHtml(m.src)}" aria-label="Demonstração 3D: ${escapeHtml(name)}">
          <source src="${escapeHtml(m.src)}" type="video/mp4">
        </video>
        <button class="expandVideo" type="button" data-src="${escapeHtml(m.src)}" data-title="${escapeHtml(name)}" aria-label="Ampliar vídeo de ${escapeHtml(name)}">⛶ Ampliar</button>
        <span class="mediaBadge">ANIMAÇÃO 3D</span>
      </div>
      <div class="muscles">
        <div><small>Principal</small><strong>${escapeHtml(m.primary||'—')}</strong></div>
        <div><small>Secundários</small><div class="muscleChips">${secondary||'<span>—</span>'}</div></div>
      </div>
    </div>`;
  }
  return `<div class="mediaWrap fallbackMedia">
    <div class="mediaStage"><img class="exerciseImg" src="${exerciseImage(t,i)}" alt="Ilustração: ${escapeHtml(name)}" loading="lazy"><span class="mediaBadge soft">IMAGEM DE APOIO</span></div>
  </div>`;
}
function renderWorkout(t){
  current=t;$('#historyView').classList.add('hidden');$('#workoutView').classList.remove('hidden');$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.workout===t));
  $('#workoutTag').textContent=`TREINO ${t}`;$('#workoutTitle').textContent=TITLES[t];
  const s=loadState(t),cards=$('#cards');cards.innerHTML='';
  DATA[t].forEach((e,i)=>{
    const [name,series,reps,load,rest]=e,done=!!s.done[i];
    const card=document.createElement('article');card.className='card'+(done?' done':'');
    card.innerHTML=`
      ${renderMedia(t,i,name)}
      <div class="exerciseHead"><span class="number">${i+1}</span><span class="exerciseName">${escapeHtml(name)}</span></div>
      <div class="stats">
        <div class="stat"><small>Séries</small><strong>${series}</strong></div>
        <div class="stat"><small>Repetições</small><strong>${reps}</strong></div>
        <div class="stat"><small>Carga</small><input class="loadInput" data-i="${i}" value="${escapeHtml(s.loads[i]??load)}" aria-label="Carga de ${escapeHtml(name)}"></div>
        <div class="stat"><small>Intervalo</small><strong>${rest}</strong></div>
      </div>
      <div class="checkRow"><label class="check"><input type="checkbox" data-i="${i}" ${done?'checked':''}>Concluído</label><span class="doneBadge">FEITO ✓</span></div>`;
    cards.appendChild(card);
  });
  $('#notes').value=s.notes||'';wireCards();wireMedia();updateProgress();
}
function wireCards(){
  $$('.check input').forEach(el=>el.onchange=()=>{const i=el.dataset.i,s=loadState(current);s.done[i]=el.checked;saveState(current,s);el.closest('.card').classList.toggle('done',el.checked);updateProgress()});
  $$('.loadInput').forEach(el=>el.onchange=()=>{const s=loadState(current);s.loads[el.dataset.i]=el.value.trim();saveState(current,s);showToast('Carga salva')});
}
function wireMedia(){
  if(mediaObserver)mediaObserver.disconnect();
  const vids=$$('.exerciseVideo');
  mediaObserver=new IntersectionObserver(entries=>entries.forEach(({isIntersecting,target})=>{
    if(isIntersecting){target.play().catch(()=>{});}else{target.pause();}
  }),{threshold:.55});
  vids.forEach(v=>mediaObserver.observe(v));
  $$('.expandVideo').forEach(btn=>btn.onclick=()=>openVideoModal(btn.dataset.src,btn.dataset.title));
}
function openVideoModal(src,title){
  const modal=$('#videoModal');$('#videoModalTitle').textContent=title;const v=$('#videoModalPlayer');v.src=src;modal.classList.remove('hidden');document.body.classList.add('modalOpen');v.play().catch(()=>{});
}
function closeVideoModal(){const modal=$('#videoModal'),v=$('#videoModalPlayer');v.pause();v.removeAttribute('src');v.load();modal.classList.add('hidden');document.body.classList.remove('modalOpen')}
function updateProgress(){const s=loadState(current),total=DATA[current].length,done=Object.values(s.done).filter(Boolean).length;$('#doneCount').textContent=done;$('#totalCount').textContent=total;$('#progressBar').style.width=`${total?done/total*100:0}%`}
function renderHistory(){current='history';$('#workoutView').classList.add('hidden');$('#historyView').classList.remove('hidden');$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.workout==='history'));if(mediaObserver)mediaObserver.disconnect();let h=[];try{h=JSON.parse(localStorage.getItem('treino-elias-history'))||[]}catch{};const box=$('#historyList');if(!h.length){box.innerHTML='<div class="historyItem"><div><b>Nenhum treino finalizado ainda.</b><small>Ao finalizar um treino, ele aparecerá aqui.</small></div></div>';return}box.innerHTML=h.slice().reverse().map(x=>`<div class="historyItem"><div><b>Treino ${x.workout}</b><small>${x.date} • ${x.done}/${x.total} exercícios</small></div><div><strong>${x.percent}%</strong></div></div>`).join('')}
async function init(){
  [DATA,MEDIA]=await Promise.all([fetch('data.json').then(r=>r.json()),fetch('media.json').then(r=>r.json())]);renderWorkout('A');
  $$('.tab').forEach(b=>b.onclick=()=>b.dataset.workout==='history'?renderHistory():renderWorkout(b.dataset.workout));
  $('#notes').oninput=()=>{if(current==='history')return;const s=loadState(current);s.notes=$('#notes').value;saveState(current,s)};
  $('#resetBtn').onclick=()=>{if(!confirm('Limpar as marcações de concluído deste treino?'))return;const s=loadState(current);s.done={};saveState(current,s);renderWorkout(current);showToast('Marcações limpas')};
  $('#finishBtn').onclick=()=>{const s=loadState(current),total=DATA[current].length,done=Object.values(s.done).filter(Boolean).length;let h=[];try{h=JSON.parse(localStorage.getItem('treino-elias-history'))||[]}catch{};const now=new Date();h.push({workout:current,date:now.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}),done,total,percent:Math.round(done/total*100),notes:s.notes||''});localStorage.setItem('treino-elias-history',JSON.stringify(h.slice(-100)));s.done={};saveState(current,s);renderWorkout(current);showToast('Treino registrado no histórico')};
  $('#clearHistory').onclick=()=>{if(confirm('Apagar todo o histórico de treinos deste aparelho?')){localStorage.removeItem('treino-elias-history');renderHistory();showToast('Histórico apagado')}};
  $('#videoModalClose').onclick=closeVideoModal;$('#videoModal').onclick=e=>{if(e.target.id==='videoModal')closeVideoModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeVideoModal()});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
  $('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')};
  if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
init().catch(err=>{console.error(err);document.querySelector('#cards').innerHTML='<div class="loadError">Não foi possível carregar a ficha. Atualize a página.</div>'});
