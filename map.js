(() => {
  const canvas = document.getElementById('villageMap');
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('mapTooltip');
  const status = document.getElementById('mapStatus');
  const colors = {enemy:'#c63535',friendly:'#246bb2',used:'#188453',bunker:'#e5b600'};
  let width=0, height=0, scale=1, center={x:500,y:500}, points=[], hover=null, drag=null, initialized=false;
  const num = n => Number(n || 0).toLocaleString('it-IT');
  const screen = p => ({x:width/2+(p.x-center.x)*scale,y:height/2+(p.y-center.y)*scale});
  const world = p => ({x:center.x+(p.x-width/2)/scale,y:center.y+(p.y-height/2)/scale});
  function units(commands) {
    return commands.reduce((sum,c)=>{for(const u of ['spear','sword','heavy'])sum[u]+=c.send[u];return sum;},{spear:0,sword:0,heavy:0});
  }
  function troops(t){return `Lance: ${num(t.spear)}\nSpade: ${num(t.sword)}\nCavalleria pesante: ${num(t.heavy)}`;}
  function details(p){
    const parts=[`Coordinate: ${p.coord}`];
    if(p.enemy)parts.push('Villaggio nemico');
    if(p.friends.length){
      for(const f of p.friends)parts.push(`Amico: ${f.player || 'Player non indicato'}${f.enabled?'':' (disattivato)'}\nTruppe caricate\n${troops(f)}\nPeso disponibile: ${num(f.weight)}`);
      const outgoing=mapCommands.filter(c=>c.sourceCoord===p.coord);
      if(outgoing.length){const t=units(outgoing);parts.push(`Supporti assegnati in uscita\n${troops(t)}\nBunker: ${[...new Set(outgoing.map(c=>c.bunkerCoord))].join(', ')}`);}
    }
    if(p.bunker){
      const b=p.bunker;parts.push(`Bunker${b.enabled?'':' (disattivato)'}\nPeso richiesto: ${num(b.target)}\nArrivo: ${b.arrival.replace('T',' ') || 'Non impostato'}`);
      if(mapPlanReady){const incoming=mapCommands.filter(c=>c.bunkerCoord===p.coord);parts.push(`Supporti assegnati in arrivo\n${troops(units(incoming))}\nPeso conteggiato: ${num(incoming.reduce((n,c)=>n+c.sentWeight,0))}`);}
      else parts.push('Supporti assegnati: premi Calcola');
      if(!p.friends.length)parts.push('Truppe già presenti: dato non caricato');
    }
    return parts.join('\n\n');
  }
  function rebuild(){
    const entries=new Map();
    function add(coord){if(!entries.has(coord)){const p=parseCoords(coord)[0];if(!p)return null;entries.set(coord,{...p,friends:[],enemy:false,bunker:null});}return entries.get(coord);}
    for(const e of parseCoords(STATIC_ENEMY_VILLAGES.join('\n')))add(e.coord).enemy=true;
    for(const f of friendlyRows)add(f.coord).friends.push(f);
    for(const b of bunkerRows)add(b.coord).bunker=b;
    const used=new Set(mapCommands.map(c=>c.sourceCoord));
    points=[...entries.values()].map(p=>({...p,used:used.has(p.coord)}));
    hover=null;tooltip.hidden=true;
    status.textContent=`${points.filter(p=>p.enemy).length} nemici · ${friendlyRows.length} amici caricati · ${used.size} mittenti utilizzati · ${bunkerRows.length} bunker${mapPlanReady?' · Piano calcolato':' · Nessuna assegnazione calcolata'}`;
    if(!initialized && width){fit();initialized=true;}else draw();
  }
  function fit(){
    if(!points.length)return;
    const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    center={x:(minX+maxX)/2,y:(minY+maxY)/2};
    scale=Math.min((width-100)/Math.max(maxX-minX,10),(height-100)/Math.max(maxY-minY,10));draw();
  }
  function draw(){
    ctx.clearRect(0,0,width,height);
    const a=world({x:48,y:15}),b=world({x:width-18,y:height-30});
    const raw=65/scale,base=10**Math.floor(Math.log10(raw));
    const step=[1,2,5,10].map(n=>n*base).find(n=>n>=raw);
    ctx.font='11px system-ui';ctx.lineWidth=1;
    for(let x=Math.ceil(a.x/step)*step;x<=b.x;x+=step){const sx=screen({x,y:0}).x;ctx.strokeStyle='#e0e7ee';ctx.beginPath();ctx.moveTo(sx,15);ctx.lineTo(sx,height-30);ctx.stroke();ctx.fillStyle='#5b6a79';ctx.fillText(String(Math.round(x*100)/100),sx-9,height-10);}
    for(let y=Math.ceil(a.y/step)*step;y<=b.y;y+=step){const sy=screen({x:0,y}).y;ctx.strokeStyle='#e0e7ee';ctx.beginPath();ctx.moveTo(48,sy);ctx.lineTo(width-18,sy);ctx.stroke();ctx.fillStyle='#5b6a79';ctx.fillText(String(Math.round(y*100)/100),5,sy+4);}
    ctx.fillText('X',width-13,height-10);ctx.fillText('Y',8,13);
    ctx.save();ctx.beginPath();ctx.rect(48,15,width-66,height-45);ctx.clip();
    if(document.getElementById('mapLinks').checked){
      for(const c of mapCommands){
        const from=parseCoords(c.sourceCoord)[0],to=parseCoords(c.bunkerCoord)[0];
        const highlighted=hover && (hover.coord===from.coord||hover.coord===to.coord);
        const p=screen(from),q=screen(to);ctx.strokeStyle=highlighted?'#188453':'#18845335';ctx.lineWidth=highlighted?2:0.8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
    }
    // Bunkers are drawn last so their outlines stay visible over other categories.
    for(const p of [...points].sort((a,b)=>Number(!!a.bunker)-Number(!!b.bunker))){
      const q=screen(p),r=2.5;
      const active=p.bunker?p.bunker.enabled:p.friends.length?p.friends.some(f=>f.enabled):true;
      const color=p.used?colors.used:p.friends.length?colors.friendly:p.bunker?colors.bunker:colors.enemy;
      ctx.globalAlpha=active?1:0.4;ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);if(active)ctx.fill();else ctx.stroke();
      if(p.bunker){ctx.strokeStyle=colors.bunker;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(q.x,q.y-r);ctx.lineTo(q.x+r,q.y);ctx.lineTo(q.x,q.y+r);ctx.lineTo(q.x-r,q.y);ctx.closePath();ctx.stroke();}
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  function local(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function inspect(pos){
    let nearest=null,best=11;
    for(const p of points){const q=screen(p),d=Math.hypot(pos.x-q.x,pos.y-q.y);if(d<best){nearest=p;best=d;}}
    hover=nearest;tooltip.hidden=!nearest;
    if(nearest){tooltip.textContent=details(nearest);tooltip.style.left=`${Math.max(0,Math.min(pos.x+14,width-tooltip.offsetWidth-8))}px`;tooltip.style.top=`${Math.max(0,Math.min(pos.y+14,height-tooltip.offsetHeight-8))}px`;}
    draw();
  }
  canvas.addEventListener('pointerdown',e=>{drag={pos:local(e),center:{...center},moved:false};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{const pos=local(e);if(drag){const dx=pos.x-drag.pos.x,dy=pos.y-drag.pos.y;if(Math.hypot(dx,dy)>3)drag.moved=true;center={x:drag.center.x-dx/scale,y:drag.center.y-dy/scale};hover=null;tooltip.hidden=true;draw();}else inspect(pos);});
  canvas.addEventListener('pointerup',e=>{const tap=drag&&!drag.moved;drag=null;if(tap)inspect(local(e));});
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('pointerleave',()=>{if(!drag){hover=null;tooltip.hidden=true;draw();}});
  canvas.addEventListener('wheel',e=>{e.preventDefault();const pos=local(e),before=world(pos);scale=Math.max(0.1,Math.min(100,scale*Math.exp(-e.deltaY*0.0015)));center={x:before.x-(pos.x-width/2)/scale,y:before.y-(pos.y-height/2)/scale};hover=null;tooltip.hidden=true;draw();},{passive:false});
  canvas.addEventListener('keydown',e=>{if(e.key==='Home'){fit();e.preventDefault();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){center.x+=(e.key==='ArrowLeft'?-40:e.key==='ArrowRight'?40:0)/scale;center.y+=(e.key==='ArrowUp'?-40:e.key==='ArrowDown'?40:0)/scale;draw();e.preventDefault();}});
  document.getElementById('mapFit').addEventListener('click',fit);
  document.getElementById('mapLinks').addEventListener('change',draw);
  new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const ratio=window.devicePixelRatio||1;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);if(!initialized){rebuild();}else draw();}).observe(canvas);
  window.refreshVillageMap=rebuild;
  rebuild();
})();
