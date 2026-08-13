export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400000)); // 400s, past the 240s ceiling

  return new Response(JSON.stringify({ message: "survived" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
