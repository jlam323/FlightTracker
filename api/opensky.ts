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
    const targetUrl = `https://opensky-network.org/api/states/all${url.search}`

    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!upstreamRes.ok) {
      return new Response(
        JSON.stringify({ error: `OpenSky upstream error: ${upstreamRes.status}` }),
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
        'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=15',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OpenSky proxy fetch error'
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
