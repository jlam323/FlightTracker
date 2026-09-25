export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
    })
  }

  try {
    const url = new URL(req.url)
    const targetUrl = `https://data-cloud.flightradar24.com/zones/fcgi/feed.js${url.search}`

    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.flightradar24.com/',
      },
    })

    if (!upstreamRes.ok) {
      return new Response(
        JSON.stringify({ error: `FR24 upstream error: ${upstreamRes.status}` }),
        {
          status: upstreamRes.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const data = await upstreamRes.text()

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=25, s-maxage=25, stale-while-revalidate=15',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FR24 proxy fetch error'
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
