export async function GET() {
  // VERCEL_URL is injected automatically by Vercel at runtime with the
  // current deployment's domain (no protocol). It's only set when running
  // on Vercel, so this route is only meaningful there.
  const vercelUrl = process.env.VERCEL_URL;

  if (!vercelUrl) {
    return Response.json(
      { error: "VERCEL_URL is not set — this route only works when deployed on Vercel." },
      { status: 500 }
    );
  }

  const targetUrl = `https://${vercelUrl}/api/test-timeout`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return Response.json(
      { error: error.message, cause: String(error.cause) },
      { status: 500 }
    );
  }
}
