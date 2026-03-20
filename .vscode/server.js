const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html e scripts

const DATA_PATH = path.join(__dirname, "data", "mapping.json");

// GET: retorna todos os mapeamentos
app.get("/mapping", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  res.json(data);
});

// POST: adiciona ou atualiza um mapeamento
app.post("/mapping", (req, res) => {
  const newMapping = req.body; // { "switch1-Porta5": { target: "...", vlan: 20 } }
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

  Object.assign(data, newMapping); // atualiza ou adiciona
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json({ status: "ok", saved: newMapping });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));