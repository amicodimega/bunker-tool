function parseReplacementSupports(text, roundingStep){
  const commands = [];
  const arrivals = new Map();
  let current = null, header = '';
  for(const raw of String(text || '').split(/\r?\n/)){
    const line = raw.replace(/\[[^\]]*\]/g,' ').trim();
    const bunker = line.match(/^BUNKER\s+(\d{1,3}\|\d{1,3})\b/i);
    if(bunker){header=parseCoords(bunker[1])[0].coord; current=null; continue;}
    const arrival = line.match(/^Arrivo:\s*(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?)/i);
    if(arrival && header){arrivals.set(header,arrival[1]);continue;}
    const pair = line.match(/\b(\d{1,3}\|\d{1,3})\s*(?:->|→)\s*(\d{1,3}\|\d{1,3})\b/);
    if(pair){
      current={source:parseCoords(pair[1])[0].coord,target:parseCoords(pair[2])[0].coord,send:{spear:0,sword:0,archer:0,heavy:0},arrival:''};
      commands.push(current);continue;
    }
    if(!current) continue;
    const amount = line.match(/^([\d][\d\s.,\u00a0\u202f]*)\s+(.+)$/);
    if(!amount) continue;
    const unitTag = raw.match(/\[unit\](spear|sword|archer|heavy|knight)\[\/unit\]/i);
    const name = amount[2].trim().toLowerCase();
    const unit = unitTag?.[1].toLowerCase() || (/^(?:lance|lancieri|spear)\b/.test(name)?'spear':/^(?:spade|spadaccini|sword)\b/.test(name)?'sword':/^(?:arcieri|archer)\b/.test(name)?'archer':/^(?:oni|pesanti|heavy|cavalleri[ae] pesant[ei])\b/.test(name)?'heavy':null);
    if(!unit || unit==='knight') continue;
    const count=toInt(amount[1]);
    if(!Number.isInteger(count) || count<0) throw new Error('Quantità di unità non valida.');
    current.send[unit]+=count;
  }
  const groups = new Map();
  for(const command of commands){
    const actual=sendWeight(command.send);if(actual<=0) continue;
    if(!groups.has(command.target)) groups.set(command.target,{coord:command.target,spear:0,sword:0,archer:0,heavy:0,weight:0,actualWeight:0,count:0,senders:new Set(),arrival:arrivals.get(command.target)||''});
    const row=groups.get(command.target);
    for(const unit of ['spear','sword','archer','heavy']) row[unit]+=command.send[unit];
    row.actualWeight+=actual;row.weight+=effectiveWeight(actual,roundingStep);row.count++;row.senders.add(command.source);
  }
  return [...groups.values()];
}

function applyReplacementTargets(rows, mode, disableSenders){
  for(const row of rows){
    let bunker=bunkerRows.find(item=>item.coord===row.coord);
    if(!bunker){bunker={id:crypto.randomUUID(),coord:row.coord,enabled:true,target:'0',arrival:'',supportSlowdown:''};bunkerRows.push(bunker);}
    bunker.target=String(row.weight+(mode==='add'?Math.max(0,Number(bunker.target)||0):0));
    bunker.arrival=row.arrival;bunker.enabled=true;
  }
  if(disableSenders){
    const senders=new Set(rows.flatMap(row=>[...row.senders]));
    for(const row of friendlyRows) if(senders.has(row.coord)) row.enabled=false;
  }
  renderBunkerTable();invalidateFriendlyPlan();
}

(() => {
  const el=id=>document.getElementById(id);
  let parsed=[], step=0;
  function error(message){el('replacementError').textContent=message;el('replacementError').hidden=false;}
  el('toggleReplacement').addEventListener('click',()=>{
    const open=el('replacementSection').hidden;el('replacementSection').hidden=!open;
    el('toggleReplacement').setAttribute('aria-expanded',String(open));
  });
  el('replacementText').addEventListener('input',()=>{parsed=[];el('replacementPreview').hidden=true;el('replacementStatus').textContent='';el('replacementError').hidden=true;});
  el('readReplacement').addEventListener('click',()=>{
    parsed=[];el('replacementPreview').hidden=true;el('replacementError').hidden=true;el('replacementStatus').textContent='';el('replacementBody').replaceChildren();
    try{
      step=Number(els.roundingStep.value);
      if(!Number.isInteger(step)||step<0||step>1000) throw new Error('Controlla la soglia di arrotondamento nelle Regole.');
      parsed=parseReplacementSupports(el('replacementText').value,step);
      if(!parsed.length) throw new Error('Non ho trovato comandi con mittente, destinatario e quantità delle truppe.');
      for(const row of parsed){
        const tr=document.createElement('tr');tr.dataset.coord=row.coord;
        for(const value of [row.coord,row.spear,row.sword,row.archer,row.heavy]){const td=document.createElement('td');td.textContent=typeof value==='number'?value.toLocaleString('it-IT'):value;tr.append(td);}
        const weightCell=document.createElement('td'),weight=document.createElement('input');weight.className='input';weight.type='number';weight.min='1';weight.step='1';weight.value=row.weight;weight.dataset.replacementField='weight';weight.setAttribute('aria-label',`Peso da riassegnare a ${row.coord}`);weightCell.append(weight);tr.append(weightCell);
        const arrivalCell=document.createElement('td'),arrival=document.createElement('input');arrival.className='input';arrival.type='datetime-local';arrival.step='1';arrival.value=(row.arrival||bunkerRows.find(b=>b.coord===row.coord)?.arrival||els.defaultBunkerArrival.value||'').replace(' ','T');arrival.dataset.replacementField='arrival';arrival.setAttribute('aria-label',`Arrivo a ${row.coord}`);arrivalCell.append(arrival);tr.append(arrivalCell);
        el('replacementBody').append(tr);
      }
      el('replacementStatus').textContent=`${parsed.reduce((n,row)=>n+row.count,0)} invii riconosciuti verso ${parsed.length} bunker. Controlla pesi e arrivi.`;
      el('replacementPreview').hidden=false;el('applyReplacement').disabled=false;
    }catch(err){error(err.message);}
  });
  el('applyReplacement').addEventListener('click',()=>{
    try{
      if(!parsed.length || el('applyReplacement').disabled) return;
      if(Number(els.roundingStep.value)!==step) throw new Error('La soglia di arrotondamento è cambiata. Premi di nuovo Leggi comandi.');
      const rows=parsed.map((row,i)=>{
        const tr=el('replacementBody').children[i];
        const weight=Number(tr.querySelector('[data-replacement-field="weight"]').value);
        const arrival=tr.querySelector('[data-replacement-field="arrival"]').value;
        if(!Number.isInteger(weight)||weight<=0) throw new Error(`Inserisci un peso positivo per ${row.coord}.`);
        if(!parseDateTime(arrival)) throw new Error(`Inserisci un arrivo valido per ${row.coord}.`);
        return {...row,weight,arrival};
      });
      applyReplacementTargets(rows,el('replacementMode').value,el('replacementDisableSenders').checked);
      el('applyReplacement').disabled=true;el('replacementError').hidden=true;
      el('replacementStatus').textContent=`Preparati ${rows.length} bunker, ${rows.reduce((n,row)=>n+row.weight,0).toLocaleString('it-IT')} di peso da riassegnare. Premi Calcola nel Piano.`;
    }catch(err){error(err.message);}
  });
})();
