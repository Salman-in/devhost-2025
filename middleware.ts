import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Handle hackathon route redirects
    if (pathname === '/hackathon/dashboard' || pathname === '/hackathon') {
        // Check if there are creation/join flags in the URL
        const created = request.nextUrl.searchParams.get('created');
        const joined = request.nextUrl.searchParams.get('joined');
        
        if (created === 'true' || joined === 'true') {
            // If coming from team creation/joining, stay on dashboard and clean URL
            if (pathname === '/hackathon/dashboard') {
                const url = request.nextUrl.clone();
                url.searchParams.delete('created');
                url.searchParams.delete('joined');
                return NextResponse.redirect(url);
            }
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/hackathon/:path*',
    ],
};
