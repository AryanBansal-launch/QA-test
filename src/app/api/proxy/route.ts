// app/api/proxy/route.js

export async function GET(request: { url: string | URL }) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
  
    if (!url) {
      return Response.json({ error: 'url param required' }, { status: 400 })
    }
  
    const response = await fetch(url)
    const text = await response.text()
  
    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }