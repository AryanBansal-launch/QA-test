export async function GET(req: Request) {
  try {
    const requestHeaders = Object.fromEntries(req.headers.entries());
    console.log(
      `[API] ${JSON.stringify({ ts: new Date().toISOString(), route: "hello", message: "GET", headerKeys: Object.keys(requestHeaders) })}`
    );

    return new Response(
      JSON.stringify({
        message: "helloworld@!",
        headers: requestHeaders,
       }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Something went wrong",
        error: JSON.stringify(error),
      }),
      { status: 500 }
    );
  }
}
