type Feature = { title: string; body: string };
type PagePlan = {
  title: string;
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  palette: string;
  features: Feature[];
};

const PALETTES = {
  violet: { base: '#0d0920', surface: '#191132', accent: '#9b6cff', hot: '#ff63bd' },
  pink: { base: '#250817', surface: '#40112b', accent: '#ff6aaf', hot: '#ffb05c' },
  blue: { base: '#071725', surface: '#0d2940', accent: '#55b9ff', hot: '#88f5df' },
  orange: { base: '#251007', surface: '#3d1c0e', accent: '#ff965c', hot: '#ffe06a' },
} as const;

function compact(value: unknown, fallback: string, limit: number) {
  if (typeof value !== 'string') return fallback;
  const text = value.replace(/\s+/g, ' ').trim().slice(0, limit);
  return text || fallback;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[character] ?? character));
}

function defaultPlan(brief: string): PagePlan {
  const seed = compact(brief, 'Project baru', 70);
  return {
    title: seed,
    eyebrow: 'LOCAL WEB QUEST',
    headline: 'Halaman baru lu sudah siap.',
    body: 'Mulai dari fondasi yang rapi, lalu ganti teks dan warna sesuai arah project lu.',
    cta: 'Mulai Sekarang',
    palette: 'violet',
    features: [
      { title: 'Jelas', body: 'Pesan utama langsung terbaca tanpa muter-muter.' },
      { title: 'Responsif', body: 'Tampilan tetap enak dibuka dari layar kecil sampai desktop.' },
      { title: 'Mandiri', body: 'HTML ini tidak memerlukan gambar atau aset dari Internet.' },
    ],
  };
}

function normalizePlan(value: unknown, brief: string): PagePlan {
  const fallback = defaultPlan(brief);
  if (!value || typeof value !== 'object') return fallback;
  const raw = value as Record<string, unknown>;
  const palette = typeof raw.palette === 'string' && raw.palette in PALETTES ? raw.palette : fallback.palette;
  const rawFeatures = Array.isArray(raw.features) ? raw.features.slice(0, 3) : [];
  const features = rawFeatures.map((feature, index) => {
    const item = feature && typeof feature === 'object' ? feature as Record<string, unknown> : {};
    return {
      title: compact(item.title, fallback.features[index]?.title ?? ('Fitur ' + (index + 1)), 44),
      body: compact(item.body, fallback.features[index]?.body ?? fallback.features[0].body, 120),
    };
  });

  return {
    title: compact(raw.title, fallback.title, 70),
    eyebrow: compact(raw.eyebrow, fallback.eyebrow, 36).toUpperCase(),
    headline: compact(raw.headline, fallback.headline, 105),
    body: compact(raw.body, fallback.body, 220),
    cta: compact(raw.cta, fallback.cta, 36),
    palette,
    features: features.length === 3 ? features : fallback.features,
  };
}

function parsePlan(content: string, brief: string) {
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace <= firstBrace) throw new Error('Missing JSON object');
  return normalizePlan(JSON.parse(content.slice(firstBrace, lastBrace + 1)), brief);
}

function renderPage(plan: PagePlan) {
  const palette = PALETTES[plan.palette as keyof typeof PALETTES] ?? PALETTES.violet;
  const features = plan.features.map((feature, index) => '<article class="card"><span>0' + (index + 1) + '</span><h2>' + escapeHtml(feature.title) + '</h2><p>' + escapeHtml(feature.body) + '</p></article>').join('');
  const css = ':root{--base:' + palette.base + ';--surface:' + palette.surface + ';--accent:' + palette.accent + ';--hot:' + palette.hot + ';--text:#f8f5ff;--muted:#c7bfd9}*{box-sizing:border-box}body{margin:0;color:var(--text);font-family:Arial,Helvetica,sans-serif;background:radial-gradient(circle at 82% 12%,color-mix(in srgb,var(--hot) 28%,transparent),transparent 25rem),radial-gradient(circle at 10% 80%,color-mix(in srgb,var(--accent) 35%,transparent),transparent 28rem),var(--base)}main{width:min(1120px,calc(100% - 40px));min-height:100vh;margin:auto;padding:30px 0 58px}nav{display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:800;letter-spacing:.1em}.brand{color:var(--hot)}.pill{padding:8px 11px;border:1px solid color-mix(in srgb,var(--accent) 55%,transparent);border-radius:999px;color:var(--muted)}.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:end;padding:105px 0 78px}.eyebrow,.card span{color:var(--hot);font-size:11px;font-weight:800;letter-spacing:.15em}h1{max-width:760px;margin:14px 0;font-size:clamp(43px,7vw,84px);line-height:.93;letter-spacing:-.065em}.hero p{max-width:560px;color:var(--muted);font-size:18px;line-height:1.65}.cta{display:inline-block;margin-top:18px;padding:14px 19px;border-radius:10px;color:#130b24;background:linear-gradient(130deg,var(--hot),var(--accent));font-size:13px;font-weight:900;text-decoration:none}.hero-panel{min-height:210px;padding:25px;border:1px solid color-mix(in srgb,var(--accent) 48%,transparent);border-radius:21px;background:linear-gradient(145deg,color-mix(in srgb,var(--surface) 92%,transparent),color-mix(in srgb,var(--accent) 24%,transparent));box-shadow:inset 0 1px 0 #fff2}.hero-panel b{display:block;margin-top:55px;font-size:24px}.hero-panel small{color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{min-height:225px;padding:24px;border:1px solid #fff2;border-radius:18px;background:color-mix(in srgb,var(--surface) 86%,transparent)}.card h2{margin:44px 0 9px;font-size:23px}.card p{margin:0;color:var(--muted);line-height:1.55}footer{margin-top:64px;color:var(--muted);font-size:12px}@media(max-width:720px){main{width:min(100% - 28px,1120px)}.hero{grid-template-columns:1fr;padding:76px 0 52px}.hero-panel{min-height:150px}.hero-panel b{margin-top:25px}.cards{grid-template-columns:1fr}}';
  return '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(plan.title) + '</title><style>' + css + '</style></head><body><main><nav><span class="brand">' + escapeHtml(plan.title).toUpperCase() + '</span><span class="pill">LOCAL BUILD</span></nav><section class="hero"><div><span class="eyebrow">' + escapeHtml(plan.eyebrow) + '</span><h1>' + escapeHtml(plan.headline) + '</h1><p>' + escapeHtml(plan.body) + '</p><a class="cta" href="#fitur">' + escapeHtml(plan.cta) + '</a></div><aside class="hero-panel"><small>STATUS // READY</small><b>' + escapeHtml(plan.title) + '</b><small>Dirakit untuk quest berikutnya.</small></aside></section><section class="cards" id="fitur">' + features + '</section><footer>Built locally • No external assets</footer></main></body></html>';
}

export async function POST(request: Request) {
  let brief: string | undefined;
  try {
    ({ brief } = (await request.json()) as { brief?: string });
  } catch {
    return Response.json({ error: 'Brief rusak kena glitch. Kirim lagi, Player.' }, { status: 400 });
  }
  if (!brief?.trim()) return Response.json({ error: 'Brief halaman masih kosong, Player.' }, { status: 400 });
  if (brief.length > 800) return Response.json({ error: 'Brief kepanjangan. Pangkas jadi maksimal 800 karakter biar node lokal nggak AFK, Player.' }, { status: 400 });

  const instruction = 'Kamu adalah copywriter web Indonesia. Berdasarkan brief ini: ' + brief + '. Balas JSON murni tanpa markdown dengan schema {"title":"","eyebrow":"","headline":"","body":"","cta":"","palette":"violet|pink|blue|orange","features":[{"title":"","body":""},{"title":"","body":""},{"title":"","body":""}]}. Tulis sangat ringkas: maksimal 180 token total, tiap fitur satu kalimat. Jangan sertakan HTML, kode, URL, atau aset.';
  try {
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: 'gemma3:4b',
        stream: false,
        format: 'json',
        keep_alive: '20m',
        options: { temperature: 0.2, num_predict: 200, num_ctx: 2048 },
        messages: [{ role: 'user', content: instruction }],
      }),
    });
    if (!response.ok) return Response.json({ error: 'Model lokal belum siap. Pastikan Ollama aktif.' }, { status: response.status });
    const data = (await response.json()) as { message?: { content?: string } };
    try {
      return Response.json({ html: renderPage(parsePlan(data.message?.content ?? '', brief)) });
    } catch {
      return Response.json({ html: renderPage(defaultPlan(brief)), note: 'AI ngasih format yang aneh, jadi gue buka starter template lokal dulu, Player.' });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') return Response.json({ html: renderPage(defaultPlan(brief)), note: 'Node lokal lagi berat, jadi gue buka starter template dulu. Coba lagi nanti buat copy AI-nya, Player.' });
    return Response.json({ error: 'Ollama belum berjalan. Jalankan: ollama serve' }, { status: 503 });
  }
}
