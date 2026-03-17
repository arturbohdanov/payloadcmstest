import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Get hostname (e.g., 'hotel1.localhost:3001', 'localhost:3001')
  const host = request.headers.get('host') || ''
  
  // Extract the domain without port (e.g. 'hotel1.localhost' -> 'hotel1.localhost', 'localhost:3001' -> 'localhost')
  const hostname = host.split(':')[0]
  
  // Check if it's localhost (development environment)
  const isLocalhost = hostname === 'localhost'

  // Define paths to bypass
  const path = url.pathname
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/admin') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next()
  }

  // Rewrite logic: if it's NOT the root localhost domain, treat it as a subdomain
  if (!isLocalhost) {
    // We rewrite the request to our dynamic route handling subdomains
    return NextResponse.rewrite(new URL(`/sites/${hostname}${path}`, request.url))
  }

  // Otherwise, if it IS the root domain, just continue normally
  return NextResponse.next()
}
