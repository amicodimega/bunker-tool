function villageWeightColor(weight){
  const band=Math.floor(Math.max(0,Number(weight)||0)/10000);
  const palette=['#12a8bd','#2563eb','#6444dc','#a832b5','#dc327c','#ec7610','#9a6613','#3b934c','#147b74','#334e85','#713c55'];
  return palette[band] || `hsl(${(band*137.508)%360} 72% 38%)`;
}

function createVillageMap(existingMode = false) {
  const canvas = document.getElementById(existingMode ? 'existingVillageMap' : 'villageMap');
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById(existingMode ? 'existingMapTooltip' : 'mapTooltip');
  const status = document.getElementById(existingMode ? 'existingMapStatus' : 'mapStatus');
  const selectedSenders = new Set();
  function refreshSelection(){
    if(existingMode) return;
    const valid=new Set(friendlyRows.map(row=>row.coord));
    for(const coord of selectedSenders) if(!valid.has(coord)) selectedSenders.delete(coord);
    const active=friendlyRows.filter(row=>selectedSenders.has(row.coord)&&row.enabled).length;
    document.getElementById("mapSenderSelection").hidden=!selectedSenders.size;
    const text=document.getElementById("mapSenderSelectionText");
    text.textContent=`${selectedSenders.size} mittenti selezionati · ${active} attivi`;
    text.title=[...selectedSenders].join(", ");
    document.getElementById("mapDisableSender").disabled=active===0;
  }
  const colors = {enemy:'#c63535',friendly:'#9ca3af',used:'#245da7',bunker:'#e5b600'};
  let width=0, height=0, scale=1, center={x:500,y:500}, points=[], hover=null, drag=null, initialized=false, maxWeight=1;
  const num = n => Number(n || 0).toLocaleString('it-IT');
  const screen = p => ({x:width/2+(p.x-center.x)*scale,y:height/2+(p.y-center.y)*scale});
  const world = p => ({x:center.x+(p.x-width/2)/scale,y:center.y+(p.y-height/2)/scale});
  function units(commands) {
    return commands.reduce((sum,c)=>{for(const u of ['spear','sword','archer','heavy'])sum[u]+=c.send[u];return sum;},{spear:0,sword:0,archer:0,heavy:0});
  }
  function troops(t){return `Lance: ${num(t.spear)}\nSpade: ${num(t.sword)}\nArcieri: ${num(t.archer)}\nCavalleria pesante: ${num(t.heavy)}`;}
  function details(p){
    if(existingMode){
      const parts=[p.coord];
      if(p.enemy) parts.push(p.excludedEnemy ? 'Nemico escluso: non influisce sui calcoli' : 'Villaggio nemico');
      if(p.friends.length) parts.push(`${p.friends[0].player || "Player non indicato"}`);
      if(p.existing) parts.push(`Supporti presenti\n${troops(p.existing.surplus)}\nPeso supporti: ${num(p.existing.surplusWeight)}`, `Difese totali presenti\n${troops(p.existing)}\nPeso difese totali: ${num(p.existing.weight)}`);
      return parts.join('\n\n');
    }
    const parts=[p.coord];
    if(p.enemy)parts.push(p.excludedEnemy ? 'Nemico escluso: non influisce sui calcoli' : 'Villaggio nemico');
    if(p.friends.length){
      for(const f of p.friends)parts.push(`${f.player || 'Player non indicato'}${f.enabled?'':' (disattivato)'}\n${f.estimated ? "Truppe disponibili" : "Truppe proprie importate"}\n${troops(f.estimated ? getSendableSource(f) : f)}\n${f.estimated ? "Peso disponibile" : "Peso truppe proprie"}: ${num(f.estimated ? getSendableSource(f).weight : f.weight)}`);
      const outgoing=mapCommands.filter(c=>c.sourceCoord===p.coord);
      if(outgoing.length){const t=units(outgoing);parts.push(`Supporti assegnati in uscita\n${troops(t)}\nBunker: ${[...new Set(outgoing.map(c=>c.bunkerCoord))].join(', ')}`);}
    }
    if(p.bunker){
      const b=p.bunker;parts.push(`Bunker${b.enabled?'':' (disattivato)'}\nPeso richiesto: ${num(b.target)}\nArrivo: ${b.arrival.replace('T',' ') || 'Non impostato'}`);
      if(mapPlanReady){const incoming=mapCommands.filter(c=>c.bunkerCoord===p.coord);parts.push(`Supporti assegnati in arrivo\n${troops(units(incoming))}\nPeso conteggiato: ${num(incoming.reduce((n,c)=>n+c.sentWeight,0))}`);}
      else parts.push('Supporti assegnati: premi Calcola');
      
    }
    return parts.join('\n\n');
  }
  function rebuild(){
    refreshSelection();
    const entries=new Map();
    function add(coord){if(!entries.has(coord)){const p=parseCoords(coord)[0];if(!p)return null;entries.set(coord,{...p,friends:[],enemy:false,bunker:null});}return entries.get(coord);}
    for(const e of parseCoords(STATIC_ENEMY_VILLAGES.join('\n'))){const p=add(e.coord);p.enemy=true;p.excludedEnemy=EXCLUDED_ENEMY_VILLAGES.has(e.coord);}
    const friendByCoord = new Map();
    if(importedTroops) for(const f of parseTroops(importedTroops, true)) friendByCoord.set(f.coord, {...f, estimated: false});
    for(const f of friendlyRows) friendByCoord.set(f.coord, {...f, estimated: true});
    for(const f of friendByCoord.values()) add(f.coord).friends.push(f);
    const allExisting = getExistingBunkers();
    const existing = allExisting.filter(row => !hiddenExistingBunkers.has(row.coord));
    if(existingMode) for(const row of existing) add(row.coord).existing = row;
    if(!existingMode) for(const b of bunkerRows)add(b.coord).bunker=b;
    if(existingMode) for(const coord of hiddenExistingBunkers) entries.delete(coord);
    const used=new Set(mapCommands.map(c=>c.sourceCoord));
    const weights = new Map();
    if(!existingMode) for(const command of mapCommands) weights.set(command.sourceCoord, (weights.get(command.sourceCoord) || 0) + command.actualWeight);
    points=[...entries.values()].map(p=>({...p,used:existingMode?!!p.existing:used.has(p.coord), displayWeight:existingMode?(p.existing?.surplusWeight || 0):(weights.get(p.coord) || 0)}));
    const legend=document.getElementById(existingMode?'existingWeightLegend':'villageWeightLegend');
    if(legend){
      legend.replaceChildren();
      const bands=[...new Set(points.filter(p=>p.used).map(p=>Math.floor(p.displayWeight/10000)))].sort((a,b)=>a-b);
      for(const band of bands){
        const item=document.createElement('span'), swatch=document.createElement('i');
        swatch.style.background=villageWeightColor(band*10000);swatch.setAttribute('aria-hidden','true');
        item.append(swatch,document.createTextNode(`${(band*10000).toLocaleString('it-IT')}–${((band+1)*10000-1).toLocaleString('it-IT')}`));legend.append(item);
      }
    }
    hover=null;tooltip.hidden=true;
    status.textContent=existingMode ? `${existing.length} bunker esistenti · ${friendByCoord.size} villaggi amici` : `${points.filter(p=>p.enemy && !p.excludedEnemy).length} nemici considerati · ${points.filter(p=>p.excludedEnemy).length} esclusi · ${friendlyRows.length} amici caricati · ${used.size} mittenti utilizzati · ${bunkerRows.length} bunker${mapPlanReady?' · Piano calcolato':' · Nessuna assegnazione calcolata'}`;
    if(!initialized && width>100 && height>100){fit();initialized=true;}else draw();
  }
  function fit(){
    if(!points.length || width<=100 || height<=100)return;
    const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    center={x:(minX+maxX)/2,y:(minY+maxY)/2};
    scale=Math.min((width-100)/Math.max(maxX-minX,10),(height-100)/Math.max(maxY-minY,10));draw();
  }
  function draw(){
    if(width<=100 || height<=100)return;
    ctx.clearRect(0,0,width,height);
    const a=world({x:48,y:15}),b=world({x:width-18,y:height-30});
    const raw=65/scale,base=10**Math.floor(Math.log10(raw));
    const step=[1,2,5,10].map(n=>n*base).find(n=>n>=raw);
    ctx.font='11px system-ui';ctx.lineWidth=1;
    for(let x=Math.ceil(a.x/step)*step;x<=b.x;x+=step){const sx=screen({x,y:0}).x;ctx.strokeStyle='#e0e7ee';ctx.beginPath();ctx.moveTo(sx,15);ctx.lineTo(sx,height-30);ctx.stroke();ctx.fillStyle='#5b6a79';ctx.fillText(String(Math.round(x*100)/100),sx-9,height-10);}
    for(let y=Math.ceil(a.y/step)*step;y<=b.y;y+=step){const sy=screen({x:0,y}).y;ctx.strokeStyle='#e0e7ee';ctx.beginPath();ctx.moveTo(48,sy);ctx.lineTo(width-18,sy);ctx.stroke();ctx.fillStyle='#5b6a79';ctx.fillText(String(Math.round(y*100)/100),5,sy+4);}
    ctx.fillText('X',width-13,height-10);ctx.fillText('Y',8,13);
    ctx.save();ctx.beginPath();ctx.rect(48,15,width-66,height-45);ctx.clip();
    if(!existingMode && document.getElementById('mapLinks').checked){
      for(const c of mapCommands){
        const from=parseCoords(c.sourceCoord)[0],to=parseCoords(c.bunkerCoord)[0];
        const highlighted=hover && (hover.coord===from.coord||hover.coord===to.coord);
        const p=screen(from),q=screen(to);ctx.strokeStyle=highlighted?'#245da7':'#245da735';ctx.lineWidth=highlighted?2:0.8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
    }
    // Bunkers are drawn last so their outlines stay visible over other categories.
    for(const p of [...points].sort((a,b)=>(existingMode && a.used ? 2 : Number(!!a.bunker || a.used))-(existingMode && b.used ? 2 : Number(!!b.bunker || b.used)))){
      if(!visiblePoint(p)) continue;
      const q=screen(p),r=existingMode?(p.used?4:1.8):2.5;
      const active=p.bunker?p.bunker.enabled:p.friends.length?p.friends.some(f=>f.enabled):true;
      const color=p.used?villageWeightColor(p.displayWeight):p.friends.length?colors.friendly:p.bunker?colors.bunker:p.excludedEnemy?'#94a3b8':colors.enemy;
      ctx.globalAlpha=existingMode&&!p.used?(p.enemy&&!p.friends.length?0.35:0.6):(active?1:0.4);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();
      if(p.used && existingMode){
        ctx.globalAlpha=1;
        ctx.fillStyle='#ffffff';ctx.fillRect(q.x-5.3,q.y-5.3,10.6,10.6);
        ctx.fillStyle=color;ctx.fillRect(q.x-3.8,q.y-3.8,7.6,7.6);
        ctx.strokeStyle='#17283c';ctx.lineWidth=0.6;ctx.strokeRect(q.x-3.8,q.y-3.8,7.6,7.6);
      }else if(p.used && !existingMode){
        for(let i=0;i<10;i++){
          const angle=-Math.PI/2+i*Math.PI/5, radius=i%2?2.2:5;
          const x=q.x+Math.cos(angle)*radius,y=q.y+Math.sin(angle)*radius;
          if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=0.8;ctx.stroke();
      }else{ctx.arc(q.x,q.y,r,0,Math.PI*2);if(active && !(p.excludedEnemy && !p.friends.length))ctx.fill();else ctx.stroke();}
      if(p.bunker){ctx.strokeStyle=colors.bunker;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(q.x,q.y-r);ctx.lineTo(q.x+r,q.y);ctx.lineTo(q.x,q.y+r);ctx.lineTo(q.x-r,q.y);ctx.closePath();ctx.stroke();}
      ctx.globalAlpha=1;
    }
    if(!existingMode){
      for(const p of points){
        if(!selectedSenders.has(p.coord)) continue;
        const q=screen(p);
        ctx.globalAlpha=1;ctx.beginPath();ctx.arc(q.x,q.y,8,0,Math.PI*2);
        ctx.strokeStyle='#ffffff';ctx.lineWidth=5;ctx.stroke();
        ctx.strokeStyle='#d29b00';ctx.lineWidth=2.5;ctx.stroke();
      }
    }
    ctx.restore();
  }
  function visiblePoint(p){
    return !existingMode || document.getElementById("existingMapEnemies").checked || !p.enemy || p.used || p.friends.length>0 || !!p.bunker;
  }
  function local(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function inspect(pos){
    let nearest=null,best=11;
    for(const p of points){
      if(!visiblePoint(p)) continue;
      const q=screen(p),d=Math.hypot(pos.x-q.x,pos.y-q.y);
      const priority=existingMode&&p.used&&d<=6;
      if(priority && !(nearest?.used && best<=6) || d<best && !(existingMode&&nearest?.used&&best<=6&&!p.used)){nearest=p;best=d;}
    }
    hover=nearest;tooltip.hidden=!nearest;
    if(nearest){tooltip.textContent=details(nearest);tooltip.style.left=`${Math.max(0,Math.min(pos.x+14,width-tooltip.offsetWidth-8))}px`;tooltip.style.top=`${Math.max(0,Math.min(pos.y+14,height-tooltip.offsetHeight-8))}px`;}
    draw();
  }
  canvas.addEventListener('pointerdown',e=>{drag={pos:local(e),center:{...center},moved:false};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{const pos=local(e);if(drag){const dx=pos.x-drag.pos.x,dy=pos.y-drag.pos.y;if(Math.hypot(dx,dy)>3)drag.moved=true;center={x:drag.center.x-dx/scale,y:drag.center.y-dy/scale};hover=null;tooltip.hidden=true;draw();}else inspect(pos);});
  canvas.addEventListener('pointerup',e=>{
    const tap=drag&&!drag.moved;drag=null;
    if(tap){
      inspect(local(e));
      if(!existingMode){
        const row=hover && friendlyRows.find(row=>row.coord===hover.coord);
        if(row){
          if(selectedSenders.has(row.coord)) selectedSenders.delete(row.coord);
          else selectedSenders.add(row.coord);
          refreshSelection();draw();
        }
      }
    }
  });
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('pointerleave',()=>{if(!drag){hover=null;tooltip.hidden=true;draw();}});
  canvas.addEventListener('wheel',e=>{e.preventDefault();const pos=local(e),before=world(pos);scale=Math.max(0.1,Math.min(100,scale*Math.exp(-e.deltaY*0.0015)));center={x:before.x-(pos.x-width/2)/scale,y:before.y-(pos.y-height/2)/scale};hover=null;tooltip.hidden=true;draw();},{passive:false});
  canvas.addEventListener('keydown',e=>{if(e.key==='Home'){fit();e.preventDefault();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){center.x+=(e.key==='ArrowLeft'?-40:e.key==='ArrowRight'?40:0)/scale;center.y+=(e.key==='ArrowUp'?-40:e.key==='ArrowDown'?40:0)/scale;draw();e.preventDefault();}});
  document.getElementById(existingMode ? 'existingMapFit' : 'mapFit').addEventListener('click',fit);
  if(existingMode) document.getElementById('existingMapEnemies').addEventListener('change',()=>{hover=null;tooltip.hidden=true;draw();});
  if(!existingMode){
    document.getElementById('mapLinks').addEventListener('change',draw);
    document.getElementById('mapDisableSender').addEventListener('click',()=>{
      for(const row of friendlyRows) if(selectedSenders.has(row.coord)) row.enabled=false;
      invalidateFriendlyPlan();refreshSelection();draw();
    });
    document.getElementById('mapClearSelection').addEventListener('click',()=>{
      selectedSenders.clear();refreshSelection();draw();
    });
  }
  new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const ratio=window.devicePixelRatio||1;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);if(!initialized){rebuild();}else draw();}).observe(canvas);
  rebuild();
  return rebuild;
}
const refreshPlannerMap = createVillageMap();
const refreshExistingBunkerMap = createVillageMap(true);
window.refreshVillageMap = () => {
  updateConfirmationState();
  renderExistingBunkers();
  refreshPlannerMap();
  refreshExistingBunkerMap();
};
window.refreshVillageMap();
