// Záloha deníku na server: každý člověk má ve Vercel Blob vlastní složku zalohy/<jmeno>/.
// Přístup: proměnná VD_USERS ve formátu "Jana:kod1,Petr:kod2" (nastavení projektu na Vercelu).
import { put, list, get } from '@vercel/blob';
import { createHash, timingSafeEqual } from 'node:crypto';

const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const digest = s => createHash('sha256').update(String(s)).digest();

function users() {
  return String(process.env.VD_USERS || '').split(',').map(x => {
    const i = x.lastIndexOf(':');
    return i > 0 ? { name: x.slice(0, i).trim(), code: x.slice(i + 1).trim() } : null;
  }).filter(u => u && slug(u.name) && u.code);
}

function auth(name, code) {
  const n = slug(name);
  if (!n || !code) return null;
  for (const u of users()) {
    if (slug(u.name) === n && timingSafeEqual(digest(u.code), digest(code))) return { name: u.name, dir: `zalohy/${n}/` };
  }
  return null;
}

function stamp() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}_${p.hour}-${p.minute}-${p.second}`;
}

const storageError = e => /credentials|token|store/i.test(String(e && e.message)) ? 'not_configured' : 'storage';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!users().length) return res.status(503).json({ error: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'bad_request' });

  const who = auth(body.name, body.code);
  if (!who) return res.status(401).json({ error: 'auth' });

  try {
    switch (body.action) {
      case 'check':
        return res.status(200).json({ name: who.name });

      case 'save': {
        let data;
        try { data = JSON.parse(String(body.backup || '')); } catch { data = null; }
        if (!data || data.app !== 'vinny-denik' || !data.state) return res.status(400).json({ error: 'bad_backup' });
        const trip = slug(data.state.trip && data.state.trip.name).slice(0, 40) || 'vikend';
        const r = await put(`${who.dir}${stamp()}_${trip}.json`, String(body.backup), {
          access: 'private', addRandomSuffix: false, contentType: 'application/json'
        });
        return res.status(200).json({ path: r.pathname });
      }

      case 'list': {
        const out = [];
        let cursor;
        do {
          const r = await list({ prefix: who.dir, limit: 1000, cursor });
          r.blobs.forEach(b => out.push({ path: b.pathname, at: b.uploadedAt, size: b.size }));
          cursor = r.hasMore ? r.cursor : undefined;
        } while (cursor);
        out.sort((a, b) => new Date(b.at) - new Date(a.at));
        return res.status(200).json({ items: out });
      }

      case 'get': {
        const path = String(body.path || '');
        if (!path.startsWith(who.dir) || path.includes('..')) return res.status(403).json({ error: 'auth' });
        const r = await get(path, { access: 'private', useCache: false });
        if (!r || !r.stream) return res.status(404).json({ error: 'missing' });
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).send(await new Response(r.stream).text());
      }

      default:
        return res.status(400).json({ error: 'bad_request' });
    }
  } catch (e) {
    console.error('backup', body.action, e);
    return res.status(500).json({ error: storageError(e) });
  }
}
