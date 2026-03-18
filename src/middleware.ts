import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Root domains that should serve the main app (not hotel subdomains)
const ROOT_DOMAINS = [
  'localhost',
  'payloadcmstest-production.up.railway.app',
]

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Get hostname without port
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]
  
  // Define paths to bypass middleware completely
  const path = url.pathname
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/admin') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // If it's a root domain, serve the main app normally
  if (ROOT_DOMAINS.includes(hostname)) {
    return NextResponse.next()
  }

  // Otherwise treat as a hotel subdomain and rewrite to /sites/[domain]
  return NextResponse.rewrite(new URL(`/sites/${hostname}${path}`, request.url))
}
