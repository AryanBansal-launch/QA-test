export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 250000)); // 250s, past the 240s ceiling

  return new Response(JSON.stringify({ message: "survived" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
