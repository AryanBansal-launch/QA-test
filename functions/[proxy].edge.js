const PROXY_TARGET = "https://bansalapp-returns.devcontentstackapps.com/about";

export default async function handler(request, context) {
    const url = new URL(request.url);

    // Proxy /test to the remote /about page.
    if (url.pathname === "/test") {
      const target = new URL(PROXY_TARGET);
      target.search = url.search;

      const headers = new Headers(request.headers);
      headers.delete("host");

      const hasBody = request.method !== "GET" && request.method !== "HEAD";

      return fetch(target.toString(), {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        redirect: "follow",
      });
    }

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