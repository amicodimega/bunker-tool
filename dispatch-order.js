function buildDispatchOrder(sources, target, settings){
  const units = ['spear','sword','heavy','knight'];
  const byPlayer = new Map();
  for(const source of sources){
    if(source.coord === target.coord) continue;
    const departures = {};
    for(const unit of units){
      if(!(source[unit] > 0)) continue;
      const seconds = travelSeconds(source,target,unit,settings.worldSpeed,settings.unitSpeed,target.supportSlowdown);
      departures[unit] = addSeconds(target.arrival, -seconds);
    }
    if(!Object.keys(departures).length) continue;
    const player = source.player || 'Player sconosciuto';
    if(!byPlayer.has(player)) byPlayer.set(player,{player,departures:{},origins:{},villages:new Set()});
    const row = byPlayer.get(player); row.villages.add(source.coord);
    for(const [unit,time] of Object.entries(departures)){
      if(!row.departures[unit] || time < row.departures[unit]){
        row.departures[unit] = time; row.origins[unit] = source.coord;
      }
    }
  }
  const first = row => Math.min(...Object.values(row.departures).map(d=>d.getTime()));
  return [...byPlayer.values()].sort((a,b)=>first(a)-first(b) || a.player.localeCompare(b.player));
}

(() => {
  const el = id => document.getElementById(id);
  const units = ['spear','sword','heavy','knight'];
  const labels = {spear:'Lance',sword:'Spade',heavy:'Pesanti',knight:'Paladino'};
  const minuteTime = date => formatDateTime(date).slice(0,16);
  let copyText = '', signature = '';
  function currentSignature(){return JSON.stringify([getSettings(),el('dispatchTarget').value,el('dispatchArrival').value]);}
  function clear(){
    copyText = ''; signature = '';
    el('dispatchOrderBody').replaceChildren(); el('dispatchOrderStatus').textContent = '';
    el('copyDispatchOrder').disabled = true; el('dispatchOrderError').hidden = true;
  }
  window.clearDispatchOrder = clear;
  el('toggleDispatchOrder').addEventListener('click', () => {
    const open = el('dispatchOrderSection').hidden;
    el('dispatchOrderSection').hidden = !open;
    el('toggleDispatchOrder').setAttribute('aria-expanded', String(open));
    if(open && !el('dispatchArrival').value) el('dispatchArrival').value = els.defaultBunkerArrival.value;
    if(open) el('dispatchTarget').focus();
  });
  el('calculateDispatchOrder').addEventListener('click', () => {
    clear();
    try{
      const coords = parseCoords(el('dispatchTarget').value);
      if(coords.length !== 1) throw new Error('Inserisci una sola coordinata destinataria.');
      const arrival = parseDateTime(el('dispatchArrival').value);
      if(!arrival) throw new Error('Inserisci data e ora di arrivo.');
      const settings = getSettings();
      if(!(settings.worldSpeed > 0) || !(settings.unitSpeed > 0)) throw new Error('Controlla le impostazioni mondo.');
      const bunker = bunkerRows.find(row=>row.coord===coords[0].coord);
      const supportSlowdown = Number(bunker?.supportSlowdown || 0);
      if(!Number.isFinite(supportSlowdown) || supportSlowdown < 0 || supportSlowdown >= 100) throw new Error('Controlla la riduzione velocità del bunker.');
      const target = {...coords[0],arrival,supportSlowdown};
      const rows = buildDispatchOrder(getActiveFriendlySources(), target, settings);
      if(!rows.length) throw new Error('Nessun mittente attivo con lance, spade, pesanti o paladino disponibili.');
      const now = getItalyNow(), lines = [`Destinatario: ${target.coord}`,`Arrivo: ${minuteTime(arrival)}`,''];
      for(const row of rows){
        const tr = document.createElement('tr'), player = document.createElement('td');
        player.textContent = row.player; tr.append(player); lines.push(row.player);
        for(const unit of units){
          const td = document.createElement('td'), time = row.departures[unit];
          td.textContent = time ? minuteTime(time) : '–';
          if(time){
            td.title = `Primo villaggio: ${row.origins[unit]}`;
            if(time <= now){td.classList.add('expiredDeparture');td.title += ' · Orario trascorso';}
            lines.push(`${labels[unit]}: entro ${minuteTime(time)} (${row.origins[unit]})`);
          }
          tr.append(td);
        }
        el('dispatchOrderBody').append(tr); lines.push('');
      }
      el('dispatchOrderStatus').textContent = `${rows.length} player · Destinatario ${target.coord}${supportSlowdown ? ` · Riduzione tempo supporti ${supportSlowdown}%` : ''}. Gli orari trascorsi sono in rosso.`;
      copyText = lines.join('\n'); signature = currentSignature(); el('copyDispatchOrder').disabled = false;
    }catch(err){el('dispatchOrderError').textContent = err.message;el('dispatchOrderError').hidden = false;}
  });
  el('copyDispatchOrder').addEventListener('click', async () => {
    if(signature !== currentSignature()){clear();return;}
    await writeClipboard(copyText);
  });
  for(const event of ['input','change']) document.addEventListener(event, () => {
    if(signature && signature !== currentSignature()) clear();
  });
})();
