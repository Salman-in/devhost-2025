import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Add debug information in response headers that will be visible in browser dev tools
    const response = NextResponse.next();
    
    // Handle hackathon route redirects
    if (pathname === '/hackathon/dashboard' || pathname === '/hackathon') {
        // Check if there are creation/join flags in the URL
        const created = request.nextUrl.searchParams.get('created');
        const joined = request.nextUrl.searchParams.get('joined');
        
        response.headers.set('x-middleware-path', pathname);
        response.headers.set('x-middleware-created', String(created === 'true'));
        response.headers.set('x-middleware-joined', String(joined === 'true'));
        
        if (created === 'true' || joined === 'true') {
            // Always treat as having a team if coming directly from creation/join
            if (pathname === '/hackathon/dashboard') {
                // We're already on dashboard with a creation flag, just clean the URL
                const url = request.nextUrl.clone();
                url.searchParams.delete('created');
                url.searchParams.delete('joined');
                return NextResponse.redirect(url);
            }
        }
        
        // Server-side redirect based on team status
        const hasTeamCookie = request.cookies.get('hasTeam');
        const hasTeam = hasTeamCookie?.value === 'true';
        
        response.headers.set('x-middleware-has-team-cookie', String(hasTeamCookie !== undefined));
        response.headers.set('x-middleware-has-team', String(hasTeam));
        
        // If user is on /hackathon but has a team, redirect to dashboard
        if (pathname === '/hackathon' && hasTeam) {
            const url = request.nextUrl.clone();
            url.pathname = '/hackathon/dashboard';
            return NextResponse.redirect(url);
        }
        
        // If user is on /hackathon/dashboard but has no team, redirect to hackathon
        // Exception: If they just created or joined a team (based on URL params)
        if (pathname === '/hackathon/dashboard' && 
            !hasTeam && 
            created !== 'true' && 
            joined !== 'true') {
            const url = request.nextUrl.clone();
            url.pathname = '/hackathon';
            return NextResponse.redirect(url);
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/hackathon/:path*',
    ],
};
