export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 6000));

    return Response.json({
      mode: "buffered",
      message: "Full response after 6 seconds",
      timestamp: new Date().toISOString(),
      data: Array.from({ length: 100 }, (_, i) => `item-${i}`)
    });
  }