// server/index.cjs — Express + site build (CommonJS) para Render/produção

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// ===== Persistência simples em arquivo =====
const DATA_DIR = __dirname;
const DB_PATH = path.join(DATA_DIR, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const init = {
      next_id: 1,
      price: 250001, // começa em 250.001 Gs
      registrations: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro lendo DB, recriando...', e);
    const init = { next_id: 1, price: 250001, registrations: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
}
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// ===== Rotas API =====

// Preço atual (mostra o “Gs” que vai para a próxima inscrição)
app.get('/api/price', (_req, res) => {
  const db = loadDB();
  res.json({ current_price: db.price });
});

// Criar inscrição (documento único) + incrementa 1 Gs para a próxima
app.post('/api/register', (req, res) => {
  const db = loadDB();
  const p = req.body || {};

  if (!p.documento) {
    return res.status(400).json({ error: 'Documento é obrigatório' });
  }
  const dupe = db.registrations.find(r => String(r.documento) === String(p.documento));
  if (dupe) {
    return res.status(409).json({ error: 'Documento já cadastrado' });
  }

  const now = new Date().toISOString();
  const registro = {
    id: db.next_id++,
    nome: p.nome || '',
    documento: String(p.documento),
    telefone: p.telefone || '',
    cidade: p.cidade || '',
    grupo: p.grupo || '',
    camiseta: p.camiseta || '',
    sangue: p.sangue || '',
    moto_modelo: p.moto_modelo || '',
    prova: p.prova || '',
    preco: db.price,
    pago: false,
    criado_em: now,
    atualizado_em: now
  };

  db.price = db.price + 1; // sobe 1 Gs para a próxima inscrição
  db.registrations.push(registro);
  saveDB(db);
  res.json({ ok: true, registration: registro });
});

// Lista pública de inscrições
app.get('/api/registrations', (_req, res) => {
  const db = loadDB();
  res.json(db.registrations.sort((a, b) => a.id - b.id));
});

// Buscar inscrição por documento
app.get('/api/registration', (req, res) => {
  const db = loadDB();
  const doc = String(req.query.documento || '');
  const r = db.registrations.find(x => String(x.documento) === doc);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

// Atualizar dados de inscrição (por documento, sem senha)
app.put('/api/registration/update', (req, res) => {
  const db = loadDB();
  const p = req.body || {};
  const doc = String(p.documento || '');
  const r = db.registrations.find(x => String(x.documento) === doc);
  if (!r) return res.status(404).json({ error: 'not found' });

  const fields = ['nome', 'telefone', 'cidade', 'grupo', 'camiseta', 'sangue', 'moto_modelo'];
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(p, f)) {
      r[f] = p[f];
    }
  }
  r.atualizado_em = new Date().toISOString();
  saveDB(db);
  res.json({ ok: true, registration: r });
});

// Login admin (fixo)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'josesti1' && password === '@Trator2020') {
    return res.json({ token: 'ok' });
  }
  return res.status(401).json({ error: 'unauthorized' });
});

// Marcar pagamento (requer header Authorization: Bearer ok)
app.post('/api/registration/pay', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (token !== 'ok') return res.status(401).json({ error: 'unauthorized' });

  const { id, pago } = req.body || {};
  const db = loadDB();
  const r = db.registrations.find(x => Number(x.id) === Number(id));
  if (!r) return res.status(404).json({ error: 'not found' });
  r.pago = !!pago;
  r.atualizado_em = new Date().toISOString();
  saveDB(db);
  res.json({ ok: true });
});

// Exportar XLSX (planilha)
app.get('/api/registrations.xlsx', (_req, res) => {
  const db = loadDB();
  const rows = db.registrations.map(r => ({
    ID: r.id,
    Nome: r.nome,
    Documento: r.documento,
    Telefone: r.telefone,
    Cidade: r.cidade,
    Grupo: r.grupo,
    Modelo: r.moto_modelo,
    Camiseta: r.camiseta,
    Sangue: r.sangue,
    Valor_Gs: r.preco,
    Data_Inscricao: r.criado_em,
    Pago: r.pago ? 'SIM' : 'NAO'
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inscritos');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="inscritos.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

// ===== Servir o build do front (Vite) =====
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// SPA fallback (qualquer rota não-API devolve index.html do build)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).end();
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(200).send('<h3>Servidor ativo. Rode o build com "npm run build".</h3>');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API + Site rodando na porta ${PORT}`);
});
