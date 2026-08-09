export default async function handler(request, context) {
    const url = new URL(request.url);
  
    // Only handle requests to the log-generator path;
    // forward everything else to the origin.
    if (url.pathname !== "/edgelog") {
      return fetch(request);
    }
  
    const count = Number(url.searchParams.get("count") ?? 1);
  
    console.log("=== START ===");
  
    for (let i = 1; i <= count; i++) {
      console.log(
        JSON.stringify({
          sequence: i,
          timestamp: Date.now(),
          route: "/edgelog",
          requestId: request.headers.get("x-request-id") ?? "local",
          message: `Generated log ${i}`,
          level: "INFO",
        }),
      );
    }
  
    console.log("=== END ===");
  
    return new Response(JSON.stringify({ generated: count }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }