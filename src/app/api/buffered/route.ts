const delay = parseInt(process.env.REQUEST_TIMEOUT ?? "6000", 10);

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, delay));

    return Response.json({
      mode: "buffered",
      message: `Full response after ${delay}ms`,
      timestamp: new Date().toISOString(),
      data: Array.from({ length: 100 }, (_, i) => `item-${i}`)
    });
  }