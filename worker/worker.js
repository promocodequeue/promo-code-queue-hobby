// Cloudflare Worker for Promo Code Queue using KV
// Bind your KV namespace as PROMO_CODES in wrangler.toml

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // Atomically pop a code from the queue
    let codesRaw = await env.PROMO_CODES.get('codes', 'json');
    if (!codesRaw || !Array.isArray(codesRaw) || codesRaw.length === 0) {
      return new Response(JSON.stringify({ error: 'No codes left' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Remove the first code
    const code = codesRaw.shift();

    // Save the updated list back to KV
    await env.PROMO_CODES.put('codes', JSON.stringify(codesRaw));

    return new Response(JSON.stringify({ code }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
