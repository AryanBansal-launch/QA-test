export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    data = null;
  }
  console.log(
    `[API] ${JSON.stringify({ ts: new Date().toISOString(), route: "contact", message: "POST body", data })}`
  );
  const uid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return new Response("Hello, Next.js!", {
    status: 200,
    headers: { "Set-Cookie": `token=${uid}` },
  });
}