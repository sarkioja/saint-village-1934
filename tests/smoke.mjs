// Smoke test ponta a ponta contra um servidor ja' no ar.
//
//   AUTH_SECRET=$(openssl rand -base64 32) DATA_BACKEND=fs npx next start -p 3102 &
//   node tests/smoke.mjs
//
// Cobre o caminho inteiro do produto — cadastro, sessao, cronica, lock
// otimista, progresso derivado, exportacao, link publico — e tres controles de
// seguranca que um teste de UI nao pegaria: rev obsoleto e' rejeitado, o link
// anonimo NAO entrega a verdade oculta do caso, e uma conta nao enxerga a
// cronica de outra.

const B = process.env.SV_BASE || 'http://127.0.0.1:3102';
let cookie = '';
const j = async (path, opts = {}) => {
  const r = await fetch(B + path, {
    ...opts,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(opts.headers || {}) },
  });
  const sc = r.headers.get('set-cookie');
  if (sc) cookie = sc.split(';')[0];
  const t = await r.text();
  let body; try { body = JSON.parse(t); } catch { body = t; }
  return { status: r.status, body, raw: t };
};
const ok = (c, m) => console.log((c ? '  ok   ' : '  FALHA ') + m) || (!c && process.exit(1));

// 1. cadastro
let r = await j('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: 'nora@example.com', password: 'uisque-e-chuva', nome: 'Nora' }) });
ok(r.status === 200 && r.body.ok, `cadastro (${r.status})`);
ok(!!cookie, 'cookie de sessao emitido');

// 2. e-mail duplicado
r = await j('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: 'nora@example.com', password: 'outra-senha-aqui' }) });
ok(r.status === 409, `e-mail duplicado recusado (${r.status})`);

// 3. me
r = await j('/api/me');
ok(r.body?.user?.email === 'nora@example.com', 'sessao identifica o usuario');

// 4. cria cronica
r = await j('/api/campaigns', { method: 'POST', body: JSON.stringify({ era: '1934', nome: 'O corpo no Pier 9' }) });
ok(r.status === 200 && r.body.id, `cronica criada (${r.status})`);
const id = r.body.id, rev0 = r.body.rev;

// 5. grava estado (lock otimista)
const state = { era: '1934', tab: 'cronica', eras: { '1934': { char: { nome: 'Nora Vance', saude: 6, sf: 5, imp: 3 }, log: [{ id: 'l1', k: 'narr', who: 'Narrador', text: 'A chuva chega de lado no Pier 9.' }], caso: { titulo: 'O corpo no Pier 9', segredo: 'o bilhete e do delegado', pistas: [{ id: 'p1', t: 'letra de medico' }], provas: [{ id: 'e1', t: 'o bilhete', peso: 2 }], vant: [], prob: [], nec: 4, fios: [] }, cena: 'Downtown', naCena: [], custom: [] } } };
r = await j(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify({ ...state, rev: rev0 }) });
ok(r.status === 200 && r.body.rev === rev0 + 1, `gravacao com rev (${r.status}, rev ${r.body.rev})`);

// 6. rev velho = conflito
r = await j(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify({ ...state, rev: rev0 }) });
ok(r.status === 409, `rev obsoleto rejeitado (${r.status})`);

// 7. progresso na listagem
r = await j('/api/campaigns');
const c = r.body.campaigns[0];
ok(c.progresso.personagem === 'Nora Vance' && c.progresso.pistas === 1 && c.progresso.peso === 2,
   `progresso derivado (${c.progresso.personagem}, ${c.progresso.pistas} pista, peso ${c.progresso.peso}/${c.progresso.pesoNecessario})`);

// 8. exportacao
const ex = await fetch(B + `/api/export/${id}`, { headers: { cookie } });
const md = await ex.text();
ok(ex.status === 200 && md.includes('# O corpo no Pier 9') && md.includes('Nora Vance'), 'exportacao em Markdown');
ok(md.includes('o bilhete e do delegado'), 'dono ve a verdade oculta na exportacao');

// 9. link publico
r = await j(`/api/campaigns/${id}/share`, { method: 'POST' });
ok(r.status === 200 && r.body.token, `link publico criado`);
const token = r.body.token;

// 10. anonimo le, SEM o segredo
const anon = await fetch(B + `/c/${token}`);
const html = await anon.text();
ok(anon.status === 200 && html.includes('A chuva chega de lado'), 'anonimo le a cronica');
ok(!html.includes('o bilhete e do delegado'), 'anonimo NAO ve a verdade oculta');

// 11. revogacao
r = await j(`/api/campaigns/${id}/share?token=${token}`, { method: 'DELETE' });
ok(r.status === 200, 'link revogado');
ok((await fetch(B + `/c/${token}`)).status === 404, 'link revogado da 404');

// 12. cronica de outro usuario
cookie = '';
await j('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: 'zack@example.com', password: 'banca-do-zack' }) });
r = await j(`/api/campaigns/${id}`);
ok(r.status === 404, `cronica de outro usuario invisivel (${r.status})`);

// 13. logout
r = await j('/api/auth/logout', { method: 'POST' });
ok(r.status === 200, 'logout');

console.log('\n  SMOKE OK');
