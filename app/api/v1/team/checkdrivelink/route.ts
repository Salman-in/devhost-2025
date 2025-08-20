import { NextRequest, NextResponse } from 'next/server';

type ResponseData =
  | { status: number; accessible: boolean; message: string; redirectUrl?: string }
  | { error: string; details?: string };

export async function POST(request: NextRequest): Promise<NextResponse<ResponseData>> {
  try {
    const body = await request.json();
    const { driveLink } = body;

    if (!driveLink || typeof driveLink !== 'string') {
      return NextResponse.json(
        { error: 'driveLink parameter is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate if it's a Google Drive link
    if (!driveLink.includes('drive.google.com')) {
      return NextResponse.json(
        { error: 'Invalid Google Drive link' },
        { status: 400 }
      );
    }

    // Make request without following redirects to check the initial response
    const response = await fetch(driveLink, { 
      method: 'HEAD', 
      redirect: 'manual' // Don't follow redirects automatically
    });

    let accessible = false;
    let message = '';
    let redirectUrl = '';

    // Check response status
    if (response.status === 200) {
      accessible = true;
      message = 'Google Drive link is publicly accessible.';
    } else if (response.status === 302 || response.status === 301) {
      // Check if redirect is to Google accounts (authentication required)
      const location = response.headers.get('location');
      if (location && location.includes('accounts.google.com')) {
        accessible = false;
        message = 'Google Drive link is restricted and requires authentication.';
        redirectUrl = location;
      } else {
        // Other redirect, might still be accessible
        accessible = false;
        message = 'Google Drive link redirected, accessibility uncertain.';
        redirectUrl = location || '';
      }
    } else if (response.status === 403) {
      accessible = false;
      message = 'Google Drive link is forbidden or access denied.';
    } else if (response.status === 404) {
      accessible = false;
      message = 'Google Drive link not found.';
    } else {
      accessible = false;
      message = `Google Drive link returned status ${response.status}.`;
    }

    return NextResponse.json({
      status: response.status,
      accessible,
      message,
      ...(redirectUrl && { redirectUrl })
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to check Google Drive link accessibility.',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
