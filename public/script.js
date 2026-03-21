const switchesDiv = document.getElementById("switches");
const patchesDiv = document.getElementById("patches");
const svg = document.getElementById("svgLines");
const info = document.getElementById("info");
let linha = null;
let ativo = null;

// ========================
// CARREGAR MAPEAMENTOS DO LOCALSTORAGE
// ========================
let mapping = JSON.parse(localStorage.getItem("mapping") || "{}");

// ========================
// CRIAR SWITCHES (4x26 portas)
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
// CRIAR PATCH PANELS (3x48 portas)
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
// DESENHAR LINHA
// ========================
function desenharLinha(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();

  const x1 = r1.left + r1.width / 2 + window.scrollX;
  const y1 = r1.top + r1.height / 2 + window.scrollY;

  const x2 = r2.left + r2.width / 2 + window.scrollX;
  const y2 = r2.top + r2.height / 2 + window.scrollY;

  const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.setAttribute("stroke", "#00ffcc");
  l.setAttribute("stroke-width", "3");

  svg.appendChild(l);
  return l;
}

// ========================
// CLICK NAS PORTAS
// ========================
document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("port")) return;
  const id = e.target.id;

  if (ativo === id) {
    if (linha) linha.remove();
    linha = null;
    ativo = null;
    info.innerText = "Clique em uma porta";
    document.querySelectorAll(".port").forEach(x => x.classList.remove("active"));
    return;
  }

  if (linha) linha.remove();
  document.querySelectorAll(".port").forEach(x => x.classList.remove("active"));

  const map = mapping[id] || Object.entries(mapping).find(([k,v]) => v.target === id)?.[1];

  if (!map) {
    info.innerText = "Sem mapeamento";
    return;
  }

  const destino = document.getElementById(map.target);
  if (!destino) return;

  linha = desenharLinha(e.target, destino);
  ativo = id;

  e.target.classList.add("active");
  destino.classList.add("active");
  info.innerText = `${id} → ${map.target} | VLAN ${map.vlan}`;
  destino.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ========================
// FORMULÁRIO ADICIONAR/ATUALIZAR
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

  alert("Mapeamento salvo!");
});

// ========================
// EXPORTAR JSON
// ========================
document.getElementById("exportBtn").addEventListener("click", function(){
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapping, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "mapping.json");
  dlAnchor.click();
});

// ========================
// IMPORTAR JSON
// ========================
document.getElementById("importFile").addEventListener("change", function(e){
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    mapping = JSON.parse(evt.target.result);
    localStorage.setItem("mapping", JSON.stringify(mapping));
    alert("JSON importado com sucesso!");
    window.location.reload(); // recarrega para desenhar linhas
  }
  reader.readAsText(file);
});

// ========================
// BACKUP AUTOMÁTICO AO FECHAR PÁGINA
// ========================
function backupAutomatico() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapping, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `mapping-backup-${new Date().toISOString().slice(0,10)}.json`);
  dlAnchor.click();
}

// Backup ao fechar/atualizar a página
window.addEventListener("beforeunload", function(){
  backupAutomatico();
});

// Backup manual extra
const manualBackupBtn = document.createElement("button");
manualBackupBtn.innerText = "Backup Manual";
manualBackupBtn.style.marginTop = "10px";
manualBackupBtn.onclick = backupAutomatico;
document.getElementById("form-container").appendChild(manualBackupBtn);

// ========================
// CARREGAR LINHAS EXISTENTES AO INICIAR
// ========================
window.addEventListener("load", function(){
  for (let key in mapping) {
    const sourceEl = document.getElementById(key);
    const targetEl = document.getElementById(mapping[key].target);
    if (sourceEl && targetEl) {
      desenharLinha(sourceEl, targetEl);
    }
  }
});