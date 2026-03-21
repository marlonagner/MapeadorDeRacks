document.addEventListener("DOMContentLoaded", function() {

const switchesDiv = document.getElementById("switches");
const patchesDiv = document.getElementById("patches");
const canvas = document.getElementById("canvasLines");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

// Ajustar canvas
function resizeCanvas() {
  canvas.width = document.getElementById("rack-container").offsetWidth;
  canvas.height = document.getElementById("rack-container").offsetHeight;
}
window.addEventListener("resize", resizeCanvas);

// LocalStorage
let mapping = JSON.parse(localStorage.getItem("mapping") || "{}");

let switchNames = [];
let patchNames = [];

// ========================
// Criar Switches
// ========================
for (let s = 1; s <= 4; s++) {
  const switchName = `switch${s}`;
  switchNames.push(switchName);

  const box = document.createElement("div");
  box.className = "device";

  const title = document.createElement("div");
  title.className = "title";
  title.innerText = "Switch " + s;

  const portsDiv = document.createElement("div");
  portsDiv.className = "ports";

  for (let i = 1; i <= 26; i++) {
    const p = document.createElement("div");
    p.className = "port";
    p.innerText = i;
    p.id = `${switchName}-Porta${i}`;
    portsDiv.appendChild(p);
  }

  box.appendChild(title);
  box.appendChild(portsDiv);
  switchesDiv.appendChild(box);
}

// ========================
// Criar Patch Panels
// ========================
for (let p = 1; p <= 3; p++) {
  const patchName = `PatchPanel${p}`;
  patchNames.push(patchName);

  const box = document.createElement("div");
  box.className = "device";

  const title = document.createElement("div");
  title.className = "title";
  title.innerText = "Patch Panel " + p;

  const portsDiv = document.createElement("div");
  portsDiv.className = "ports";

  for (let i = 1; i <= 48; i++) {
    const el = document.createElement("div");
    el.className = "port";
    el.innerText = i;
    el.id = `${patchName}-Porta${i}`;
    portsDiv.appendChild(el);
  }

  box.appendChild(title);
  box.appendChild(portsDiv);
  patchesDiv.appendChild(box);
}

// AGORA SIM → depois de criar tudo
resizeCanvas();

// ========================
// SELECTS (CORRIGIDO)
// ========================
const switchSelect = document.getElementById("switchSelect");
const switchPort = document.getElementById("switchPort");
const patchSelect = document.getElementById("patchSelect");
const patchPort = document.getElementById("patchPort");

// Preencher switches
switchNames.forEach(name => {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  switchSelect.appendChild(opt);
});

// Preencher patch panels
patchNames.forEach(name => {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  patchSelect.appendChild(opt);
});

// Função portas
function populatePorts(select, total) {
  select.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    select.appendChild(opt);
  }
}

// Inicializar
populatePorts(switchPort, 26);
populatePorts(patchPort, 48);

// ========================
// CANVAS
// ========================
function drawLine(a, b) {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();
  const containerRect = document.getElementById("rack-container").getBoundingClientRect();

  const x1 = rectA.left + rectA.width/2 - containerRect.left;
  const y1 = rectA.top + rectA.height/2 - containerRect.top;
  const x2 = rectB.left + rectB.width/2 - containerRect.left;
  const y2 = rectB.top + rectB.height/2 - containerRect.top;

  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function redrawAllLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let key in mapping) {
    const s = document.getElementById(key);
    const t = document.getElementById(mapping[key].target);
    if (s && t) drawLine(s, t);
  }
}

// ========================
// CLICK PORTAS
// ========================
document.addEventListener("click", function(e){
  if (!e.target.classList.contains("port")) return;

  redrawAllLines();

  const id = e.target.id;

  if (mapping[id]) {
    const target = document.getElementById(mapping[id].target);
    drawLine(e.target, target);
    info.innerText = `${id} → ${mapping[id].target} | VLAN ${mapping[id].vlan}`;
  }
});

// ========================
// FORM
// ========================
document.getElementById("mappingForm").addEventListener("submit", function(e){
  e.preventDefault();

  const key = `${switchSelect.value}-Porta${switchPort.value}`;
  const target = `${patchSelect.value}-Porta${patchPort.value}`;
  const vlan = document.getElementById("vlan").value;

  mapping[key] = { target, vlan: parseInt(vlan) };
  localStorage.setItem("mapping", JSON.stringify(mapping));

  redrawAllLines();
  alert("Salvo!");
});

window.addEventListener("load", redrawAllLines);

});