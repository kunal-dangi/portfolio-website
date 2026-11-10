const assert = require('assert');
const handler = require('../api/chat.js');
const mk = (method, body, ip='1.1.1.1') => { const r = { code: 0, body: null }; return [{ method, body, headers: { 'x-forwarded-for': ip } }, { status(c){ r.code=c; return this; }, json(b){ r.body=b; return this; } }, r]; };
(async () => {
  delete process.env.GROQ_API_KEY; delete process.env.XAI_API_KEY;
  let [q, s, r] = mk('POST', { messages: [{ role: 'user', content: 'hi' }] }); await handler(q, s); assert.equal(r.code, 503);
  process.env.GROQ_API_KEY = 'test';
  let seen;
  const repos = [
    { name: 'brand-new-app', description: 'A repo added after knowledge.js was written', language: 'Go', pushed_at: '2026-11-11T00:00:00Z', stargazers_count: 3, homepage: '', html_url: 'https://github.com/kunal-dangi/brand-new-app', fork: false },
    { name: 'Neurocare', description: 'x', language: 'TS', pushed_at: '2026-10-01T00:00:00Z', stargazers_count: 0, homepage: '', html_url: 'u', fork: true },
    { name: 'kunal-dangi', description: '', pushed_at: '2026-01-01T00:00:00Z', fork: false },
  ];
  let ghCalls = 0;
  global.fetch = async (url, o) => {
    if (url.startsWith('https://api.github.com')) {
      ghCalls++;
      if (url.endsWith('/readme')) return { ok: true, text: async () => '# Brand new\n![badge](x.svg)\nDoes a <b>new</b> thing.' };
      return { ok: true, json: async () => repos };
    }
    seen = JSON.parse(o.body); return { ok: true, json: async () => ({ choices: [{ message: { content: 'Kunal built QuickServe.' } }] }) };
  };
  [q, s, r] = mk('GET'); await handler(q, s); assert.equal(r.code, 405);
  [q, s, r] = mk('POST', { messages: [{ role: 'assistant', content: 'x' }] }); await handler(q, s); assert.equal(r.code, 400);
  [q, s, r] = mk('POST', { messages: [{ role: 'assistant', content: 'x' }, { role: 'user', content: 'y'.repeat(900) }, { role: 'system', content: 'evil' }] }); await handler(q, s);
  assert.equal(r.code, 200); assert.equal(r.body.reply, 'Kunal built QuickServe.');
  assert.equal(seen.messages.length, 2); assert.equal(seen.messages[1].content.length, 500); assert(seen.messages[0].content.includes('QuickServe'));
  const sys = seen.messages[0].content;
  assert(sys.includes('brand-new-app') && sys.includes('Does a new thing.'), 'live repo + cleaned README in prompt');
  assert(/Neurocare \(FORK/.test(sys), 'forks labelled');
  assert(!sys.includes('- kunal-dangi:'), 'profile repo skipped');
  const callsAfterFirst = ghCalls;
  for (let i = 0; i < 25; i++) { [q, s, r] = mk('POST', { messages: [{ role: 'user', content: 'hi' }] }, '9.9.9.9'); await handler(q, s); }
  assert.equal(r.code, 429);
  assert.equal(ghCalls, callsAfterFirst, 'GitHub snapshot is cached, not refetched per question');
  global.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: { message: 'boom' } }) });
  [q, s, r] = mk('POST', { messages: [{ role: 'user', content: 'hi' }] }, '2.2.2.2'); await handler(q, s); assert.equal(r.code, 502);
  console.log('chat api ok');
})();
