const STORAGE_KEY = "tw-bunker-planner-settings-v8";
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

const UNIT_TW_LABEL = {
  spear: "lance",
  sword: "spade",
  heavy: "oni"
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
  troopTableBody: document.getElementById("troopTableBody"),
  emptyTroopHint: document.getElementById("emptyTroopHint"),
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
let friendlyRows = [];

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

function travelSeconds(from,to,unit,speed,unitSpeed,supportSlowdownPercent = 0){
  const fields = distance(from,to);
  const slowdown = Number(supportSlowdownPercent || 0);
  const supportSpeedFactor = Math.max(0.01, 1 - slowdown / 100);
  const minutes = UNIT_BASE_MINUTES[unit] * fields / speed / unitSpeed / supportSpeedFactor;
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
    if(spear < 50 && sword < 50 && heavy < 50) continue;
    const weight = spear + sword + heavy * 4;
    if(weight <= 0) continue;
    villages.push({ id: crypto.randomUUID(), enabled: true, ...coords, player, spear, sword, heavy, weight });
  }

  return villages;
}

function availableWeight(source){
  return source.spear + source.sword + source.heavy * 4;
}

function sendWeight(send){
  return send.spear + send.sword + send.heavy * 4;
}

function effectiveWeight(weight, roundingEnabled){
  if(!roundingEnabled || weight <= 0) return weight;
  const step = 1000;
  const next = Math.ceil(weight / step) * step;
  if(next > weight && weight >= next * 0.9) return next;
  return weight;
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
    const seconds = travelSeconds(source,bunker,unit,settings.worldSpeed,settings.unitSpeed,bunker.supportSlowdown);
    deadlines[unit] = addSeconds(bunker.arrival, -seconds);
  }
  return deadlines;
}

function getItalyNow(){
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
    0
  );
}

function removeExpiredUnits(source,send,deadlines,now){
  for(const unit of ["spear","sword","heavy"]){
    if(!send[unit]) continue;
    if(deadlines[unit] && deadlines[unit].getTime() <= now.getTime()){
      source[unit] += send[unit];
      send[unit] = 0;
      delete deadlines[unit];
    }
  }

  source.weight = availableWeight(source);
  return sendWeight(send);
}

function formatUnitSendLine(amount,unit,departure){
  return `${amount} ${UNIT_TW_LABEL[unit]} [unit]${unit}[/unit] | partenza: ${formatDateTime(departure)}`;
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
    friendlyRows: friendlyRows.map(row => ({ ...row })),
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
  if(settings.friendlyRows !== undefined) friendlyRows = normalizeFriendlyRows(settings.friendlyRows);
  if(settings.minPacketEnabled !== undefined) els.minPacketEnabled.checked = Boolean(settings.minPacketEnabled);
  if(settings.minPacketWeight !== undefined) els.minPacketWeight.value = settings.minPacketWeight;
  if(settings.minPacketRoundingEnabled !== undefined) els.minPacketRoundingEnabled.checked = Boolean(settings.minPacketRoundingEnabled);
  renderBunkerTable();
  renderTroopTable();
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
      arrival: String(row.arrival || ""),
      supportSlowdown: String(row.supportSlowdown || "")
    };
  }).filter(Boolean);
}

function normalizeFriendlyRows(rows){
  return (Array.isArray(rows) ? rows : []).map(row => {
    const coords = parseCoords(row.coord || "")[0];
    if(!coords) return null;
    const spear = toInt(row.spear);
    const sword = toInt(row.sword);
    const heavy = toInt(row.heavy);
    if(spear < 50 && sword < 50 && heavy < 50) return null;
    const weight = spear + sword + heavy * 4;
    if(weight <= 0) return null;
    return {
      id: row.id || crypto.randomUUID(),
      enabled: row.enabled !== false,
      coord: coords.coord,
      x: coords.x,
      y: coords.y,
      player: row.player || "",
      spear,
      sword,
      heavy,
      weight
    };
  }).filter(Boolean);
}

function renderTroopTable(){
  els.troopTableBody.innerHTML = "";
  els.emptyTroopHint.hidden = friendlyRows.length > 0;

  for(const row of friendlyRows){
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;

    tr.innerHTML = `
      <td><input type="checkbox" data-field="enabled" ${row.enabled ? "checked" : ""} /></td>
      <td class="mono">${row.coord}</td>
      <td>${row.player || ""}</td>
      <td class="num">${row.spear}</td>
      <td class="num">${row.sword}</td>
      <td class="num">${row.heavy}</td>
      <td class="num">${row.weight}</td>
      <td><button type="button" data-action="remove">Rimuovi</button></td>
    `;
    els.troopTableBody.appendChild(tr);
  }
}

function loadFriendlyTroopsFromCsv(){
  clearError();
  try{
    friendlyRows = normalizeFriendlyRows(parseTroops(els.troopCsv.value));
    renderTroopTable();
    if(!friendlyRows.length){
      showError("Nessun villaggio amico con spear, sword o heavy trovato nella tabella.");
    }
  }catch(err){
    friendlyRows = [];
    renderTroopTable();
    showError(err.message);
  }
}

function getActiveFriendlySources(){
  return friendlyRows
    .filter(row => row.enabled)
    .map(row => ({ ...row }));
}

function getActiveBunkers(){
  return bunkerRows.filter(row => row.enabled).map(row => {
    const coords = parseCoords(row.coord)[0];
    return {
      ...coords,
      target: Number(row.target),
      arrival: parseDateTime(row.arrival),
      arrivalText: row.arrival,
      supportSlowdown: Number(row.supportSlowdown || 0)
    };
  });
}

function persist(){
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
      <td><input class="tableInput" type="number" min="0" max="99" step="1" data-field="supportSlowdown" value="${row.supportSlowdown || ""}" placeholder="0" /></td>
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
      arrival: els.defaultBunkerArrival.value,
      supportSlowdown: ""
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
  if(bunkers.some(b => !Number.isFinite(b.supportSlowdown) || b.supportSlowdown < 0 || b.supportSlowdown >= 100)) throw new Error("La riduzione velocità supporti deve essere vuota, 0, o un numero tra 1 e 99.");
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
    lines.push(`[b]Player:[/b] [player]${player}[/player]`);
    lines.push("");
    for(const command of playerCommands){
      lines.push(`${command.sourceCoord} -> ${command.bunkerCoord}`);
      if(command.send.spear) lines.push(formatUnitSendLine(command.send.spear, "spear", command.deadlines.spear));
      if(command.send.sword) lines.push(formatUnitSendLine(command.send.sword, "sword", command.deadlines.sword));
      if(command.send.heavy) lines.push(formatUnitSendLine(command.send.heavy, "heavy", command.deadlines.heavy));
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

    lines.push(`[b]${UNIT_TW_LABEL[unit].toUpperCase()}[/b]`);
    for(const row of rows){
      const command = row.command;
      lines.push(`${command.sourceCoord} ([player]${command.player || "unknown player"}[/player]) -> ${command.bunkerCoord}`);
      lines.push(`${row.amount} ${UNIT_TW_LABEL[unit]} [unit]${unit}[/unit]`);
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
  const roundingEnabled = Boolean(settings.minPacketRoundingEnabled);
  const maxSenderPerBunker = Math.floor(Number(settings.maxSenderPerBunker || 0));
  let sources = getActiveFriendlySources();

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
  const now = getItalyNow();

  for(const bunker of bunkers){
    let remaining = Math.round(bunker.target);
    let sentHere = 0;
    const bunkerCommands = [];

    lines.push(`[b]BUNKER[/b] ${bunker.coord}`);
    lines.push("");
    lines.push(`Target: ${bunker.target}`);
    lines.push(`Arrivo: ${formatDateTime(bunker.arrival)}`);
    lines.push("");

    const sortedSources = sortSourcesForBunker(sources,bunker);
    const limitedSources = maxSenderPerBunker > 0 ? sortedSources.slice(0, maxSenderPerBunker) : sortedSources;

    for(const source of limitedSources){
      if(remaining <= 0) break;
      if(source.coord === bunker.coord || source.weight <= 0) continue;

      const sourcePlanWeight = effectiveWeight(source.weight, roundingEnabled);
      if(settings.minPacketEnabled && sourcePlanWeight < minPacket && remaining >= minPacket){
        skippedSmallSources += 1;
        continue;
      }

      const wanted = Math.min(remaining, source.weight);
      const allowSmallFinal = settings.minPacketEnabled && remaining < minPacket;
      const { send, sentWeight } = takeDefense(source, wanted);
      if(sentWeight <= 0) continue;

      const deadlines = getUnitDeadlines(source,bunker,send,settings);
      const actualFutureWeight = removeExpiredUnits(source, send, deadlines, now);
      if(actualFutureWeight <= 0){
        continue;
      }

      const planWeight = effectiveWeight(actualFutureWeight, roundingEnabled);
      if(settings.minPacketEnabled && planWeight < minPacket && !allowSmallFinal){
        restoreDefense(source,send);
        skippedSmallSources += 1;
        continue;
      }

      if(settings.minPacketEnabled && planWeight < minPacket && allowSmallFinal){
        smallFinalCommands += 1;
      }

      remaining = Math.max(0, remaining - planWeight);
      sentHere += planWeight;
      totalSentWeight += planWeight;
      commandCount += 1;

      bunkerCommands.push({
        sourceCoord: source.coord,
        bunkerCoord: bunker.coord,
        player: source.player || "unknown player",
        send,
        sentWeight: planWeight,
        actualWeight: actualFutureWeight,
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
  setSettings({
    worldSpeed: 1,
    unitSpeed: 1,
    minPacketEnabled: true,
    minPacketWeight: 1000,
    minPacketRoundingEnabled: true,
    outputSort: "player",
    friendlyRows: []
  });
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
    if(field === "supportSlowdown") row.supportSlowdown = event.target.value;
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

  document.getElementById("loadTroopsBtn").addEventListener("click", loadFriendlyTroopsFromCsv);

  els.troopTableBody.addEventListener("change", event => {
    const tr = event.target.closest("tr");
    if(!tr) return;
    const row = friendlyRows.find(item => item.id === tr.dataset.id);
    if(!row) return;
    if(event.target.dataset.field === "enabled") row.enabled = event.target.checked;
    persist();
  });

  els.troopTableBody.addEventListener("click", event => {
    if(event.target.dataset.action !== "remove") return;
    const tr = event.target.closest("tr");
    friendlyRows = friendlyRows.filter(item => item.id !== tr.dataset.id);
    renderTroopTable();
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
    if(!confirm("Vuoi davvero cancellare tutta la configurazione?")) return;
    bunkerRows = [];
    friendlyRows = [];
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
      bunkers: [],
      friendlyRows: []
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
