
const delay = parseInt(process.env.REQUEST_TIMEOUT ?? "10000", 10);

export default async function handler(req, res) {
  console.log(
    "[Launch CF]",
    JSON.stringify({
      ts: new Date().toISOString(),
      fn: "buffered",
      method: req.method,
      delay,
    })
  );

  await new Promise((resolve) => setTimeout(resolve, delay));

  res.status(200).json({
    mode: "buffered",
    message: `Full response after ${delay}ms`,
    timestamp: new Date().toISOString(),
    data: Array.from({ length: 100 }, (_, i) => `item-${i}`),
    env: process.env,
  });
}
