const STORAGE_KEY = "tw-bunker-planner-settings-v7";
const COORD_RE = /\b(\d{1,3})\|(\d{1,3})\b/g;

const STATIC_ENEMY_VILLAGES = [
  "500|500",
  "505|497"
];

const UNIT_BASE_MINUTES = {
  spear: 18,
  sword: 22,
  heavy: 11
};

const UNIT_LABEL = {
  spear: "spear",
  sword: "sword",
  heavy: "heavy"
};

const els = {
  worldSpeed: document.getElementById("worldSpeed"),
  unitSpeed: document.getElementById("unitSpeed"),
  bunkerCoordsInput: document.getElementById("bunkerCoordsInput"),
  defaultBunkerTarget: document.getElementById("defaultBunkerTarget"),
  defaultBunkerArrival: document.getElementById("defaultBunkerArrival"),
  bunkerTableBody: document.getElementById("bunkerTableBody"),
  emptyBunkerHint: document.getElementById("emptyBunkerHint"),
  troopCsv: document.getElementById("troopCsv"),
  minPacketEnabled: document.getElementById("minPacketEnabled"),
  minPacketWeight: document.getElementById("minPacketWeight"),
  minPacketRoundingEnabled: document.getElementById("minPacketRoundingEnabled"),
  maxSenderPerBunker: document.getElementById("maxSenderPerBunker"),
  outputSort: document.getElementById("outputSort"),
  resultBox: document.getElementById("resultBox"),
  errorBox: document.getElementById("errorBox"),
  summaryBox: document.getElementById("summaryBox"),
  warningsBox: document.getElementById("warningsBox"),
  settingsDialog: document.getElementById("settingsDialog"),
  settingsImport: document.getElementById("settingsImport")
};

let bunkerRows = [];

function parseCoords(text){
  const found = [];
  const seen = new Set();
  for(const match of String(text || "").matchAll(COORD_RE)){
    const coord = `${Number(match[1])}|${Number(match[2])}`;
    if(seen.has(coord)) continue;
    seen.add(coord);
    found.push({ coord, x: Number(match[1]), y: Number(match[2]) });
  }
  return found;
}

function distance(a,b){
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function minDistanceToEnemies(village,enemies){
  if(!enemies.length) return 0;
  return Math.min(...enemies.map(enemy => distance(village, enemy)));
}

function travelSeconds(from,to,unit,speed,unitSpeed){
  const fields = distance(from,to);
  const minutes = UNIT_BASE_MINUTES[unit] * fields / speed / unitSpeed;
  return Math.round(minutes * 60);
}

function pad2(value){
  return String(value).padStart(2,"0");
}

function formatDateTime(date){
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function parseDateTime(value){
  const text = String(value || "").trim();
  if(!text) return null;

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if(!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] || 0);
  if(hour > 23 || minute > 59 || second > 59) return null;

  const date = new Date(year, month, day, hour, minute, second, 0);
  if(date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}

function addSeconds(date,seconds){
  return new Date(date.getTime() + seconds * 1000);
}

function splitCsvLine(line){
  const out = [];
  let current = "";
  let quoted = false;
  for(let i = 0; i < line.length; i += 1){
    const char = line[i];
    if(char === '"'){
      quoted = !quoted;
    }else if(char === "," && !quoted){
      out.push(current.trim());
      current = "";
    }else{
      current += char;
    }
  }
  out.push(current.trim());
  return out;
}

function toInt(value){
  const parsed = Number(String(value || "0").replace(/\./g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseTroops(text){
  const rows = String(text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if(!rows.length) return [];

  const headerIndex = rows.findIndex(line => /^coords\s*,/i.test(line));
  if(headerIndex === -1) throw new Error("La tabella truppe deve avere header che inizia con Coords.");

  const headers = splitCsvLine(rows[headerIndex]).map(h => h.toLowerCase());
  const required = ["coords","player","spear","sword","heavy"];
  for(const name of required){
    if(!headers.includes(name)) throw new Error(`Colonna mancante: ${name}`);
  }

  const index = Object.fromEntries(headers.map((h,i) => [h,i]));
  const villages = [];

  for(const line of rows.slice(headerIndex + 1)){
    const cols = splitCsvLine(line);
    const coords = parseCoords(cols[index.coords] || "")[0];
    if(!coords) continue;
    const player = cols[index.player] || "";
    const spear = toInt(cols[index.spear]);
    const sword = toInt(cols[index.sword]);
    const heavy = toInt(cols[index.heavy]);
    const weight = spear + sword + heavy * 4;
    if(weight <= 0) continue;
    villages.push({ ...coords, player, spear, sword, heavy, weight });
  }

  return villages;
}

function availableWeight(source){
  return source.spear + source.sword + source.heavy * 4;
}

function sendWeight(send){
  return send.spear + send.sword + send.heavy * 4;
}

function takeDefense(source, wanted){
  const send = { spear: 0, sword: 0, heavy: 0 };
  let remaining = wanted;

  const heavyNeeded = Math.floor(remaining / 4);
  send.heavy = Math.min(source.heavy, heavyNeeded);
  source.heavy -= send.heavy;
  remaining -= send.heavy * 4;

  send.spear = Math.min(source.spear, remaining);
  source.spear -= send.spear;
  remaining -= send.spear;

  send.sword = Math.min(source.sword, remaining);
  source.sword -= send.sword;
  remaining -= send.sword;

  if(remaining > 0 && source.heavy > 0){
    send.heavy += 1;
    source.heavy -= 1;
  }

  source.weight = availableWeight(source);
  return { send, sentWeight: sendWeight(send) };
}

function restoreDefense(source,send){
  source.spear += send.spear;
  source.sword += send.sword;
  source.heavy += send.heavy;
  source.weight = availableWeight(source);
}

function sentUnits(send){
  return ["spear","sword","heavy"].filter(unit => send[unit] > 0);
}

function getUnitDeadlines(source,bunker,send,settings){
  const deadlines = {};
  for(const unit of sentUnits(send)){
    const seconds = travelSeconds(source,bunker,unit,settings.worldSpeed,settings.unitSpeed);
    deadlines[unit] = addSeconds(bunker.arrival, -seconds);
  }
  return deadlines;
}

function getSettings(){
  return {
    worldSpeed: Number(els.worldSpeed.value),
    unitSpeed: Number(els.unitSpeed.value),
    defaultBunkerTarget: els.defaultBunkerTarget.value,
    defaultBunkerArrival: els.defaultBunkerArrival.value,
    bunkers: bunkerRows.map(row => ({ ...row })),
    maxSenderPerBunker: els.maxSenderPerBunker.value,
    outputSort: els.outputSort.value,
    troopCsv: els.troopCsv.value,
    minPacketEnabled: els.minPacketEnabled.checked,
    minPacketWeight: els.minPacketWeight.value,
    minPacketRoundingEnabled: els.minPacketRoundingEnabled.checked
  };
}

function setSettings(settings){
  if(settings.worldSpeed !== undefined && settings.worldSpeed !== "") els.worldSpeed.value = settings.worldSpeed;
  if(settings.unitSpeed !== undefined && settings.unitSpeed !== "") els.unitSpeed.value = settings.unitSpeed;
  if(settings.defaultBunkerTarget !== undefined) els.defaultBunkerTarget.value = settings.defaultBunkerTarget;
  if(settings.defaultBunkerArrival !== undefined) els.defaultBunkerArrival.value = settings.defaultBunkerArrival;
  if(settings.bunkers !== undefined) bunkerRows = normalizeBunkers(settings.bunkers);
  if(settings.maxSenderPerBunker !== undefined) els.maxSenderPerBunker.value = settings.maxSenderPerBunker;
  if(settings.outputSort !== undefined) els.outputSort.value = settings.outputSort;
  if(settings.troopCsv !== undefined) els.troopCsv.value = settings.troopCsv;
  if(settings.minPacketEnabled !== undefined) els.minPacketEnabled.checked = Boolean(settings.minPacketEnabled);
  if(settings.minPacketWeight !== undefined) els.minPacketWeight.value = settings.minPacketWeight;
  if(settings.minPacketRoundingEnabled !== undefined) els.minPacketRoundingEnabled.checked = Boolean(settings.minPacketRoundingEnabled);
  renderBunkerTable();
}

function normalizeBunkers(rows){
  return (Array.isArray(rows) ? rows : []).map(row => {
    const coords = parseCoords(row.coord || "")[0];
    if(!coords) return null;
    return {
      id: row.id || crypto.randomUUID(),
      coord: coords.coord,
      enabled: row.enabled !== false,
      target: String(row.target || ""),
      arrival: String(row.arrival || "")
    };
  }).filter(Boolean);
}

function getActiveBunkers(){
  return bunkerRows.filter(row => row.enabled).map(row => {
    const coords = parseCoords(row.coord)[0];
    return {
      ...coords,
      target: Number(row.target),
      arrival: parseDateTime(row.arrival),
      arrivalText: row.arrival
    };
  });
}

function persist(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSettings()));
}

function renderBunkerTable(){
  els.bunkerTableBody.innerHTML = "";
  els.emptyBunkerHint.hidden = bunkerRows.length > 0;

  for(const row of bunkerRows){
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;

    tr.innerHTML = `
      <td><input type="checkbox" data-field="enabled" ${row.enabled ? "checked" : ""} /></td>
      <td class="mono">${row.coord}</td>
      <td><input class="tableInput" type="number" min="1" step="1" data-field="target" value="${row.target}" /></td>
      <td><input class="tableInput" type="datetime-local" step="1" data-field="arrival" value="${row.arrival}" /></td>
      <td><button type="button" data-action="remove">Rimuovi</button></td>
    `;
    els.bunkerTableBody.appendChild(tr);
  }
}

function addBunkersFromInput(){
  clearError();
  const coords = parseCoords(els.bunkerCoordsInput.value);
  if(!coords.length){
    showError("Inserisci almeno una coordinata bunker.");
    return;
  }

  const existing = new Set(bunkerRows.map(row => row.coord));
  for(const coord of coords){
    if(existing.has(coord.coord)) continue;
    bunkerRows.push({
      id: crypto.randomUUID(),
      coord: coord.coord,
      enabled: true,
      target: els.defaultBunkerTarget.value,
      arrival: els.defaultBunkerArrival.value
    });
    existing.add(coord.coord);
  }

  els.bunkerCoordsInput.value = "";
  renderBunkerTable();
  persist();
}

function validate(settings,bunkers,enemies,sources){
  if(!Number.isFinite(settings.worldSpeed) || settings.worldSpeed <= 0) throw new Error("Velocità mondo deve essere maggiore di zero.");
  if(!Number.isFinite(settings.unitSpeed) || settings.unitSpeed <= 0) throw new Error("Modificatore unità deve essere maggiore di zero.");
  if(!bunkerRows.length) throw new Error("Inserisci almeno un bunker.");
  if(!bunkers.length) throw new Error("Attiva almeno un bunker.");
  if(bunkers.some(b => !Number.isFinite(b.target) || b.target <= 0)) throw new Error("Ogni bunker attivo deve avere quantità maggiore di zero.");
  if(bunkers.some(b => !b.arrival)) throw new Error("Ogni bunker attivo deve avere data e ora arrivo valide.");
  if(!enemies.length) throw new Error("Lista nemici statica vuota. Modifica STATIC_ENEMY_VILLAGES in app.js.");
  if(!sources.length) throw new Error("Incolla almeno un villaggio amico con spear, sword o heavy.");

  const minPacket = Number(settings.minPacketWeight);
  if(settings.minPacketEnabled && (!Number.isFinite(minPacket) || minPacket <= 0)) throw new Error("Il peso minimo comando deve essere maggiore di zero.");

  const maxSender = Number(settings.maxSenderPerBunker || 0);
  if(!Number.isFinite(maxSender) || maxSender < 0) throw new Error("Il limite villaggi mittenti deve essere vuoto, 0 oppure maggiore di zero.");
}

function sortSourcesForBunker(sources,bunker){
  return sources.slice().sort((a,b) => {
    const enemySort = b.enemyDistance - a.enemyDistance;
    if(enemySort) return enemySort;
    const weightSort = b.weight - a.weight;
    if(weightSort) return weightSort;
    return distance(a,bunker) - distance(b,bunker);
  });
}

function commandUnitRows(command){
  const rows = [];
  for(const unit of ["spear","sword","heavy"]){
    if(!command.send[unit]) continue;
    rows.push({ unit, amount: command.send[unit], departure: command.deadlines[unit], command });
  }
  return rows;
}

function formatPlayerCommands(commands){
  const lines = [];
  const byPlayer = new Map();

  for(const command of commands){
    const player = command.player || "unknown player";
    if(!byPlayer.has(player)) byPlayer.set(player, []);
    byPlayer.get(player).push(command);
  }

  for(const [player, playerCommands] of [...byPlayer.entries()].sort((a,b) => a[0].localeCompare(b[0]))){
    lines.push(`[b]Player: ${player}[/b]`);
    for(const command of playerCommands){
      lines.push(`${command.sourceCoord} -> ${command.bunkerCoord}`);
      if(command.send.spear) lines.push(`${command.send.spear} spear | partenza: ${formatDateTime(command.deadlines.spear)}`);
      if(command.send.sword) lines.push(`${command.send.sword} sword | partenza: ${formatDateTime(command.deadlines.sword)}`);
      if(command.send.heavy) lines.push(`${command.send.heavy} heavy | partenza: ${formatDateTime(command.deadlines.heavy)}`);
      lines.push(`Peso: ${command.sentWeight}`);
      lines.push(`Distanza nemico: ${command.enemyDistance.toFixed(2)}`);
      lines.push("");
    }
  }

  return lines;
}

function formatUnitCommands(commands){
  const lines = [];

  for(const unit of ["spear","sword","heavy"]){
    const rows = commands.flatMap(commandUnitRows).filter(row => row.unit === unit);
    if(!rows.length) continue;
    rows.sort((a,b) => a.departure - b.departure || a.command.player.localeCompare(b.command.player));

    lines.push(`[b]${UNIT_LABEL[unit].toUpperCase()}[/b]`);
    for(const row of rows){
      const command = row.command;
      lines.push(`${command.sourceCoord} (${command.player || "unknown player"}) -> ${command.bunkerCoord}`);
      lines.push(`${row.amount} ${UNIT_LABEL[unit]}`);
      lines.push(`Partenza: ${formatDateTime(row.departure)}`);
      lines.push(`Distanza nemico: ${command.enemyDistance.toFixed(2)}`);
      lines.push("");
    }
  }

  return lines;
}

function buildPlan(){
  const settings = getSettings();
  const enemies = parseCoords(STATIC_ENEMY_VILLAGES.join("\n"));
  const bunkers = getActiveBunkers();
  const minPacket = settings.minPacketEnabled ? Math.round(Number(settings.minPacketWeight)) : 1;
  const minPacketThreshold = settings.minPacketEnabled ? (settings.minPacketRoundingEnabled ? Math.floor(minPacket * 0.9) : minPacket) : 1;
  const maxSenderPerBunker = Math.floor(Number(settings.maxSenderPerBunker || 0));
  let sources = parseTroops(settings.troopCsv);

  sources = sources.map(source => ({
    ...source,
    enemyDistance: minDistanceToEnemies(source,enemies)
  }));

  validate(settings,bunkers,enemies,sources);

  const lines = [];
  const warnings = [];
  let totalSentWeight = 0;
  let totalMissing = 0;
  let commandCount = 0;
  let skippedSmallSources = 0;
  let smallFinalCommands = 0;

  for(const bunker of bunkers){
    let remaining = Math.round(bunker.target);
    let sentHere = 0;
    const bunkerCommands = [];

    lines.push(`[b]BUNKER ${bunker.coord}[/b]`);
    lines.push(`Target: ${bunker.target}`);
    lines.push(`Arrivo: ${formatDateTime(bunker.arrival)}`);
    lines.push("");

    const sortedSources = sortSourcesForBunker(sources,bunker);
    const limitedSources = maxSenderPerBunker > 0 ? sortedSources.slice(0, maxSenderPerBunker) : sortedSources;

    for(const source of limitedSources){
      if(remaining <= 0) break;
      if(source.coord === bunker.coord || source.weight <= 0) continue;

      if(settings.minPacketEnabled && source.weight < minPacketThreshold && remaining >= minPacketThreshold){
        skippedSmallSources += 1;
        continue;
      }

      const wanted = Math.min(remaining, source.weight);
      const allowSmallFinal = settings.minPacketEnabled && remaining < minPacketThreshold;
      const { send, sentWeight } = takeDefense(source, wanted);
      if(sentWeight <= 0) continue;

      if(settings.minPacketEnabled && sentWeight < minPacketThreshold && !allowSmallFinal){
        restoreDefense(source,send);
        skippedSmallSources += 1;
        continue;
      }

      if(settings.minPacketEnabled && sentWeight < minPacketThreshold && allowSmallFinal){
        smallFinalCommands += 1;
      }

      remaining = Math.max(0, remaining - sentWeight);
      sentHere += sentWeight;
      totalSentWeight += sentWeight;
      commandCount += 1;

      const deadlines = getUnitDeadlines(source,bunker,send,settings);
      bunkerCommands.push({
        sourceCoord: source.coord,
        bunkerCoord: bunker.coord,
        player: source.player || "unknown player",
        send,
        sentWeight,
        deadlines,
        enemyDistance: source.enemyDistance
      });
    }

    if(settings.outputSort === "unit"){
      lines.push(...formatUnitCommands(bunkerCommands));
    }else{
      lines.push(...formatPlayerCommands(bunkerCommands));
    }

    lines.push(`Totale inviato a ${bunker.coord}: ${sentHere}`);
    if(remaining > 0){
      totalMissing += remaining;
      const limitText = maxSenderPerBunker > 0 ? ` Limite villaggi mittenti: ${maxSenderPerBunker}.` : "";
      const warning = `Bunker ${bunker.coord} non completato. Mancano ${remaining}.${limitText}`;
      warnings.push(warning);
      lines.push(`[color=#b42318]${warning}[/color]`);
    }else{
      lines.push(`Mancante: 0`);
    }
    lines.push("");
  }


  return {
    text: lines.join("\n"),
    summary: `${commandCount} comandi, ${totalSentWeight} peso difesa assegnato${totalMissing ? `, ${totalMissing} mancante` : ""}.`,
    warnings
  };
}

function showError(message){
  els.errorBox.textContent = message;
  els.errorBox.hidden = false;
}

function clearError(){
  els.errorBox.textContent = "";
  els.errorBox.hidden = true;
}

function showWarnings(warnings){
  els.warningsBox.innerHTML = "";
  els.warningsBox.hidden = !warnings.length;
  if(!warnings.length) return;
  const list = document.createElement("ul");
  for(const warning of warnings){
    const item = document.createElement("li");
    item.textContent = warning;
    list.appendChild(item);
  }
  els.warningsBox.appendChild(list);
}

function calculate(){
  try{
    clearError();
    const plan = buildPlan();
    els.resultBox.value = plan.text;
    els.summaryBox.textContent = plan.summary;
    showWarnings(plan.warnings);
    persist();
  }catch(err){
    els.resultBox.value = "";
    els.summaryBox.textContent = "";
    showWarnings([]);
    showError(err.message);
  }
}

async function writeClipboard(text){
  await navigator.clipboard.writeText(text);
}

function encodeSettings(){
  return btoa(unescape(encodeURIComponent(JSON.stringify(getSettings()))));
}

function decodeSettings(text){
  const trimmed = text.trim();
  try{
    return JSON.parse(decodeURIComponent(escape(atob(trimmed))));
  }catch(_err){
    return JSON.parse(trimmed);
  }
}

function loadSaved(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    setSettings(JSON.parse(saved));
  }else{
    setSettings({
      worldSpeed: 1,
      unitSpeed: 1,
      minPacketEnabled: true,
      minPacketWeight: 1000,
      minPacketRoundingEnabled: true,
      outputSort: "player"
    });
  }
}

function bind(){
  document.getElementById("addBunkersBtn").addEventListener("click", addBunkersFromInput);

  els.bunkerTableBody.addEventListener("input", event => {
    const tr = event.target.closest("tr");
    if(!tr) return;
    const row = bunkerRows.find(item => item.id === tr.dataset.id);
    if(!row) return;
    const field = event.target.dataset.field;
    if(field === "target") row.target = event.target.value;
    if(field === "arrival") row.arrival = event.target.value;
    persist();
  });

  els.bunkerTableBody.addEventListener("change", event => {
    const tr = event.target.closest("tr");
    if(!tr) return;
    const row = bunkerRows.find(item => item.id === tr.dataset.id);
    if(!row) return;
    if(event.target.dataset.field === "enabled") row.enabled = event.target.checked;
    persist();
  });

  els.bunkerTableBody.addEventListener("click", event => {
    if(event.target.dataset.action !== "remove") return;
    const tr = event.target.closest("tr");
    bunkerRows = bunkerRows.filter(item => item.id !== tr.dataset.id);
    renderBunkerTable();
    persist();
  });

  document.getElementById("calcBtn").addEventListener("click", calculate);
  document.getElementById("copyResultBtn").addEventListener("click", async () => {
    calculate();
    if(els.resultBox.value) await writeClipboard(els.resultBox.value);
  });
  document.getElementById("copySettingsBtn").addEventListener("click", async () => {
    await writeClipboard(encodeSettings());
  });
  document.getElementById("pasteSettingsBtn").addEventListener("click", () => {
    els.settingsImport.value = "";
    els.settingsDialog.showModal();
  });
  document.getElementById("applySettingsBtn").addEventListener("click", () => {
    try{
      setSettings(decodeSettings(els.settingsImport.value));
      els.settingsDialog.close();
      calculate();
    }catch(err){
      alert(`Import setup fallito: ${err.message}`);
    }
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    bunkerRows = [];
    setSettings({
      worldSpeed: 1,
      unitSpeed: 1,
      defaultBunkerTarget: "",
      defaultBunkerArrival: "",
      maxSenderPerBunker: "",
      outputSort: "player",
      troopCsv: "",
      minPacketEnabled: true,
      minPacketWeight: 1000,
      minPacketRoundingEnabled: true,
      bunkers: []
    });
    els.bunkerCoordsInput.value = "";
    els.resultBox.value = "";
    els.summaryBox.textContent = "";
    showWarnings([]);
    clearError();
  });

  for(const element of [els.worldSpeed,els.unitSpeed,els.defaultBunkerTarget,els.defaultBunkerArrival,els.maxSenderPerBunker,els.outputSort,els.troopCsv,els.minPacketEnabled,els.minPacketWeight,els.minPacketRoundingEnabled]){
    element.addEventListener("input", persist);
  }
}

loadSaved();
bind();
