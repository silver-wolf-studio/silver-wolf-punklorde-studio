const SYSTEM_PROMPT = `Kamu adalah Silver Wolf dari Honkai: Star Rail, peretas jenius dari Punklorde dan anggota Stellaron Hunters. Kamu menganggap dunia seperti game. Balas dalam bahasa Indonesia yang gaul, santai, cuek, dan akurat. Gunakan gue dan lu, panggil user Player atau Noob secara natural, dan gunakan metafora gaming/cybersecurity seperlunya. Semua metafora hacking adalah roleplay fiksi: jangan pernah menyatakan atau memberi kesan bahwa kamu benar-benar mengakses perangkat, membuka firewall, membypass akun, menghapus data, atau melakukan tindakan dunia nyata pada perangkat user.`;
type Message = { role: 'user' | 'assistant'; content: string };
const REAL_ACCESS_PATTERN = /\b((?:nge)?hack|retas|meretas|bobol|ngebobol|bypass|(?:meng|ng)?akses)\b[\s\S]{0,90}\b(laptop|komputer|hp|ponsel|handphone|perangkat|device|akun|password|data|wifi|jaringan)\b|\b(laptop|komputer|hp|ponsel|handphone|perangkat|device|akun|password|data|wifi|jaringan)\b[\s\S]{0,90}\b((?:nge)?hack|retas|meretas|bobol|ngebobol|bypass|(?:meng|ng)?akses)\b/i;

export async function POST(request: Request) {
  let messages: Message[] | undefined;
  try {
    ({ messages } = (await request.json()) as { messages?: Message[] });
  } catch {
    return Response.json({ error: 'Payload pesan rusak. Coba kirim ulang, Player.' }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) return Response.json({ error: 'Pesan tidak valid.' }, { status: 400 });
  const latest = messages.at(-1)?.content ?? '';
  if (REAL_ACCESS_PATTERN.test(latest)) {
    return Response.json({ answer: 'Santai, Player—itu cuma roleplay di quest ini. Gue nggak mengakses atau ngehack laptop, akun, maupun data lu. Kalau mau, gue bisa bantu cek langkah keamanan perangkat yang legal.' });
  }
  try {
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({ model: 'gemma3:4b', stream: false, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-20)] }),
    });
    if (!response.ok) return Response.json({ error: 'Model lokal belum siap. Jalankan: ollama pull gemma3:4b' }, { status: response.status });
    const data = (await response.json()) as { message?: { content?: string } };
    return Response.json({ answer: data.message?.content ?? 'Output kena glitch kosong. Coba lagi, Player.' });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return Response.json({ error: 'Node lokal lagi ngelag lebih dari 90 detik. Tunggu bentar lalu coba lagi, Player.' }, { status: 504 });
    }
    return Response.json({ error: 'Ollama belum berjalan. Buka terminal lalu jalankan: ollama serve' }, { status: 503 });
  }
}
