export async function GET(req:Request) {
  try {
    console.log("in api route hello");
    console.log("before reqheaders");
    const requestHeaders = Object.fromEntries(req.headers.entries());
    console.log("second between log");
    console.log(`req headers from Next.js API route --> ${JSON.stringify(requestHeaders)}`);
    console.log("log after long header log");

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
