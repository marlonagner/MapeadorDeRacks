// ========================
// ELEMENTOS PRINCIPAIS
// ========================
const switchesDiv = document.getElementById("switches");
const patchesDiv = document.getElementById("patches");
const svg = document.getElementById("svgLines");
const info = document.getElementById("info");

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
// MAPEAMENTO INICIAL
// ========================
const mapping = {
  "switch1-Porta3": { target: "PatchPanel1-Porta37", vlan: 20 },
  "switch3-Porta5": { target: "PatchPanel3-Porta44", vlan: 20 },
  "switch3-Porta20": { target: "PatchPanel3-Porta43", vlan: 20 },
  "switch3-Porta19": { target: "PatchPanel2-Porta36", vlan: 20 }
};

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
// CLICK NAS PORTAS (LINHAS)
// ========================
let ativo = null;
const linhasAtivas = {}; // guarda linhas ativas por porta

document.addEventListener("click", function(e){
  if (!e.target.classList.contains("port")) return;

  const id = e.target.id;

  // se clicar na mesma porta ativa, remove linha
  if (ativo === id) {
    if (linhasAtivas[id]) {
      linhasAtivas[id].remove();
      delete linhasAtivas[id];
    }
    ativo = null;
    info.innerText = "Clique em uma porta";
    document.querySelectorAll(".port").forEach(x => x.classList.remove("active"));
    return;
  }

  // limpa todas as linhas existentes antes
  Object.keys(linhasAtivas).forEach(k => {
    linhasAtivas[k].remove();
    delete linhasAtivas[k];
  });

  document.querySelectorAll(".port").forEach(x => x.classList.remove("active"));

  const map = mapping[id];
  if (!map) {
    info.innerText = "Sem mapeamento";
    return;
  }

  const destino = document.getElementById(map.target);
  const l = desenharLinha(e.target, destino);
  linhasAtivas[id] = l;

  ativo = id;
  e.target.classList.add("active");
  destino.classList.add("active");

  info.innerText = `${id} → ${map.target} | VLAN ${map.vlan}`;
  destino.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ========================
// FORMULÁRIO DINÂMICO
// ========================
const mappingForm = document.getElementById("mappingForm");

mappingForm.addEventListener("submit", function(e){
  e.preventDefault();

  const formData = new FormData(mappingForm);
  const sw = formData.get("switch");
  const swPort = formData.get("switchPort");
  const pp = formData.get("patchPanel");
  const ppPort = formData.get("patchPort");
  const vlan = formData.get("vlan");

  const key = `${sw}-Porta${swPort}`;
  const value = { target: `${pp}-Porta${ppPort}`, vlan: parseInt(vlan) };

  // Adiciona ao mapping
  mapping[key] = value;

  // resetar formulário
  mappingForm.reset();
});