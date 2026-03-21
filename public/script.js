const switchesDiv = document.getElementById("switches");
const patchesDiv = document.getElementById("patches");
const canvas = document.getElementById("canvasLines");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

// Ajusta o canvas para o tamanho do container
function resizeCanvas() {
  canvas.width = document.getElementById("rack-container").offsetWidth;
  canvas.height = document.getElementById("rack-container").offsetHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ========================
// LocalStorage
// ========================
let mapping = JSON.parse(localStorage.getItem("mapping") || "{}");

// ========================
// Criar Switches
// ========================
for (let s = 1; s <= 4; s++) {
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
    p.id = `switch${s}-Porta${i}`;
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
    el.id = `PatchPanel${p}-Porta${i}`;
    portsDiv.appendChild(el);
  }

  box.appendChild(title);
  box.appendChild(portsDiv);
  patchesDiv.appendChild(box);
}

// ========================
// Função para desenhar linha no canvas
// ========================
function drawLine(a, b) {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();
  const containerRect = document.getElementById("rack-container").getBoundingClientRect();

  // Coordenadas relativas ao container
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

// ========================
// Desenhar todas linhas do mapping
// ========================
function redrawAllLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let key in mapping) {
    const sourceEl = document.getElementById(key);
    const targetEl = document.getElementById(mapping[key].target);
    if (sourceEl && targetEl) drawLine(sourceEl, targetEl);
  }
}

// ========================
// Clique nas portas
// ========================
document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("port")) return;

  document.querySelectorAll(".port").forEach(x => x.classList.remove("active"));
  e.target.classList.add("active");

  // Limpa canvas temporário e redesenha todas linhas
  redrawAllLines();

  const id = e.target.id;
  let sourceId = id;
  let targetId = null;
  let vlan = null;

  if (mapping[id]) { // porta é source
    targetId = mapping[id].target;
    vlan = mapping[id].vlan;
  } else { 
    // porta é target
    const entry = Object.entries(mapping).find(([k,v]) => v.target === id);
    if (entry) {
      sourceId = entry[0];
      targetId = id;
      vlan = entry[1].vlan;
    }
  }

  if (!targetId) {
    info.innerText = "Sem mapeamento";
    return;
  }

  const sourceEl = document.getElementById(sourceId);
  const targetEl = document.getElementById(targetId);
  if (!sourceEl || !targetEl) return;

  drawLine(sourceEl, targetEl);
  sourceEl.classList.add("active");
  targetEl.classList.add("active");
  info.innerText = `${sourceId} → ${targetId} | VLAN ${vlan}`;
  targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ========================
// Formulário salvar mapping
// ========================
document.getElementById("mappingForm").addEventListener("submit", function(e){
  e.preventDefault();
  const s = document.getElementById("switch").value;
  const sp = document.getElementById("switchPort").value;
  const p = document.getElementById("patchPanel").value;
  const pp = document.getElementById("patchPort").value;
  const vlan = document.getElementById("vlan").value;

  const key = `${s}-Porta${sp}`;
  const target = `${p}-Porta${pp}`;
  mapping[key] = { target, vlan: parseInt(vlan) };
  localStorage.setItem("mapping", JSON.stringify(mapping));
  redrawAllLines();
  alert("Mapeamento salvo!");
});

// ========================
// Export JSON
// ========================
document.getElementById("exportBtn").addEventListener("click", function(){
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapping, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "mapping.json");
  dlAnchor.click();
});

// ========================
// Import JSON
// ========================
document.getElementById("importFile").addEventListener("change", function(e){
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    mapping = JSON.parse(evt.target.result);
    localStorage.setItem("mapping", JSON.stringify(mapping));
    alert("JSON importado com sucesso!");
    redrawAllLines();
  }
  reader.readAsText(file);
});

// ========================
// Backup manual
// ========================
document.getElementById("manualBackupBtn").addEventListener("click", function(){
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapping, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `mapping-backup-${new Date().toISOString().slice(0,10)}.json`);
  dlAnchor.click();
});

// ========================
// Inicializar
// ========================
window.addEventListener("load", redrawAllLines);