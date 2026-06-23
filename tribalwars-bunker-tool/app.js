const STORAGE_KEY = "tw-bunker-planner-settings-v2";
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

const SAMPLE = `Coords,Player,spear,sword,axe,spy,light,heavy,ram,catapult,knight,snob,militia,
462|559,zambo700,2366,67,0,465,0,0,0,50,0,0,0,
482|548,zambo700,3202,1440,0,484,265,0,0,50,0,0,0,
485|551,zambo700,4044,1455,0,492,258,0,1,50,0,0,0,
483|548,zambo700,3917,1664,0,491,21,0,0,50,0,0,0,
481|555,zambo700,713,0,921,20,504,123,280,0,0,0,0,
465|555,zambo700,6232,2563,0,463,0,0,1,50,0,0,0,
451|549,zambo700,2834,1628,0,454,0,341,20,50,0,1,0,
455|544,zambo700,7767,3031,1150,216,627,1840,254,0,1,0,0,`;

const els = {
  worldSpeed: document.getElementById("worldSpeed"),
  unitSpeed: document.getElementById("unitSpeed"),
  bunkerVillages: document.getElementById("bunkerVillages"),
  targetDefense: document.getElementById("targetDefense"),
  arrivalTime: document.getElementById("arrivalTime"),
  enemyVillagesStatic: document.getElementById("enemyVillagesStatic"),
  troopCsv: document.getElementById("troopCsv"),
  minPacketEnabled: document.getElementById("minPacketEnabled"),
  minPacketWeight: document.getElementById("minPacketWeight"),
  singlePlayerEnabled: document.getElementById("singlePlayerEnabled"),
  singlePlayerName: document.getElementById("singlePlayerName"),
  resultBox: document.getElementById("resultBox"),
  errorBox: document.getElementById("errorBox"),
  summaryBox: document.getElementById("summaryBox"),
  settingsDialog: document.getElementById("settingsDialog"),
  settingsImport: document.getElementById("settingsImport")
};

function parseCoords(text){
  const found = [];
  const seen = new Set();
  for(const match of text.matchAll(COORD_RE)){
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

function parseTimeToSeconds(value){
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if(!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  const s = Number(match[3] || 0);
  if(h > 47 || m > 59 || s > 59) return null;
  return h * 3600 + m * 60 + s;
}

function formatClock(totalSeconds){
  let seconds = Math.round(totalSeconds) % 86400;
  if(seconds < 0) seconds += 86400;
  const h = Math.floor(seconds / 3600);
  seconds -= h * 3600;
  const m = Math.floor(seconds / 60);
  seconds -= m * 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

function formatDuration(totalSeconds){
  const sign = totalSeconds < 0 ? "-" : "";
  let seconds = Math.abs(Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return `${sign}${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
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

function parseTroops(text){
  const rows = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if(!rows.length) return [];

  const headerIndex = rows.findIndex(line => /^coords\s*,/i.test(line));
  if(headerIndex === -1) throw new Error("Troop table needs a header starting with Coords.");

  const headers = splitCsvLine(rows[headerIndex]).map(h => h.toLowerCase());
  const required = ["coords","player","spear","sword","heavy"];
  for(const name of required){
    if(!headers.includes(name)) throw new Error(`Missing required column: ${name}`);
  }

  const index = Object.fromEntries(headers.map((h,i) => [h,i]));
  const villages = [];

  for(const line of rows.slice(headerIndex + 1)){
    const cols = splitCsvLine(line);
    const coords = parseCoords(cols[index.coords] || "")[0];
    if(!coords) continue;
    const player = cols[index.player] || "";
    const spear = Number(cols[index.spear] || 0);
    const sword = Number(cols[index.sword] || 0);
    const heavy = Number(cols[index.heavy] || 0);
    const weight = spear + sword + heavy * 4;
    if(weight <= 0) continue;
    villages.push({ ...coords, player, spear, sword, heavy, weight });
  }

  return villages;
}

function parseBunkers(text,defaultTarget,defaultArrival){
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const coords = parseCoords(line)[0];
    if(!coords) return null;
    const withoutCoord = line.replace(COORD_RE, " ");
    const timeMatch = withoutCoord.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/);
    const numberMatch = withoutCoord.replace(timeMatch ? timeMatch[0] : "", " ").match(/\b\d+\b/);
    const target = numberMatch ? Number(numberMatch[0]) : defaultTarget;
    const arrival = timeMatch ? timeMatch[0] : defaultArrival;
    return { ...coords, target, arrival, arrivalSeconds: parseTimeToSeconds(arrival) };
  }).filter(Boolean);
}

function availableWeight(source){
  return source.spear + source.sword + source.heavy * 4;
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
    remaining -= 4;
  }

  source.weight = availableWeight(source);
  const sentWeight = send.spear + send.sword + send.heavy * 4;
  return { send, sentWeight };
}

function slowestSentUnit(send){
  if(send.sword > 0) return "sword";
  if(send.spear > 0) return "spear";
  if(send.heavy > 0) return "heavy";
  return null;
}

function getSettings(){
  return {
    worldSpeed: Number(els.worldSpeed.value),
    unitSpeed: Number(els.unitSpeed.value),
    bunkerVillages: els.bunkerVillages.value,
    targetDefense: Number(els.targetDefense.value),
    arrivalTime: els.arrivalTime.value,
    troopCsv: els.troopCsv.value,
    minPacketEnabled: els.minPacketEnabled.checked,
    minPacketWeight: Number(els.minPacketWeight.value),
    singlePlayerEnabled: els.singlePlayerEnabled.checked,
    singlePlayerName: els.singlePlayerName.value.trim()
  };
}

function setSettings(settings){
  if(settings.worldSpeed !== undefined) els.worldSpeed.value = settings.worldSpeed;
  if(settings.unitSpeed !== undefined) els.unitSpeed.value = settings.unitSpeed;
  if(settings.bunkerVillages !== undefined) els.bunkerVillages.value = settings.bunkerVillages;
  if(settings.targetDefense !== undefined) els.targetDefense.value = settings.targetDefense;
  if(settings.arrivalTime !== undefined) els.arrivalTime.value = settings.arrivalTime;
  if(settings.troopCsv !== undefined) els.troopCsv.value = settings.troopCsv;
  if(settings.minPacketEnabled !== undefined) els.minPacketEnabled.checked = Boolean(settings.minPacketEnabled);
  if(settings.minPacketWeight !== undefined) els.minPacketWeight.value = settings.minPacketWeight;
  if(settings.singlePlayerEnabled !== undefined) els.singlePlayerEnabled.checked = Boolean(settings.singlePlayerEnabled);
  if(settings.singlePlayerName !== undefined) els.singlePlayerName.value = settings.singlePlayerName;
}

function validate(settings,bunkers,enemies,sources){
  if(!Number.isFinite(settings.worldSpeed) || settings.worldSpeed <= 0) throw new Error("World speed must be greater than zero.");
  if(!Number.isFinite(settings.unitSpeed) || settings.unitSpeed <= 0) throw new Error("Unit speed modifier must be greater than zero.");
  if(!Number.isFinite(settings.targetDefense) || settings.targetDefense <= 0) throw new Error("Default target defense must be greater than zero.");
  if(parseTimeToSeconds(settings.arrivalTime) === null) throw new Error("Default arrival time must be HH:MM:SS.");
  if(settings.minPacketEnabled && (!Number.isFinite(settings.minPacketWeight) || settings.minPacketWeight <= 0)) throw new Error("Minimum command weight must be greater than zero.");
  if(settings.singlePlayerEnabled && !settings.singlePlayerName) throw new Error("Insert a player name or disable one-player mode.");
  if(!bunkers.length) throw new Error("Insert at least one bunker village.");
  if(bunkers.some(b => !Number.isFinite(b.target) || b.target <= 0)) throw new Error("Each bunker quantity must be greater than zero.");
  if(bunkers.some(b => b.arrivalSeconds === null)) throw new Error("Each bunker arrival time must be HH:MM:SS.");
  if(!enemies.length) throw new Error("Static enemy list is empty. Edit STATIC_ENEMY_VILLAGES in app.js.");
  if(!sources.length) throw new Error("Paste at least one friendly village with spear, sword, or heavy cavalry.");
}

function buildPlan(){
  const settings = getSettings();
  const enemies = parseCoords(STATIC_ENEMY_VILLAGES.join("\n"));
  const bunkers = parseBunkers(settings.bunkerVillages, settings.targetDefense, settings.arrivalTime);
  const minPacket = settings.minPacketEnabled ? Math.round(settings.minPacketWeight) : 1;
  let sources = parseTroops(settings.troopCsv);

  if(settings.singlePlayerEnabled){
    const wanted = settings.singlePlayerName.toLowerCase();
    sources = sources.filter(source => source.player.toLowerCase() === wanted);
  }

  sources = sources
    .map(source => ({ ...source, enemyDistance: minDistanceToEnemies(source,enemies) }))
    .sort((a,b) => b.enemyDistance - a.enemyDistance || b.weight - a.weight);

  validate(settings,bunkers,enemies,sources);

  const lines = [];
  let totalSentWeight = 0;
  let totalMissing = 0;
  let commandCount = 0;
  let skippedSmallCommands = 0;

  lines.push(`[b]Bunker plan[/b]`);
  lines.push(`World speed: ${settings.worldSpeed}, unit speed modifier: ${settings.unitSpeed}`);
  lines.push(`Rules: ${settings.minPacketEnabled ? `minimum command ${minPacket}` : "no minimum command"}${settings.singlePlayerEnabled ? `, player ${settings.singlePlayerName}` : ", all players"}`);
  lines.push(`Static enemies: ${STATIC_ENEMY_VILLAGES.join(", ")}`);
  lines.push("");

  for(const bunker of bunkers){
    let remaining = Math.round(bunker.target);
    let sentHere = 0;
    lines.push(`[b]Bunker ${bunker.coord} | target ${bunker.target} | arrival ${formatClock(bunker.arrivalSeconds)}[/b]`);

    for(const source of sources){
      if(remaining <= 0) break;
      if(source.coord === bunker.coord || source.weight <= 0) continue;

      const wanted = Math.min(remaining, source.weight);
      if(settings.minPacketEnabled && wanted < minPacket && remaining >= minPacket){
        skippedSmallCommands += 1;
        continue;
      }

      const { send, sentWeight } = takeDefense(source, wanted);
      if(sentWeight <= 0) continue;

      if(settings.minPacketEnabled && sentWeight < minPacket && remaining >= minPacket){
        source.spear += send.spear;
        source.sword += send.sword;
        source.heavy += send.heavy;
        source.weight = availableWeight(source);
        skippedSmallCommands += 1;
        continue;
      }

      remaining = Math.max(0, remaining - sentWeight);
      sentHere += sentWeight;
      totalSentWeight += sentWeight;
      commandCount += 1;

      const unit = slowestSentUnit(send);
      const travelSecondsValue = travelSeconds(source,bunker,unit,settings.worldSpeed,settings.unitSpeed);
      const departure = formatClock(bunker.arrivalSeconds - travelSecondsValue);
      const travel = formatDuration(travelSecondsValue);

      lines.push(`${source.coord} (${source.player}) -> ${bunker.coord} | spear ${send.spear} | sword ${send.sword} | heavy ${send.heavy} | weight ${sentWeight} | travel ${travel} | send ${departure} | arrive ${formatClock(bunker.arrivalSeconds)} | enemy distance ${source.enemyDistance.toFixed(2)}`);
    }

    if(remaining > 0){
      totalMissing += remaining;
      lines.push(`[color=#b42318]Missing ${remaining} defense slots for ${bunker.coord}[/color]`);
    }
    lines.push(`Total sent to ${bunker.coord}: ${sentHere}`);
    lines.push("");
  }

  return {
    text: lines.join("\n"),
    summary: `${commandCount} commands, ${totalSentWeight} defense slots assigned${totalMissing ? `, ${totalMissing} missing` : ""}${skippedSmallCommands ? `, ${skippedSmallCommands} small sender rows skipped` : ""}.`
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

function calculate(){
  try{
    clearError();
    const plan = buildPlan();
    els.resultBox.value = plan.text;
    els.summaryBox.textContent = plan.summary;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getSettings()));
  }catch(err){
    els.resultBox.value = "";
    els.summaryBox.textContent = "";
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
  els.enemyVillagesStatic.textContent = STATIC_ENEMY_VILLAGES.join("\n");
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) setSettings(JSON.parse(saved));
}

function bind(){
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
      alert(`Settings import failed: ${err.message}`);
    }
  });
  document.getElementById("demoBtn").addEventListener("click", () => {
    els.troopCsv.value = SAMPLE;
    if(!els.bunkerVillages.value.trim()) els.bunkerVillages.value = "462|559 10000 22:00:00\n482|548 15000 22:15:00";
    if(!els.singlePlayerName.value.trim()) els.singlePlayerName.value = "zambo700";
    calculate();
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings({
      worldSpeed: 1,
      unitSpeed: 1,
      bunkerVillages: "",
      targetDefense: 10000,
      arrivalTime: "22:00:00",
      troopCsv: "",
      minPacketEnabled: true,
      minPacketWeight: 1000,
      singlePlayerEnabled: false,
      singlePlayerName: ""
    });
    els.resultBox.value = "";
    els.summaryBox.textContent = "";
    clearError();
  });
  for(const element of [els.worldSpeed,els.unitSpeed,els.bunkerVillages,els.targetDefense,els.arrivalTime,els.troopCsv,els.minPacketEnabled,els.minPacketWeight,els.singlePlayerEnabled,els.singlePlayerName]){
    element.addEventListener("input", () => localStorage.setItem(STORAGE_KEY, JSON.stringify(getSettings())));
  }
}

loadSaved();
bind();
