const switchesDiv = document.getElementById("switches");
const patchesDiv = document.getElementById("patches");

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
    p.id = `sw${s}-${i}`;
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
    el.id = `pp${p}-${i}`;
    portsDiv.appendChild(el);
  }

  box.appendChild(title);
  box.appendChild(portsDiv);
  patchesDiv.appendChild(box);
}

// ========================
// MAPEAMENTO
// ========================
//Aqui é onde a gente coloca qual switch e porta, qual patch panel e porta, e qual VLAN.
//é só ir acrescentando mais linhas nesse formato abaixo:
const mapping = {
  "sw1-3": { target: "pp1-37", vlan: 20 },
 
   "sw3-5": { target: "pp3-44", vlan: 20 },

   "sw3-20": { target: "pp3-43", vlan: 20 },

   "sw3-19": { target: "pp2-86", vlan: 20 }
};

// ========================
// LÓGICA
// ========================

const svg = document.getElementById("svgLines");
const info = document.getElementById("info");

let linha = null;
let ativo = null;

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

  const map = mapping[id];

  if (!map) {
    info.innerText = "Sem mapeamento";
    return;
  }

  const destino = document.getElementById(map.target);

  linha = desenharLinha(e.target, destino);
  ativo = id;

  e.target.classList.add("active");
  destino.classList.add("active");

  info.innerText = `${id} → ${map.target} | VLAN ${map.vlan}`;

  destino.scrollIntoView({ behavior: "smooth", block: "center" });

});