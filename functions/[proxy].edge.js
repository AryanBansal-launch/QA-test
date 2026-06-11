// export default function handler(request){
//       const url = new URL(request.url);
//       url.hostname = 'r.eu-north-1.awstrack.me';
  
//       return fetch(url.toString(), {
//         redirect: 'manual'
//       });
//     }


export default function handler(request) {
  const headers = new Headers();
  headers.set("Host", "click.t.bansalapp.digital");          // forbidden header — expect this to be ignored
  headers.set("X-Intended-Host", "click.t.bansalapp.digital"); // normal custom header — expect this to pass through
  return fetch("https://httpbin.org/anything", {
    method: request.method,
    headers,
    redirect: "manual",
  });
}