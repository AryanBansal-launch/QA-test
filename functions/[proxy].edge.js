export default function handler(request){
      const url = new URL(request.url);
      url.hostname = 'r.eu-north-1.awstrack.me';
  
      return fetch(url.toString(), {
        redirect: 'manual'
      });
    }