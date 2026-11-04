function summarizePlayerAvailability(rows, commands){
  const units=['spear','sword','archer','heavy','knight'];
  const empty=()=>({spear:0,sword:0,archer:0,heavy:0,knight:0});
  const sentBySource=new Map(), players=new Map();
  for(const command of commands){
    if(!sentBySource.has(command.sourceCoord)) sentBySource.set(command.sourceCoord,empty());
    const sent=sentBySource.get(command.sourceCoord);
    for(const unit of units) sent[unit]+=command.send[unit] || 0;
  }
  for(const row of rows){
    const player=row.player || 'Player sconosciuto';
    if(!players.has(player)) players.set(player,{player,villages:0,planned:empty(),remaining:empty()});
    const result=players.get(player),sent=sentBySource.get(row.coord) || empty();
    result.villages++;
    for(const unit of units){
      result.planned[unit]+=sent[unit];
      result.remaining[unit]+=Math.max(0,(row[unit] || 0)-sent[unit]);
    }
  }
  return [...players.values()].sort((a,b)=>a.player.localeCompare(b.player));
}

(() => {
  const el=id=>document.getElementById(id);
  const num=n=>Number(n || 0).toLocaleString('it-IT');
  const empty=()=>({spear:0,sword:0,archer:0,heavy:0,knight:0});
  function weightCell(units){
    const td=document.createElement('td'),weight=document.createElement('strong'),detail=document.createElement('span');
    weight.textContent=num(availableWeight(units));
    detail.className='unitBreakdown';
    detail.textContent=`${num(units.spear)} lance · ${num(units.sword)} spade · ${num(units.archer)} arcieri · ${num(units.heavy)} pesanti${units.knight ? ` · ${num(units.knight)} paladini` : ''}`;
    td.append(weight,detail);return td;
  }
  function renderTable(container, rows, planned){
    container.replaceChildren();
    const table=document.createElement('table');table.className='bunkerTable';
    const head=document.createElement('thead'),hr=document.createElement('tr');
    for(const text of ['Player',...(planned?['Difesa prevista']:[]),'Difesa residua']){const th=document.createElement('th');th.textContent=text;hr.append(th);}
    head.append(hr);table.append(head);
    const body=document.createElement('tbody'),sum={planned:empty(),remaining:empty()};
    for(const row of rows){
      const tr=document.createElement('tr'),name=document.createElement('td');name.textContent=row.player;
      name.title=`${row.villages} villaggi`;tr.append(name);
      if(planned) tr.append(weightCell(row.planned));tr.append(weightCell(row.remaining));body.append(tr);
      for(const group of ['planned','remaining']) for(const unit of Object.keys(sum[group])) sum[group][unit]+=row[group][unit];
    }
    if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=planned?3:2;td.textContent='Nessun villaggio.';tr.append(td);body.append(tr);}
    table.append(body);
    const foot=document.createElement('tfoot'),tr=document.createElement('tr'),td=document.createElement('td');td.textContent='Totale';tr.append(td);
    if(planned)tr.append(weightCell(sum.planned));tr.append(weightCell(sum.remaining));foot.append(tr);table.append(foot);container.append(table);
  }
  function refresh(){
    if(el('playerTotalsSection').hidden) return;
    const planned=mapPlanReady;
    const commands=planned?mapCommands:[];
    const active=getActiveFriendlySources();
    const all=friendlyRows.map(getSendableSource);
    renderTable(el('activePlayerTotals'),summarizePlayerAvailability(active,commands),planned);
    renderTable(el('allPlayerTotals'),summarizePlayerAvailability(all,commands),planned);
    el('playerTotalsStatus').textContent=planned
      ? 'Pesi e unità previsti dal piano. Il residuo sottrae anche questi invii. I mittenti attivati rispettano le regole correnti.'
      : 'Disponibilità residue dopo convalide e riserve. Calcola il piano per vedere anche gli invii previsti.';
  }
  window.refreshPlayerTotals=refresh;
  el('togglePlayerTotals').addEventListener('click',()=>{
    const open=el('playerTotalsSection').hidden;
    el('playerTotalsSection').hidden=!open;
    el('togglePlayerTotals').setAttribute('aria-expanded',String(open));
    if(open)refresh();
  });
})();
