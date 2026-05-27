export async function GET() {
    const encoder = new TextEncoder();
  
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = [
          "Starting process...\n",
          "Step 1: Connecting to database...\n",
          "Step 2: Fetching records...\n",
          "Step 3: Processing data...\n",
          "Step 4: Generating report...\n",
          "Done!\n",
        ];
  
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise(resolve => setTimeout(resolve, 700));
        }
  
        controller.close();
      },
    });
  
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }