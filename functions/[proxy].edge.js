export default function handler(request) {
    const u = new URL(request.url);
    return fetch("https://r.eu-north-1.awstrack.me" + u.pathname + u.search, {
      method: request.method,
      headers: request.headers,
      redirect: "manual",
    });
  }