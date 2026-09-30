const STORAGE_KEY = "tw-bunker-planner-settings-v8";
const COORD_RE = /\b(\d{1,3})\|(\d{1,3})\b/g;

const STATIC_ENEMY_VILLAGES = [
  "520|503", "516|506", "517|507", "517|506", "516|508", "518|506", "518|504", "516|504", "516|513", "513|513", "518|507", "516|511",
  "514|511", "517|508", "517|511", "519|511", "516|509", "518|510", "514|503", "516|502", "518|501", "504|506", "494|504", "495|506",
  "496|507", "504|505", "493|504", "493|505", "493|506", "497|505", "500|503", "505|507", "506|504", "508|507", "503|507", "506|506",
  "509|508", "510|509", "504|508", "512|505", "511|526", "511|525", "509|527", "510|527", "513|522", "514|522", "513|519", "513|523",
  "516|524", "516|520", "517|524", "515|517", "516|531", "513|530", "512|529", "514|528", "515|525", "512|524", "519|527", "519|526",
  "515|529", "515|523", "511|487", "513|491", "511|491", "510|491", "510|490", "513|492", "513|490", "510|495", "547|455", "548|454",
  "546|454", "549|454", "516|488", "518|490", "516|490", "516|486", "517|488", "516|487", "552|540", "554|538", "554|537", "554|536",
  "556|537", "557|537", "555|541", "554|542", "498|509", "499|507", "498|512", "503|509", "497|512", "498|508", "498|511", "503|513",
  "495|510", "496|509", "497|507", "498|510", "503|514", "499|510", "503|515", "505|509", "500|508", "515|553", "516|556", "517|553",
  "517|546", "523|555", "523|560", "525|555", "522|559", "517|558", "519|551", "516|557", "515|555", "516|551", "515|554", "514|554",
  "512|556", "513|554", "513|555", "512|555", "510|556", "524|551", "520|553", "523|553", "525|558", "522|556", "523|557", "521|557",
  "518|554", "521|558", "515|556", "517|552", "520|554", "527|559", "522|562", "517|549", "516|558", "518|559", "519|561", "524|563",
  "521|565", "522|565", "528|564", "533|563", "510|486", "507|485", "507|482", "509|483", "504|485", "505|486", "506|485", "507|490",
  "506|492", "507|492", "505|492", "507|488", "506|487", "510|484", "509|488", "507|489", "509|489", "509|492", "509|497", "496|501",
  "500|504", "493|499", "492|502", "494|499", "498|495", "500|495", "499|503", "499|497", "497|503", "491|499", "493|497", "493|500",
  "492|496", "496|497", "498|500", "495|499", "498|501", "487|500", "532|483", "532|486", "535|481", "534|486", "533|487", "558|487",
  "537|492", "537|489", "537|487", "535|487", "554|490", "558|490", "565|487", "556|487", "559|492", "559|493", "557|490", "558|493",
  "560|491", "562|487", "562|490", "563|488", "559|484", "559|488", "560|487", "538|489", "536|490", "568|488", "566|491", "536|489",
  "537|490", "539|489", "566|490", "571|493", "517|500", "517|499", "518|498", "515|501", "517|502", "515|502", "517|498", "513|503",
  "513|501", "520|500", "520|498", "512|503", "520|501", "522|503", "514|501", "513|497", "524|499", "526|498", "527|498", "527|496",
  "524|497", "526|497", "525|501", "522|495", "526|499", "522|502", "513|498", "522|501", "514|497", "516|496", "517|497", "519|498",
  "493|543", "497|544", "491|541", "489|539", "495|542", "491|542", "493|542", "492|542", "489|538", "492|547", "496|543", "490|549",
  "494|542", "492|537", "495|550", "492|541", "492|553", "492|554", "494|556", "491|543", "494|555", "494|554", "494|553", "495|553",
  "500|553", "495|557", "496|558", "499|551", "498|551", "501|552", "501|551", "492|549", "509|543", "508|542", "510|544", "496|544",
  "506|541", "507|540", "508|545", "511|545", "491|551", "489|537", "500|558", "501|558", "500|559", "470|550", "498|532", "500|527",
  "504|531", "498|528", "502|532", "496|529", "496|532", "501|534", "497|533", "491|530", "502|534", "501|527", "504|533", "504|535",
  "501|532", "504|530", "502|530", "503|530", "505|531", "505|529", "504|528", "505|535", "499|531", "501|530", "499|533", "506|535",
  "547|507", "540|506", "543|501", "546|505", "546|507", "543|504", "549|507", "547|505", "540|505", "552|509", "554|508", "552|507",
  "546|506", "539|506", "539|507", "541|508", "539|508", "543|509", "539|502", "538|501", "545|510", "532|508", "536|504", "540|501",
  "543|512", "530|509", "533|507", "536|503", "533|503", "533|504", "530|505", "537|508", "538|496", "535|505", "550|504", "528|501",
  "540|507", "528|502", "528|503", "542|504", "551|506", "529|505", "539|496", "554|504", "550|508", "527|502", "567|517", "554|505",
  "563|516", "567|516", "564|524", "564|515", "570|510", "570|514", "569|513", "567|519", "526|528", "524|531", "526|522", "522|526",
  "527|531", "525|528", "525|527", "525|529", "528|532", "540|547", "527|523", "529|529", "528|526", "540|543", "539|545", "538|546",
  "540|551", "540|545", "545|546", "538|550", "541|551", "523|523", "537|554", "544|551", "543|545", "543|544", "541|547", "524|532",
  "528|539", "522|525", "529|539", "523|526", "532|539", "538|544", "521|528", "545|551", "545|549", "543|549", "506|521", "501|521",
  "502|518", "504|519", "503|521", "504|516", "509|518", "509|519", "505|519", "508|520", "505|520", "512|521", "506|522", "505|521",
  "537|537", "539|537", "540|537", "539|534", "541|535", "539|540", "539|533", "542|539", "538|535", "536|537", "538|536", "540|539",
  "535|534", "535|537", "545|542", "539|538", "535|538", "548|543", "525|543", "526|546", "525|540", "527|545", "528|545", "525|547",
  "527|542", "527|546", "527|547", "525|551", "525|550", "524|550", "523|551", "529|542", "521|545", "528|541", "520|544", "528|543",
  "521|548", "533|552", "527|548", "531|549", "544|492", "545|492", "543|493", "541|492", "544|491", "540|490", "542|496", "541|488",
  "542|488", "545|491", "565|498", "546|493", "543|497", "529|536", "528|535", "524|538", "528|534", "526|533", "527|537", "530|534",
  "528|533", "522|541", "523|535", "524|534", "517|538", "520|541", "514|544", "521|540", "513|544", "515|546", "527|533", "515|542",
  "514|542", "520|539", "524|533", "532|534", "518|542", "518|533", "515|537", "537|544", "535|554", "535|551", "534|551", "534|547",
  "535|547", "535|548", "535|546", "536|543", "532|542", "533|546", "533|543", "531|545", "532|546", "534|542", "531|543", "535|540",
  "530|544", "553|515", "554|511", "555|509", "556|509", "550|514", "553|513", "558|506", "554|515", "550|518", "554|517", "560|509",
  "556|505", "557|506", "560|519", "549|518", "555|519", "553|519", "559|509", "555|521", "554|521", "552|521", "558|519", "549|516",
  "554|518", "550|520", "562|510", "547|516", "520|469", "519|469", "519|470", "518|470", "518|471", "517|471", "517|472", "502|497",
  "501|488", "501|486", "499|490", "503|487", "503|499", "501|484", "502|484", "502|486", "501|496", "501|491", "503|492", "501|494",
  "503|493", "504|500", "500|498", "500|497", "505|499", "505|489", "504|498", "505|487", "501|492", "508|495", "538|457", "555|503",
  "555|501", "559|502", "557|500", "556|501", "561|501", "562|500", "563|496", "561|496", "561|498", "556|503", "558|504", "560|500",
  "562|501", "559|496", "559|497", "559|504", "558|498", "513|475", "513|477", "516|473", "512|473", "512|477", "510|478", "517|475",
  "509|471", "510|471", "509|477", "555|467", "556|466", "556|467", "515|478", "503|482", "517|474", "511|480", "509|486", "511|475",
  "519|477", "516|474", "511|474", "507|474", "513|473", "506|473", "514|472", "517|473", "514|471", "516|478", "510|481", "515|476",
  "521|478", "508|475", "509|475", "517|478", "521|477", "516|470", "518|476", "511|471", "520|477", "534|450", "532|450", "535|445",
  "536|447", "534|452", "534|451", "518|494", "520|493", "515|490", "512|494", "512|493", "513|493", "514|493", "515|493", "516|493",
  "517|494", "520|496", "521|497", "520|495", "531|494", "530|494", "531|492", "527|491", "529|493", "528|492", "528|494", "528|493",
  "534|491", "526|494", "532|489", "532|491", "535|492", "530|489", "530|491", "531|488", "536|492", "513|526", "513|524", "509|528",
  "542|450", "541|451", "544|449", "543|451", "540|456", "541|454", "542|459", "549|450", "545|446", "539|454", "550|456", "552|459",
  "552|458", "554|459", "553|461", "544|448", "554|460", "554|463", "544|445", "545|458", "511|466", "509|464", "507|467", "508|466",
  "511|464", "512|462", "510|467", "508|461", "506|460", "510|469", "508|469", "512|469", "508|462", "512|466", "510|462", "510|465",
  "512|468", "506|470", "509|467", "506|466", "506|465", "510|460", "509|462", "510|463", "515|435", "515|440", "512|438", "513|439",
  "514|438", "517|435", "513|435", "514|436", "516|435", "513|430", "514|430", "513|432", "512|434", "541|477", "544|480", "543|477",
  "544|477", "550|475", "535|477", "537|475", "539|474", "555|479", "540|480", "542|478", "548|480", "551|480", "544|475", "547|478",
  "544|479", "548|479", "558|469", "559|471", "560|472", "562|477", "562|479", "564|476", "557|470", "558|471", "559|470", "564|478",
  "560|471", "556|471", "567|478", "524|481", "525|482", "521|483", "523|485", "525|484", "525|488", "522|485", "519|488", "522|489",
  "519|485", "520|485", "519|487", "523|489", "521|490", "522|488", "523|482", "524|486", "521|482", "544|469", "546|467", "544|463",
  "543|465", "542|471", "543|473", "546|473", "541|470", "543|469", "512|482", "512|485", "513|479", "512|486", "513|480", "513|487",
  "513|482", "512|483", "500|481", "498|479", "497|477", "497|480", "501|481", "503|479", "498|480", "496|479", "515|467", "521|467",
  "521|466", "517|464", "517|468", "516|467", "518|464", "521|465", "520|465", "522|466", "514|469", "514|462", "516|461", "519|460",
  "510|445", "511|445", "509|447", "511|447", "507|450", "519|437", "495|494", "491|490", "496|493", "495|495", "492|485", "494|494",
  "494|486", "489|488", "489|487", "495|489", "493|489", "493|487", "489|496", "487|496", "488|495", "492|490", "496|489", "493|486",
  "497|489", "491|485", "494|488", "496|495", "496|494", "490|491", "493|495", "455|446", "459|449", "497|433", "494|435", "496|444",
  "511|432", "508|439", "500|445", "508|442", "500|442", "498|439", "507|429", "495|433", "499|440", "510|438", "493|437", "502|439",
  "499|434", "494|440", "494|436", "503|446", "503|440", "501|457", "499|438", "498|463", "499|455", "510|431", "499|435", "499|448",
  "502|458", "500|456", "497|454", "507|440", "499|442", "495|443", "507|444", "508|438", "510|437", "505|432", "502|448", "502|454",
  "509|434", "506|445", "510|436", "501|436", "506|430", "508|430", "495|471", "497|463", "494|457", "496|458", "497|466", "498|465",
  "494|468", "496|461", "494|458", "494|469", "496|463", "502|471", "501|470", "502|470", "498|462", "499|460", "499|461", "499|473",
  "501|467", "501|471", "501|468", "501|465", "495|461", "500|473", "498|471", "503|462", "501|464", "500|468", "499|471", "500|471",
  "498|470", "487|436", "485|437", "488|439", "485|440", "482|438", "487|434", "488|442", "487|440", "483|439", "486|438", "483|438",
  "482|434", "490|433", "482|433", "479|435", "479|434", "494|432", "488|432", "487|433", "493|432", "497|436", "493|429", "486|439",
  "481|433", "481|432", "488|437", "498|429", "482|439", "488|430", "491|429", "523|529", "518|534", "520|533", "520|526", "521|530",
  "521|529", "515|527", "522|529", "520|531", "521|533", "516|537", "513|549", "531|482", "532|478", "529|484", "530|482", "529|476",
  "529|482", "531|479", "530|480", "528|482", "527|480", "526|477", "528|475", "530|475", "527|474", "533|475", "530|471", "528|486",
  "531|485", "548|461", "548|460", "553|462", "551|460", "550|465", "551|462", "552|461", "552|462", "546|465", "552|463", "553|463",
  "505|478", "502|475", "505|476", "506|478", "502|474", "508|478", "504|473", "558|470", "505|470", "509|479", "545|500", "545|497",
  "546|497", "546|501", "544|500", "546|503", "548|502", "547|500", "552|488", "551|488", "551|487", "550|491", "553|486", "556|492",
  "557|493", "551|495", "555|495", "555|496", "552|492", "550|495", "551|492", "550|496", "549|492", "551|498", "552|499", "553|497",
  "553|498", "519|459", "521|456", "519|455", "524|457", "523|457", "519|457", "520|457", "525|452", "528|453", "525|453", "528|454",
  "529|453", "529|455", "527|456", "530|455", "524|455", "527|458", "518|442", "516|443", "519|443", "516|442", "520|445", "526|437",
  "524|441", "524|439", "522|438", "522|437", "518|436", "517|439", "517|441", "519|439", "543|505", "540|503", "550|507", "549|505",
  "543|511", "536|500", "535|500", "533|500", "533|499", "536|499", "535|499", "535|495", "538|499", "533|495", "532|498", "534|497",
  "532|496", "523|516", "522|513", "520|514", "524|519", "521|518", "523|517", "519|512", "522|511", "519|513", "523|511", "524|514",
  "518|514", "521|517", "523|519", "522|518", "523|518", "523|515", "522|510", "544|536", "546|538", "543|535", "547|539", "549|542",
  "529|520", "530|522", "526|518", "528|520", "528|521", "529|517", "524|522", "525|522", "523|522", "545|521", "524|521", "526|512",
  "529|521", "531|517", "530|515", "529|512", "532|514", "544|527", "543|526", "543|528", "546|529", "547|524", "544|525", "547|526",
  "546|524", "548|525", "546|525", "531|499", "532|503", "514|465", "511|463", "518|462", "513|467", "516|463", "510|459", "506|461",
  "516|462", "512|455", "531|509", "527|517", "529|515", "528|512", "528|514", "528|506", "528|508", "531|511", "527|508", "525|507",
  "525|509", "531|513", "529|507", "554|525", "555|526", "553|527", "551|533", "557|530", "549|532", "560|524", "549|528", "560|523",
  "552|530", "558|521", "558|527", "556|532", "550|527", "554|526", "555|532", "566|520", "560|531", "550|523", "546|526", "560|527",
  "549|529", "552|532", "549|522", "547|529", "547|530", "562|526", "544|532", "557|525", "555|525", "553|528", "552|529", "557|533",
  "538|519", "536|515", "536|518", "538|514", "540|514", "540|516", "537|515", "544|517", "542|516", "545|519", "544|519", "543|514",
  "543|518", "541|518", "537|519", "543|517", "535|514", "539|518", "539|514", "564|506", "563|510", "564|512", "564|508", "565|510",
  "538|518", "537|517", "537|516", "564|507", "531|531", "532|532", "533|526", "532|527", "535|528", "535|529", "534|524", "537|526",
  "537|529", "538|523", "538|524", "537|525", "530|525", "535|525", "527|555", "528|554", "529|555", "526|562", "527|556", "527|557",
  "529|553", "532|558", "528|561", "531|553", "525|561", "527|553", "526|563", "531|558", "530|555", "527|563", "527|562", "525|535",
  "522|536", "529|535", "522|533", "554|453", "537|532", "537|531", "536|532", "538|533", "540|531", "534|533", "534|534", "542|534",
  "542|535", "550|501", "551|502", "552|502", "551|503", "552|501", "552|503", "551|501", "566|501", "567|502", "566|503", "568|500",
  "511|562", "510|564", "513|561", "512|557", "508|562", "510|561", "508|563", "512|567", "515|565", "515|561", "513|564", "512|563",
  "515|560", "512|552", "514|569", "509|564", "512|569", "542|555", "527|552", "526|552", "529|551", "526|554"
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
  ignoreHeavyEnabled: document.getElementById("ignoreHeavyEnabled"),
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

function travelSeconds(from,to,unit,speed,unitSpeed,supportTimeReductionPercent = 0){
  const fields = distance(from,to);
  const reduction = Number(supportTimeReductionPercent || 0);
  const timeFactor = Math.max(0.01, 1 - reduction / 100);
  const minutes = UNIT_BASE_MINUTES[unit] * fields / speed / unitSpeed * timeFactor;
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
  return Math.floor(weight / 1000) * 1000;
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

function getVillageId(coord){
  if(typeof VILLAGE_ID_BY_COORD === "undefined") return null;
  return VILLAGE_ID_BY_COORD[coord] || null;
}

function getSupportUrl(sourceCoord,bunkerCoord){
  const senderId = getVillageId(sourceCoord);
  const targetId = getVillageId(bunkerCoord);
  if(!senderId || !targetId) return null;
  return `game.php?village=${senderId}&screen=place&target=${targetId}`;
}

function getSettings(){
  return {
    worldSpeed: Number(els.worldSpeed.value),
    unitSpeed: Number(els.unitSpeed.value),
    defaultBunkerTarget: els.defaultBunkerTarget.value,
    defaultBunkerArrival: els.defaultBunkerArrival.value,
    bunkers: bunkerRows.map(row => ({ ...row })),
    maxSenderPerBunker: "",
    outputSort: els.outputSort.value,
    troopCsv: els.troopCsv.value,
    friendlyRows: friendlyRows.map(row => ({ ...row })),
    minPacketEnabled: els.minPacketEnabled.checked,
    minPacketWeight: els.minPacketWeight.value,
    minPacketRoundingEnabled: els.minPacketRoundingEnabled.checked,
    ignoreHeavyEnabled: els.ignoreHeavyEnabled.checked
  };
}

function setSettings(settings){
  if(settings.worldSpeed !== undefined && settings.worldSpeed !== "") els.worldSpeed.value = settings.worldSpeed;
  if(settings.unitSpeed !== undefined && settings.unitSpeed !== "") els.unitSpeed.value = settings.unitSpeed;
  if(settings.defaultBunkerTarget !== undefined) els.defaultBunkerTarget.value = settings.defaultBunkerTarget;
  if(settings.defaultBunkerArrival !== undefined) els.defaultBunkerArrival.value = settings.defaultBunkerArrival;
  if(settings.bunkers !== undefined) bunkerRows = normalizeBunkers(settings.bunkers);
  if(settings.outputSort !== undefined) els.outputSort.value = settings.outputSort;
  if(settings.troopCsv !== undefined) els.troopCsv.value = settings.troopCsv;
  if(settings.friendlyRows !== undefined) friendlyRows = normalizeFriendlyRows(settings.friendlyRows);
  if(settings.minPacketEnabled !== undefined) els.minPacketEnabled.checked = Boolean(settings.minPacketEnabled);
  if(settings.minPacketWeight !== undefined) els.minPacketWeight.value = settings.minPacketWeight;
  if(settings.minPacketRoundingEnabled !== undefined) els.minPacketRoundingEnabled.checked = Boolean(settings.minPacketRoundingEnabled);
  if(settings.ignoreHeavyEnabled !== undefined) els.ignoreHeavyEnabled.checked = Boolean(settings.ignoreHeavyEnabled);
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
  if(bunkers.some(b => !Number.isFinite(b.supportSlowdown) || b.supportSlowdown < 0 || b.supportSlowdown >= 100)) throw new Error("La riduzione tempi supporti deve essere vuota, 0, o un numero tra 1 e 99.");
  if(!enemies.length) throw new Error("Lista nemici statica vuota. Modifica STATIC_ENEMY_VILLAGES in app.js.");
  if(!sources.length) throw new Error("Incolla almeno un villaggio amico con spear, sword o heavy.");

  const minPacket = Number(settings.minPacketWeight);
  if(settings.minPacketEnabled && (!Number.isFinite(minPacket) || minPacket <= 0)) throw new Error("Il peso minimo comando deve essere maggiore di zero.");

}

function sortSourcesForBunker(sources,bunker){
  return sources.slice().sort((a,b) => {
    const enemySort = b.enemyDistance - a.enemyDistance;
    if(enemySort) return enemySort;

    const bunkerSort = distance(b,bunker) - distance(a,bunker);
    if(bunkerSort) return bunkerSort;

    return b.weight - a.weight;
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
      if(command.supportUrl) lines.push(`[url=${command.supportUrl}]Support[/url]`);
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
      if(command.supportUrl) lines.push(`[url=${command.supportUrl}]Support[/url]`);
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
  const ignoreHeavy = Boolean(settings.ignoreHeavyEnabled);
  let sources = getActiveFriendlySources();

  sources = sources.map(source => {
    const normalized = ignoreHeavy
      ? { ...source, heavy: 0, weight: source.spear + source.sword }
      : { ...source };
    return {
      ...normalized,
      enemyDistance: minDistanceToEnemies(normalized,enemies)
    };
  }).filter(source => source.weight > 0);

  validate(settings,bunkers,enemies,sources);

  const lines = [];
  const warnings = [];
  let totalSentWeight = 0;
  let totalMissing = 0;
  let commandCount = 0;
  let skippedSmallSources = 0;
  let smallFinalCommands = 0;
  const now = getItalyNow();

  for(const [bunkerIndex, bunker] of bunkers.entries()){
    let remaining = Math.round(bunker.target);
    let sentHere = 0;
    const bunkerCommands = [];

    if(bunkerIndex > 0){
      lines.push("=========================================");
      lines.push("");
    }

    lines.push(`[b]BUNKER[/b] ${bunker.coord}`);
    lines.push("");
    lines.push(`Target: ${bunker.target}`);
    lines.push(`Arrivo: ${formatDateTime(bunker.arrival)}`);
    lines.push("");

    const sortedSources = sortSourcesForBunker(sources,bunker);
    for(const source of sortedSources){
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
      if(planWeight <= 0){
        restoreDefense(source,send);
        skippedSmallSources += 1;
        continue;
      }

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
        enemyDistance: source.enemyDistance,
        supportUrl: getSupportUrl(source.coord,bunker.coord)
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
      const warning = `Bunker ${bunker.coord} non completato. Mancano ${remaining}.`;
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
    ignoreHeavyEnabled: false,
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
      outputSort: "player",
      troopCsv: "",
      minPacketEnabled: true,
      minPacketWeight: 1000,
      minPacketRoundingEnabled: true,
      ignoreHeavyEnabled: false,
      bunkers: [],
      friendlyRows: []
    });
    els.bunkerCoordsInput.value = "";
    els.resultBox.value = "";
    els.summaryBox.textContent = "";
    showWarnings([]);
    clearError();
  });

  for(const element of [els.worldSpeed,els.unitSpeed,els.defaultBunkerTarget,els.defaultBunkerArrival,els.outputSort,els.troopCsv,els.minPacketEnabled,els.minPacketWeight,els.minPacketRoundingEnabled,els.ignoreHeavyEnabled]){
    element.addEventListener("input", persist);
  }
}

loadSaved();
bind();
