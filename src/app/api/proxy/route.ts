import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return Response.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    try {
        const response = await fetch(url)
        const text = await response.text()
        return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain' } })
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        return Response.json({ error: error.message, cause: String(error.cause) }, { status: 500 })
    }
}