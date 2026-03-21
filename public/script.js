const switchesDiv = document.getElementById("switches");
const patchesDiv = document.getElementById("patches");
const svg = document.getElementById("svgLines");
const info = document.getElementById("info");

const mapping = {}; // objeto de mapeamentos
let ativo = null;
const linhasAtivas = {};

// ========================
// CARREGAR MAPEAMENTOS DO BACKEND
// ========================
async function loadMapping() {
  try {
    const res = await fetch("/mapping");
    const data = await res.json();
    Object.assign(mapping, data);
  } catch (err) {
    console.error("Erro ao carregar mapping:", err);
  }
}

// ========================
// FUNÇÃO PARA SALVAR MAPEAMENTO NO BACKEND
// ========================
async function saveMapping(key, value) {
  const payload = {};
  payload[key] = value;
  try {
    await fetch("/mapping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    mapping[key] = value; // atualiza local também
  } catch (err) {
    console.error("Erro ao salvar mapping:", err);
  }
}

// ========================
// CRIAR SWITCHES (4x 26 portas)
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
// CRIAR PATCH PANELS (3x 48 portas)
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
// FUNÇÃO PARA DESENHAR LINHA
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
// MAPPEAMENTO REVERSO (PATCH PANEL → SWITCH)
// ========================
function getReverseMapping(portId) {
  for (const swPort in mapping) {
    if (mapping[swPort].target === portId) {
      return { origem: swPort, vlan: mapping[swPort].vlan };
    }
  }
  return null;
}

// ========================
// CLICK NAS PORTAS (SWITCH OU PATCH PANEL)
// ========================
document.addEventListener("click", function(e){
  if (!e.target.classList.contains("port")) return;

  const id = e.target.id;
  let origemId, destinoId, vlan;

  if (mapping[id]) {
    origemId = id;
    destinoId = mapping[id].target;
    vlan = mapping[id].vlan;
  } else {
    const rev = getReverseMapping(id);
    if (!rev) {
      info.innerText = "Sem mapeamento";
      return;
    }
    origemId = rev.origem;
    destinoId = id;
    vlan = rev.vlan;
  }

  if (ativo === origemId) {
    if (linhasAtivas[origemId]) {
      linhasAtivas[origemId].remove();
      delete linhasAtivas[origemId];
    }
    ativo = null;
    info.innerText = "Clique em uma porta";
    document.querySelectorAll(".port").forEach(x => x.classList.remove("active"));
    return;
  }

  Object.keys(linhasAtivas).forEach(k => {
    linhasAtivas[k].remove();
    delete linhasAtivas[k];
  });
  document.querySelectorAll(".port").forEach(x => x.classList.remove("active"));

  const origemEl = document.getElementById(origemId);
  const destinoEl = document.getElementById(destinoId);
  const l = desenharLinha(origemEl, destinoEl);
  linhasAtivas[origemId] = l;

  ativo = origemId;
  origemEl.classList.add("active");
  destinoEl.classList.add("active");

  info.innerText = `${origemId} → ${destinoId} | VLAN ${vlan}`;
  destinoEl.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ========================
// FORMULÁRIO DINÂMICO
// ========================
const mappingForm = document.getElementById("mappingForm");

mappingForm.addEventListener("submit", async function(e){
  e.preventDefault();

  const formData = new FormData(mappingForm);
  const sw = formData.get("switch");
  const swPort = formData.get("switchPort");
  const pp = formData.get("patchPanel");
  const ppPort = formData.get("patchPort");
  const vlan = formData.get("vlan");

  const key = `${sw}-Porta${swPort}`;
  const value = { target: `${pp}-Porta${ppPort}`, vlan: parseInt(vlan) };

  await saveMapping(key, value);
  mappingForm.reset();
});

// ========================
// INICIALIZAÇÃO
// ========================
loadMapping();