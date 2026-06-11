import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const target = new URL(url.pathname + url.search, 'https://r.eu-north-1.awstrack.me');

  const headers = new Headers(request.headers);
  headers.set('host', url.hostname); // keep click.bansalapp.digital

  return NextResponse.rewrite(target, { request: { headers } });
}