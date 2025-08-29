const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());

function loadDB(){
  if(!fs.existsSync(DB_PATH)){
    fs.writeFileSync(DB_PATH, JSON.stringify({ registrations: [], price: 250001, admin: { user: "josesti1", pass: "@Trator2020" } }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}
function saveDB(db){
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Preço atual
app.get('/api/price', (req,res)=>{
  const db = loadDB();
  res.json({ current_price: db.price || 250001 });
});

// Registrar inscrição
app.post('/api/register', (req,res)=>{
  const db = loadDB();
  const { nome, documento, telefone, cidade, camiseta, sangue, grupo, moto_modelo, prova } = req.body || {};
  if(!documento || !nome){ return res.status(400).json({ error: 'Dados inválidos' }); }
  const exists = db.registrations.find(r => (r.documento||'').toString() === (documento||'').toString());
  if(exists){
    return res.status(409).json({ error: 'Documento já cadastrado' });
  }
  const id = db.registrations.length ? Math.max(...db.registrations.map(r=> r.id||0)) + 1 : 1;
  const preco = db.price || 250001;
  const now = new Date().toISOString();
  const rec = { id, nome, documento, telefone, cidade, camiseta, sangue, grupo, moto_modelo, prova, preco, pago: false, criado_em: now };
  db.registrations.push(rec);
  db.price = preco + 1;
  saveDB(db);
  res.status(201).json({ message: 'Inscrição realizada!', id, next_price: db.price });
});

// Buscar inscrição por documento ou id
app.get('/api/registration', (req,res)=>{
  const db = loadDB();
  const { documento, id } = req.query;
  let rec = null;
  if(documento){
    rec = db.registrations.find(r => (r.documento||'').toString() === String(documento));
  } else if(id){
    rec = db.registrations.find(r => String(r.id) === String(id));
  }
  if(!rec) return res.status(404).json({ error: 'Não encontrado' });
  res.json(rec);
});

// Atualizar inscrição
app.put('/api/registration/update', (req,res)=>{
  const db = loadDB();
  const { documento, ...rest } = req.body || {};
  if(!documento) return res.status(400).json({ error: 'Documento obrigatório' });
  const idx = db.registrations.findIndex(r => (r.documento||'').toString() === String(documento));
  if(idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.registrations[idx] = { ...db.registrations[idx], ...rest };
  saveDB(db);
  res.json({ ok: true, registration: db.registrations[idx] });
});

// Listar inscritos
app.get('/api/registrations', (req,res)=>{
  const db = loadDB();
  res.json(db.registrations.sort((a,b)=> (a.id||0)-(b.id||0)));
});

// Login admin
app.post('/api/admin/login', (req,res)=>{
  const db = loadDB();
  const { username, password } = req.body || {};
  if(username === db.admin.user && password === db.admin.pass){
    return res.json({ token: 'ok' });
  }
  res.status(401).json({ error: 'unauthorized' });
});

// Marcar pagamento
app.post('/api/registration/pay', (req,res)=>{
  const db = loadDB();
  const auth = req.headers['authorization'] || '';
  if(!auth.endsWith(' ok')) return res.status(401).json({ error: 'unauthorized' });
  const { id, pago } = req.body || {};
  const idx = db.registrations.findIndex(r => Number(r.id) === Number(id));
  if(idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.registrations[idx].pago = !!pago;
  saveDB(db);
  res.json({ ok: true });
});

// Export XLSX
app.get('/api/registrations.xlsx', (req,res)=>{
  const db = loadDB();
  const data = db.registrations.map(r => ({
    ID: r.id,
    Nome: r.nome||'',
    Documento: r.documento||'',
    Telefone: r.telefone||'',
    Cidade: r.cidade||'',
    Grupo: r.grupo||'',
    'Modelo da moto': r.moto_modelo||'',
    Camiseta: r.camiseta||'',
    Sangue: r.sangue||'',
    'Valor (Gs)': r.preco||0,
    'D. Inscrição': r.criado_em ? new Date(r.criado_em).toLocaleDateString('pt-BR') : '',
    Pago: r.pago ? 'SIM' : 'NAO',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inscritos');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="inscritos.xlsx"');
  res.send(buf);
});

app.listen(PORT, ()=> {
  console.log(`API running on http://localhost:${PORT}`);
});
