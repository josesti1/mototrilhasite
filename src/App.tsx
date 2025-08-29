
// App.tsx — MotoTrilha Barro Preto (v37: Admin corrige login com erro)
import React, { useEffect, useState } from "react";

/** Utils **/
function cls(...xs: (string|false|undefined|null)[]){ return xs.filter(Boolean).join(' '); }
function useHashRoute(){
  const [hash, setHash] = useState(window.location.hash || '#inicio');
  useEffect(()=>{
    const on = ()=> setHash(window.location.hash || '#inicio');
    window.addEventListener('hashchange', on);
    return ()=> window.removeEventListener('hashchange', on);
  },[]);
  const [page, param] = hash.replace(/^#/,'').split('/');
  return { page: page || 'inicio', param };
}
function goLogin(doc?: string){
  try{ if(doc) localStorage.setItem('last_doc', String(doc)); }catch{}
  const base = window.location.href.split('#')[0];
  window.location.replace(base + '#login');
  try{ window.dispatchEvent(new HashChangeEvent('hashchange')); }catch{}
}

// Validações
const reNome = /^[A-Za-zÀ-ÿ ]+$/;
const reNumero = /^[0-9]+$/;
const reSangue = /^[A-Za-zÀ-ÿ+\- ]+$/;

type Errs = Partial<Record<'nome'|'documento'|'telefone'|'sangue', string>>;
function setErr(errors: Errs, field: keyof Errs, cond: boolean, msg: string){
  if(cond) errors[field] = msg; else delete errors[field];
}

/** Dados fixos **/
const SITE = {
  nome: "Moto Trilha Barro Preto",
  cidade: "Mariscal Francisco Solano López – Caaguazú – PY",
  whatsapp: "+595984149093",
};
const PAGAMENTO = {
  alias: "+595983837045",
  pix: "+55 (67) 992146071",
};
const EVENTO = {
  titulo: "Moto Trilha Barro Preto 2025",
  data: "30/11/2025",
  dataISO: "2025-11-30T00:00:00-03:00",
  local: SITE.cidade,
  flayer: "/flayer.jpeg"
};
const PROVAS = [
  { id: "8", titulo: "6º encuentro de trilheiros de santa teresa  la trilha tropical", data: "30/11/2025", local: SITE.cidade, capa: "/flayer.jpeg" }
];

const GALERIA = Array.from({length:10}).map((_,i)=> `/foto${i+1}.jpeg`);

/** Layout **/
function Header(){
  const [t, setT] = useState(()=>restante());
  useEffect(()=>{ const id = setInterval(()=> setT(restante()), 1000); return ()=> clearInterval(id); },[]);
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur border-b border-white/10 text-white">
      <div className="container-6xl px-4 py-3 flex items-center gap-4">
        <img src="/logo.jpeg" className="w-10 h-10 rounded-full object-cover" alt="logo"/>
        <div className="font-semibold">{SITE.nome}</div>
        <nav className="ml-auto hidden md:flex items-center gap-5 text-sm">
          <a href="#inicio" className="hover:text-white">Início</a>
          <a href="#eventos" className="hover:text-white">Eventos</a>
          <a href="#provas" className="hover:text-white">Inscrição</a>
          <a href="#login" className="hover:text-white">Login</a>
          <a href="#inscritos" className="hover:text-white">Inscritos</a>
          <a href="#admin" className="hover:text-white">Admin</a>
          <a className="px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600" target="_blank" href={`https://wa.me/${SITE.whatsapp.replace(/\D/g,'')}`}>WhatsApp</a>
          <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{t.d}d {t.h}h {t.m}m {t.s}s</span>
          <span className="text-xs">📅 30 de novembro</span>
        </nav>
      </div>
    </header>
  );
}
function restante(){
  const alvo = new Date(EVENTO.dataISO).getTime();
  const diff = Math.max(alvo - Date.now(), 0);
  const d = Math.floor(diff/86400000), h = Math.floor(diff/3600000)%24, m=Math.floor(diff/60000)%60, s=Math.floor(diff/1000)%60;
  return {d,h,m,s};
}
function Section({children}:{children:React.ReactNode}){
  return <section className="container-6xl px-4 py-24 text-zinc-900">{children}</section>;
}
function Card({children, className=""}:{children:React.ReactNode, className?:string}){
  return <div className={cls("bg-white border rounded-2xl", className)}>{children}</div>;
}
function Title({children}:{children:React.ReactNode}){
  return <h1 className="text-2xl md:text-3xl font-bold">{children}</h1>
}

/** Páginas **/
function Home(){
  const [light, setLight] = useState<{open:boolean, idx:number}>({open:false, idx:0});

  useEffect(()=>{
    if(!light.open) return;
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape') setLight({open:false, idx:0});
      if(e.key === 'ArrowRight') setLight(v=> ({open:true, idx: (v.idx+1)%GALERIA.length}));
      if(e.key === 'ArrowLeft') setLight(v=> ({open:true, idx: (v.idx-1+GALERIA.length)%GALERIA.length}));
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[light.open]);

  return (
    <Section>
      <Title>Galeria</Title>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {GALERIA.map((src,i)=>(
          <button
            key={i}
            className="aspect-square bg-zinc-100 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-zinc-400"
            onClick={()=> setLight({open:true, idx:i})}
            aria-label={`Abrir foto ${i+1}`}
          >
            <img src={src} className="w-full h-full object-cover" alt={`foto${i+1}`}/>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {light.open && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={()=> setLight({open:false, idx:0})}>
          <div className="relative max-w-[95vw] max-h-[90vh]" onClick={(e)=> e.stopPropagation()}>
            <img src={GALERIA[light.idx]} className="max-w-[95vw] max-h-[90vh] rounded-lg shadow-2xl object-contain" />
            {/* Prev */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
              onClick={()=> setLight(v=> ({open:true, idx:(v.idx-1+GALERIA.length)%GALERIA.length}))}
              aria-label="Anterior"
            >‹</button>
            {/* Next */}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
              onClick={()=> setLight(v=> ({open:true, idx:(v.idx+1)%GALERIA.length}))}
              aria-label="Próxima"
            >›</button>
            {/* Close */}
            <button
              className="absolute -top-3 -right-3 bg-white text-black rounded-full w-8 h-8"
              onClick={()=> setLight({open:false, idx:0})}
              aria-label="Fechar"
            >×</button>
          </div>
        </div>
      )}

      <Title>Vídeos</Title>
      <div className="mt-4 grid md:grid-cols-2 gap-6">
        {['Llegó el gran día .mp4','Sobre o nosso trilhão.mp4'].map((v,i)=>(
          <Card key={i}>
            <div className="aspect-video bg-black"><video src={`/${encodeURI(v)}`} controls className="w-full h-full"/></div>
            <div className="p-3 text-sm">{v.replace('.mp4','')}</div>
          </Card>
        ))}
      </div>
      <Title>Parceiros</Title>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        <Card className="p-6 flex items-center justify-center"><img src="/parceiro1.png" className="max-h-16" alt="parceiro"/></Card>
      </div>
    </Section>
  )
}

function Eventos(){
  const [zoom, setZoom] = useState(false);
  return (
    <Section>
      <Title>Eventos</Title>
      <Card className="mt-6 overflow-hidden text-center">
        <img
          src={EVENTO.flayer}
          alt="flayer"
          className="max-h-[70vh] w-auto mx-auto object-contain cursor-zoom-in"
          onClick={()=>setZoom(true)}
        />
        <div className="p-4 grid gap-1 text-sm text-zinc-700">
          <div>🏍️ <b>Moto Trilha Barro Preto</b></div>
          <div>📅 30 de novembro</div>
          <div>📍 {SITE.cidade}</div>
          <div>✨ O maior encontro off-road da região</div>
        </div>
      </Card>
      {zoom && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center" onClick={()=>setZoom(false)}>
          <img src={EVENTO.flayer} className="max-w-[95vw] max-h-[90vh] rounded-lg shadow-2xl" />
        </div>
      )}
    </Section>
  )
}

function Provas(){
  return (
    <Section>
      <Title>Provas</Title>
      <p className="text-zinc-600 mt-1">Escolha a prova para realizar sua inscrição.</p>
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {PROVAS.map(p=>(
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-[16/10] bg-zinc-100"><img src={p.capa} className="w-full h-full object-cover"/></div>
            <div className="p-4">
              <div className="font-semibold">{p.titulo}</div>
              <div className="text-sm text-zinc-600 mt-1">📅 {p.data} · 📍 {p.local}</div>
              <a href={`#provas/${p.id}`} className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800">Inscrever-se</a>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}

function ProvaDetalhe({id}:{id:string}){
  const prova = PROVAS.find(p=> p.id===id);
  const [preco, setPreco] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);

  // estados para validação inline
  const [vNome, setVNome] = useState('');
  const [vDocumento, setVDocumento] = useState('');
  const [vTelefone, setVTelefone] = useState('');
  const [vSangue, setVSangue] = useState('');
  const [errs, setErrs] = useState<Errs>({});

  useEffect(()=>{
    fetch('/api/price').then(r=>r.json()).then(d=> setPreco(d.current_price)).catch(()=> setPreco(null));
  },[]);

  function validateAll(): boolean {
    const e: Errs = {};
    setErr(e,'nome', !(vNome && reNome.test(vNome)), 'Use apenas letras e espaços.');
    setErr(e,'documento', !(vDocumento && reNumero.test(vDocumento)), 'Somente números.');
    setErr(e,'telefone', !(vTelefone && reNumero.test(vTelefone)), 'Somente números.');
    if(vSangue) setErr(e,'sangue', !reSangue.test(vSangue), 'Somente letras e os símbolos + e -.');
    setErrs({...e});
    return Object.keys(e).length===0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(loading) return;
    if(!validateAll()) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(fd.entries());
    payload.prova = id;
    const doc = String(payload.documento||'');
    try{ localStorage.setItem('last_doc', doc); }catch{}
    e.currentTarget.reset();
    goLogin(doc); // redireciona já
    fetch('/api/register',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    }).catch(()=>{}).finally(()=> setLoading(false));
  }

  if(!prova) return <Section>Prova não encontrada.</Section>;
  return (
    <Section>
      <a href="#provas" className="text-sm text-zinc-600">← Voltar</a>
      <h2 className="text-2xl md:text-3xl font-bold mt-2">{prova.titulo}</h2>
      <div className="text-zinc-600 mt-1">📅 {prova.data} · 📍 {prova.local}</div>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <Card className="overflow-hidden"><div className="aspect-[16/10] bg-zinc-100"><img src={prova.capa} className="w-full h-full object-cover"/></div></Card>
        <Card className="p-4">
          <div className="text-sm text-zinc-600">Preço atual: <b>{preco!==null ? `${preco.toLocaleString('es-PY')} Gs` : "—"}</b></div>
          <form onSubmit={onSubmit} className="mt-3 grid gap-3">
            <div>
              <input name="nome" required placeholder="Nome completo" className={cls("border rounded-xl px-3 py-2 w-full", errs.nome && "border-red-500")} value={vNome} onChange={e=>setVNome(e.target.value)} />
              {errs.nome && <p className="text-xs text-red-600 mt-1">{errs.nome}</p>}
            </div>
            <div>
              <input name="documento" required placeholder="Nº de documento (CI/CPF)" className={cls("border rounded-xl px-3 py-2 w-full", errs.documento && "border-red-500")} value={vDocumento} onChange={e=>setVDocumento(e.target.value.replace(/\D/g,''))} inputMode="numeric"/>
              {errs.documento && <p className="text-xs text-red-600 mt-1">{errs.documento}</p>}
            </div>
            <div>
              <input name="telefone" required placeholder="Telefone/WhatsApp" className={cls("border rounded-xl px-3 py-2 w-full", errs.telefone && "border-red-500")} value={vTelefone} onChange={e=>setVTelefone(e.target.value.replace(/\D/g,''))} inputMode="numeric"/>
              {errs.telefone && <p className="text-xs text-red-600 mt-1">{errs.telefone}</p>}
            </div>
            <input name="cidade" placeholder="Cidade/Grupo" className="border rounded-xl px-3 py-2"/>
            <select name="camiseta" className="border rounded-xl px-3 py-2">
              <option value="">Tamanho da camiseta (opcional)</option>
              <option>PP</option><option>P</option><option>M</option><option>G</option><option>GG</option><option>3G</option>
            </select>
            <div>
              <input name="sangue" placeholder="Tipo sanguíneo (opcional)" className={cls("border rounded-xl px-3 py-2 w-full", errs.sangue && "border-red-500")} value={vSangue} onChange={e=>setVSangue(e.target.value)} />
              {errs.sangue && <p className="text-xs text-red-600 mt-1">{errs.sangue}</p>}
            </div>
            <input name="grupo" placeholder="Nome do grupo/equipe (opcional)" className="border rounded-xl px-3 py-2"/>
            <input name="moto_modelo" required placeholder="Modelo da moto" className="border rounded-xl px-3 py-2"/>
            <button disabled={loading} className="bg-zinc-900 text-white rounded-2xl px-5 py-2.5 hover:bg-zinc-800">{loading? "Enviando…" : "Confirmar inscrição"}</button>
          </form>
          <div className="text-xs text-zinc-500 mt-2">Após confirmar, você será levado ao Login para ver/editar seus dados e instruções de pagamento.</div>
        </Card>
      </div>
    </Section>
  )
}

function Login(){
  const [doc, setDoc] = useState("");
  const [dados, setDados] = useState<any|null>(null);
  const [erro, setErro] = useState<string|undefined>();
  const [salvando, setSalvando] = useState(false);

  // validação inline
  const [eNome, setENome] = useState<string|undefined>(undefined);
  const [eTelefone, setETelefone] = useState<string|undefined>(undefined);
  const [eSangue, setESangue] = useState<string|undefined>(undefined);

  useEffect(()=>{
    const last = localStorage.getItem('last_doc');
    if(last){ setDoc(last); buscar(last); }
  },[]);

  function buscar(forced?:string){
    const d = forced ?? doc;
    if(!d) return;
    setErro(undefined); setDados(null);
    fetch(`/api/registration?documento=${encodeURIComponent(d)}`)
      .then(r=> r.ok ? r.json(): Promise.reject())
      .then(setDados)
      .catch(()=> setErro("Inscrição não encontrado. Verifique o número."));
  }
  function salvar(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!dados) return;

    // validações
    const nome = (e.currentTarget.elements.namedItem('nome') as HTMLInputElement)?.value || '';
    const telefone = (e.currentTarget.elements.namedItem('telefone') as HTMLInputElement)?.value || '';
    const sangue = (e.currentTarget.elements.namedItem('sangue') as HTMLInputElement)?.value || '';
    let ok = true;
    if(!(nome && reNome.test(nome))){ setENome('Use apenas letras e espaços.'); ok=false; } else setENome(undefined);
    if(!(telefone && reNumero.test(telefone))){ setETelefone('Somente números.'); ok=false; } else setETelefone(undefined);
    if(sangue && !reSangue.test(sangue)){ setESangue('Somente letras e os símbolos + e -.'); ok=false; } else setESangue(undefined);
    if(!ok) return;

    setSalvando(true);
    const fd = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(fd.entries());
    payload.documento = dados.documento;
    fetch('/api/registration/update', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      .then(r=> r.json()).then(d=> setDados(d.registration)).finally(()=> setSalvando(false));
  }

  return (
    <Section>
      <Title>Login</Title>
      <p className="text-zinc-600 mt-1">Acesse sua inscrição usando apenas seu número de documento (CI/CPF).</p>
      <div className="mt-3 flex gap-2">
        <input value={doc} onChange={e=> setDoc(e.target.value)} placeholder="Digite seu documento" className="border rounded-xl px-3 py-2 w-72"/>
        <button onClick={()=> buscar()} className="bg-zinc-900 text-white rounded-2xl px-5 py-2 hover:bg-zinc-800">Entrar</button>
      </div>
      {erro && <div className="mt-2 text-sm text-red-600">{erro}</div>}
      {dados && (
        <div className="mt-6 grid gap-6">
          <Card>
            <div className="p-4 border-b font-semibold">Dados do participante</div>
            <div className="p-4">
              <form onSubmit={salvar} className="grid md:grid-cols-2 gap-3 text-sm">
                <label className="grid gap-1"><span className="text-zinc-500">Nome</span>
                  <input name="nome" defaultValue={dados.nome} className={cls("border rounded-xl px-3 py-2", eNome && "border-red-500")} required onChange={e=> setENome(undefined)}/>
                  {eNome && <p className="text-xs text-red-600 mt-1">{eNome}</p>}
                </label>
                <label className="grid gap-1"><span className="text-zinc-500">Documento</span>
                  <input defaultValue={dados.documento} disabled className="border rounded-xl px-3 py-2 bg-zinc-100"/></label>
                <label className="grid gap-1"><span className="text-zinc-500">Telefone</span>
                  <input name="telefone" defaultValue={dados.telefone} className={cls("border rounded-xl px-3 py-2", eTelefone && "border-red-500")} required onChange={e=> setETelefone(e.target.value.replace(/\D/g,''))}/>
                  {eTelefone && <p className="text-xs text-red-600 mt-1">{eTelefone}</p>}
                </label>
                <label className="grid gap-1"><span className="text-zinc-500">Cidade</span>
                  <input name="cidade" defaultValue={dados.cidade} className="border rounded-xl px-3 py-2"/></label>
                <label className="grid gap-1"><span className="text-zinc-500">Camiseta</span>
                  <select name="camiseta" defaultValue={dados.camiseta||''} className="border rounded-xl px-3 py-2">
                    <option value="">(opcional)</option><option>PP</option><option>P</option><option>M</option><option>G</option><option>GG</option><option>3G</option>
                  </select></label>
                <label className="grid gap-1"><span className="text-zinc-500">Tipo sanguíneo</span>
                  <input name="sangue" defaultValue={dados.sangue || ''} className={cls("border rounded-xl px-3 py-2", eSangue && "border-red-500")} onChange={e=> setESangue(undefined)}/>
                  {eSangue && <p className="text-xs text-red-600 mt-1">{eSangue}</p>}
                </label>
                <label className="grid gap-1"><span className="text-zinc-500">Grupo</span>
                  <input name="grupo" defaultValue={dados.grupo||''} className="border rounded-xl px-3 py-2"/></label>
                <label className="grid gap-1"><span className="text-zinc-500">Modelo da moto</span>
                  <input name="moto_modelo" defaultValue={dados.moto_modelo||''} className="border rounded-xl px-3 py-2" required/></label>
                <div className="md:col-span-2 flex items-center gap-3 mt-2">
                  <button disabled={salvando} className="bg-zinc-900 text-white rounded-2xl px-5 py-2 hover:bg-zinc-800">{salvando? "Salvando…" : "Salvar alterações"}</button>
                  <span className="text-sm text-zinc-700">Valor da inscrição: <b>{Number(dados.preco||0).toLocaleString('es-PY')} Gs</b></span>
                </div>
              </form>
            </div>
          </Card>
          <Card>
            <div className="p-4 border-b font-semibold">Depósito bancário / PIX</div>
            <div className="p-4 text-sm text-zinc-700 grid gap-1">
              <div>Titular: <b>Jose Luis Floss Dresch</b></div>
              <div>CI: <b>5206830</b></div>
              <div>Entidad: <b>ueno bank</b></div>
              <div>N° de cuenta: <b>619675630</b></div>
              <div>Moneda: <b>GS</b></div>
              <div>Alias CELULAR: <b>{PAGAMENTO.alias}</b></div>
              <div>PIX CELULAR : <b>{PAGAMENTO.pix}</b></div>
            </div>
          </Card>
        </div>
      )}
    </Section>
  )
}

function Inscritos(){
  const [lista, setLista] = useState<any[]>([]);
  useEffect(()=>{ fetch('/api/registrations').then(r=>r.json()).then(setLista); },[]);
  return (
    <Section>
      <Title>Inscritos</Title>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm border rounded-2xl overflow-hidden">
          <thead className="bg-zinc-100"><tr>
            <th className="text-left px-3 py-2 border-b">ID</th>
            <th className="text-left px-3 py-2 border-b">Nome</th>
            <th className="text-left px-3 py-2 border-b">Valor</th>
            <th className="text-left px-3 py-2 border-b">Cidade</th>
            <th className="text-left px-3 py-2 border-b">D. Inscrição</th>
            <th className="text-left px-3 py-2 border-b">Pago</th>
          </tr></thead>
          <tbody>
            {lista.map((r:any)=>(
              <tr key={r.id} className="border-b">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.nome}</td>
                <td className="px-3 py-2">{Number(r.preco).toLocaleString('es-PY')}</td>
                <td className="px-3 py-2">{r.cidade||'—'}</td>
                <td className="px-3 py-2">{r.criado_em ? new Date(r.criado_em).toLocaleDateString('pt-BR') : ''}</td>
                <td className="px-3 py-2">{r.pago? '✅':'❌'}</td>
              </tr>
            ))}
            {lista.length===0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-500">Nenhum inscrito ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function Admin(){
  // só aceita token 'ok'; se houver lixo no localStorage, ignora
  const getStored = ()=> (localStorage.getItem('adm_token') === 'ok' ? 'ok' : null);
  const [token, setToken] = useState<string|null>(getStored());
  const [user, setUser] = useState(""); const [pass, setPass] = useState("");
  const [lista, setLista] = useState<any[]>([]);
  const [q, setQ] = useState(""); const [f, setF] = useState<'todos'|'sim'|'nao'>('todos');
  const [err, setErr] = useState<string|undefined>(undefined);

  useEffect(()=>{ carregar(); },[]);
  function carregar(){ fetch('/api/registrations').then(r=>r.json()).then(setLista); }

  async function login(e:React.FormEvent){
    e.preventDefault();
    setErr(undefined);
    try{
      const r = await fetch('/api/admin/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username:user,password:pass})
      });
      if(!r.ok){
        localStorage.removeItem('adm_token');
        setToken(null);
        setErr('Acesso negado: usuário ou senha inválidos.');
        return;
      }
      const d = await r.json();
      if(d?.token === 'ok'){
        localStorage.setItem('adm_token','ok');
        setToken('ok');
      }else{
        localStorage.removeItem('adm_token');
        setToken(null);
        setErr('Acesso negado: usuário ou senha inválidos.');
      }
    }catch{
      setErr('Falha ao conectar. Tente novamente.');
    }
  }

  function logout(){
    localStorage.removeItem('adm_token'); setToken(null);
  }
  function marcar(id:number, pago:boolean){
    if(!token) return;
    fetch('/api/registration/pay',{method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({id, pago})})
      .then(()=> carregar());
  }
  function exportarCSV(){
    const header = ['ID','Nome','Documento','Telefone','Cidade','Grupo','Modelo','Camiseta','Sangue','Valor (Gs)','D. Inscrição','Pago'];
    const lines = [header.join(';')];
    const fil = filtrados();
    for(const r of fil){
      lines.push([r.id,r.nome,r.documento,r.telefone,r.cidade,r.grupo,r.moto_modelo,r.camiseta,r.sangue, r.preco, r.criado_em? new Date(r.criado_em).toLocaleDateString('pt-BR'):'', r.pago?'SIM':'NAO'].map(x=> String(x??'').replace(/;/g,',')).join(';'));
    }
    const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='inscritos_filtrado.csv'; a.click(); URL.revokeObjectURL(url);
  }
  function exportarXLSX(){ window.open('/api/registrations.xlsx','_blank'); }
  function filtrados(){
    return lista.filter(r=>{
      if(f==='sim' && !r.pago) return false;
      if(f==='nao' && r.pago) return false;
      const k = q.trim().toLowerCase();
      if(!k) return true;
      return (r.nome||'').toLowerCase().includes(k) || (r.documento||'').toLowerCase().includes(k);
    });
  }

  if(!token){
    return (
      <Section>
        <Title>Admin — Login</Title>
        <form onSubmit={login} className="grid gap-3 max-w-sm mt-4">
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Usuário" className="border rounded-xl px-3 py-2" required/>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Senha" className="border rounded-xl px-3 py-2" required/>
          <button className="bg-zinc-900 text-white rounded-2xl px-5 py-2 hover:bg-zinc-800">Entrar</button>
          <div className="text-xs text-zinc-500">Acesso Restrito</div>
          {err && <div className="text-sm text-red-600">{err}</div>}
        </form>
      </Section>
    )
  }
  const items = filtrados();
  return (
    <Section>
      <div className="flex items-center justify-between">
        <Title>Admin — Marcar Pagamentos</Title>
        <button onClick={logout} className="text-sm border rounded-full px-3 py-1.5">Sair</button>
      </div>
      <div className="mt-4 flex flex-col md:flex-row gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome/documento" className="border rounded-xl px-3 py-2 w-full md:w-80"/>
        <select value={f} onChange={e=>setF(e.target.value as any)} className="border rounded-xl px-3 py-2 w-full md:w-40">
          <option value="todos">Todos</option><option value="sim">Pagos</option><option value="nao">Não pagos</option>
        </select>
        <button onClick={exportarCSV} className="border rounded-2xl px-4 py-2">Exportar CSV</button>
        <button onClick={exportarXLSX} className="border rounded-2xl px-4 py-2">Exportar XLSX</button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm border rounded-2xl overflow-hidden">
          <thead className="bg-zinc-100"><tr>
            <th className="text-left px-3 py-2 border-b">ID</th>
            <th className="text-left px-3 py-2 border-b">Nome</th>
            <th className="text-left px-3 py-2 border-b">Documento</th>
            <th className="text-left px-3 py-2 border-b">Cidade</th>
            <th className="text-left px-3 py-2 border-b">Valor (Gs)</th>
            <th className="text-left px-3 py-2 border-b">Pago</th>
            <th className="text-left px-3 py-2 border-b">Ações</th>
          </tr></thead>
          <tbody>
            {items.map((r:any)=>(
              <tr key={r.id} className="border-b">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.nome}</td>
                <td className="px-3 py-2">{r.documento}</td>
                <td className="px-3 py-2">{r.cidade||'—'}</td>
                <td className="px-3 py-2">{Number(r.preco).toLocaleString('es-PY')}</td>
                <td className="px-3 py-2">{r.pago? '✅':'❌'}</td>
                <td className="px-3 py-2">
                  <button onClick={()=>marcar(r.id,true)} className="px-3 py-1.5 rounded-full bg-green-600 text-white mr-2">Marcar pago</button>
                  <button onClick={()=>marcar(r.id,false)} className="px-3 py-1.5 rounded-full bg-zinc-200">Desmarcar</button>
                </td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-zinc-500">Sem resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function Footer(){
  return <footer className="py-10 text-center text-xs text-zinc-500">© {new Date().getFullYear()} Moto Trilha Barro Preto</footer>
}

export default function App(){
  const { page, param } = useHashRoute();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20 md:pt-24">
        {page==='inicio' && <Home />}
        {page==='eventos' && <Eventos />}
        {page==='provas' && !param && <Provas />}
        {page==='provas' && param && <ProvaDetalhe id={param} />}
        {page==='login' && <Login />}
        {page==='inscritos' && <Inscritos />}
        {page==='admin' && <Admin />}
      </main>
      <Footer />
    </div>
  )
}
