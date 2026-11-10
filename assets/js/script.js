const $ = s => document.querySelector(s);
const rooms = {
  sala:{n:'Sala',on:true,b:80,h:38}, quarto:{n:'Quarto',on:false,b:40,h:280},
  cozinha:{n:'Cozinha',on:true,b:100,h:190}, jardim:{n:'Jardim',on:false,b:60,h:140}
};
const scenes = {Cinema:{b:20,h:265},Leitura:{b:85,h:45},Relaxar:{b:35,h:20},Foco:{b:100,h:195}};
const colors = [38,20,140,190,265,320];
const modes = ['Frio','Automático','Calor'];
let cur = 'sala', temp = 22, mode = 'Automático';
const doors = [
  {n:'Porta da frente',ic:'🚪',locked:true},{n:'Garagem',ic:'🚗',locked:true},
  {n:'Porta dos fundos',ic:'🌿',locked:false},{n:'Janelas',ic:'🪟',locked:true}
];
const apps = [
  {n:'Robô de limpeza',ic:'🤖',on:false,t:'Pronto para limpar'},{n:'Cafeteira',ic:'☕',on:false,t:'Café em 2 min'},
  {n:'Geladeira',ic:'🧊',on:true,t:'3°, tudo certo'},{n:'Purificador',ic:'🍃',on:true,t:'Ar puro'}
];
const el = {orb:$('#orb'),bright:$('#bright')};
const root = document.documentElement.style;

function say(t){ $('#say').textContent = t; }

function renderRooms(){
  $('#rooms').innerHTML = Object.entries(rooms).map(([k,r]) =>
    `<button class="room ${r.on?'on':''}" style="--rh:${r.h}" data-k="${k}" aria-pressed="${k===cur}"><i></i>${r.n}</button>`).join('');
}
function renderLight(){
  const r = rooms[cur];
  root.setProperty('--h', r.h); root.setProperty('--b', r.on ? r.b/100 : 0);
  el.orb.classList.toggle('off', !r.on);
  el.bright.value = r.b; $('#brightV').textContent = r.b + '%';
  $('#roomTitle').textContent = r.n;
  $('#roomState').textContent = r.on ? `Luz ligada em ${r.b}%` : 'Luz desligada';
  document.querySelectorAll('.sw').forEach(s => s.setAttribute('aria-pressed', +s.dataset.c === r.h));
  renderRooms();
}
function renderClimate(){
  const p = (temp-16)/14;
  $('#fill').style.strokeDashoffset = 377 - 377*p;
  $('#fill').style.strokeDasharray = '377 503';
  $('#fill').style.setProperty('--tc', `hsl(${210 - p*190} 90% 66%)`);
  $('#temp').textContent = temp + '°'; $('#mode').textContent = mode;
  document.querySelectorAll('#modes .chip').forEach(c => c.setAttribute('aria-pressed', c.textContent === mode));
}
function renderDoors(){
  $('#doors').innerHTML = doors.map((d,i) =>
    `<button class="tile ${d.locked?'ok':'bad'}" data-i="${i}"><span class="ic">${d.ic}</span><b>${d.n}</b><span class="st">${d.locked?'Trancada':'Destrancada'}</span></button>`).join('');
}
function renderApps(){
  $('#apps').innerHTML = apps.map((a,i) =>
    `<button class="tile ${a.on?'act':''}" data-i="${i}"><span class="ic">${a.ic}</span><b>${a.n}</b><span class="st">${a.on?(a.n==='Robô de limpeza'?'Limpando…':a.n==='Cafeteira'?'Preparando…':a.t):'Desligado'}</span></button>`).join('');
}

/* eventos */
$('#rooms').onclick = e => { const b = e.target.closest('.room'); if(b){ cur = b.dataset.k; renderLight(); } };
el.orb.onclick = () => { const r = rooms[cur]; r.on = !r.on; renderLight(); say(`${r.n}: luz ${r.on?'ligada':'desligada'}.`); };
el.bright.oninput = () => { const r = rooms[cur]; r.b = +el.bright.value; r.on = true; renderLight(); };
$('#swatches').innerHTML = colors.map(c => `<button class="sw" style="--c:${c}" data-c="${c}" aria-label="Cor ${c}"></button>`).join('');
$('#swatches').onclick = e => { const s = e.target.closest('.sw'); if(s){ const r = rooms[cur]; r.h = +s.dataset.c; r.on = true; renderLight(); } };
$('#scenes').innerHTML = Object.keys(scenes).map(k => `<button class="chip">${k}</button>`).join('');
$('#scenes').onclick = e => { const c = e.target.closest('.chip'); if(c){ Object.assign(rooms[cur], scenes[c.textContent], {on:true}); renderLight(); say(`Cena ${c.textContent} ativada em ${rooms[cur].n}.`); } };
$('#modes').innerHTML = modes.map(m => `<button class="chip">${m}</button>`).join('');
$('#modes').onclick = e => { const c = e.target.closest('.chip'); if(c){ mode = c.textContent; if(mode==='Frio') temp = 18; if(mode==='Calor') temp = 26; if(mode==='Automático') temp = 22; renderClimate(); say(`Modo ${mode.toLowerCase()}: ${temp}°.`); } };
$('#plus').onclick = () => { temp = Math.min(30, temp+1); renderClimate(); };
$('#minus').onclick = () => { temp = Math.max(16, temp-1); renderClimate(); };
$('#doors').onclick = e => { const t = e.target.closest('.tile'); if(t){ const d = doors[t.dataset.i]; d.locked = !d.locked; renderDoors(); say(`${d.n}: ${d.locked?'trancada':'destrancada'}.`); } };
$('#apps').onclick = e => { const t = e.target.closest('.tile'); if(t){ const a = apps[t.dataset.i]; a.on = !a.on; renderApps(); say(`${a.n}: ${a.on?'ligado':'desligado'}.`); } };

/* assistente por texto */
$('#cmd').onsubmit = e => {
  e.preventDefault();
  const t = $('#cmdIn').value.toLowerCase(); $('#cmdIn').value = '';
  const num = t.match(/\d{2}/);
  if(/apag|desligar tudo/.test(t)){ Object.values(rooms).forEach(r => r.on = false); renderLight(); say('Todas as luzes foram apagadas.'); }
  else if(/acend|ligar luz/.test(t)){ rooms[cur].on = true; renderLight(); say(`Luz da ${rooms[cur].n.toLowerCase()} acesa.`); }
  else if(/trancar|trave/.test(t)){ doors.forEach(d => d.locked = true); renderDoors(); say('Tudo trancado. Casa segura.'); }
  else if(/destranc/.test(t)){ doors.forEach(d => d.locked = false); renderDoors(); say('Portas destrancadas.'); }
  else if(num){ temp = Math.min(30, Math.max(16, +num[0])); mode = 'Automático'; renderClimate(); say(`Temperatura ajustada para ${temp}°.`); }
  else if(/cinema|leitura|relaxar|foco/.test(t)){ const k = Object.keys(scenes).find(s => t.includes(s.toLowerCase())); Object.assign(rooms[cur], scenes[k], {on:true}); renderLight(); say(`Cena ${k} ativada.`); }
  else say('Ainda não entendi. Tente “apagar tudo”, “trancar portas”, “cinema” ou “temperatura 24”.');
};

function tick(){
  const d = new Date(), h = d.getHours();
  $('#clock').innerHTML = d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) +
    '<small>' + d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}) + '</small>';
  $('#hello').textContent = (h<12?'Bom dia':h<18?'Boa tarde':'Boa noite') + '! Sua casa está em equilíbrio.';
}
tick(); setInterval(tick, 30000);
renderLight(); renderClimate(); renderDoors(); renderApps();
