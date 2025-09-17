import { NextRequest, NextResponse } from "next/server";

type ResponseData =
  | {
      status: number;
      accessible: boolean;
      message: string;
      redirectUrl?: string;
    }
  | { error: string; details?: string };

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ResponseData>> {
  try {
    const body = await request.json();
    const { driveLink } = body;

    if (!driveLink || typeof driveLink !== "string") {
      return NextResponse.json(
        { error: "driveLink parameter is required and must be a string" },
        { status: 400 },
      );
    }

    if (!driveLink.includes("drive.google.com")) {
      return NextResponse.json(
        { error: "Invalid Google Drive link" },
        { status: 400 },
      );
    }

    // HEAD request to check accessibility
    const response = await fetch(driveLink, {
      method: "HEAD",
      redirect: "manual",
    });

    let accessible = false;
    let message = "";
    let redirectUrl = "";

    if (response.status === 200) {
      accessible = true;
      message = "Google Drive link is publicly accessible.";

      // Fetch HTML to check for abstract files
      try {
        const htmlResponse = await fetch(driveLink, { method: "GET" });
        const html = await htmlResponse.text();

        const lower = html.toLowerCase();
        if (lower.includes("abstract.pdf") || lower.includes("abstract.pptx")) {
          message += " Required abstract file found.";
        } else {
          return NextResponse.json(
            {
              error:
                "Google Drive link does not contain the required abstract file (abstract.pdf or abstract.pptx).",
            },
            { status: 400 },
          );
        }
      } catch {
        return NextResponse.json(
          {
            error:
              "Failed to fetch Google Drive folder contents for abstract file check.",
          },
          { status: 500 },
        );
      }
    } else if (response.status === 302 || response.status === 301) {
      const location = response.headers.get("location");
      if (location && location.includes("accounts.google.com")) {
        accessible = false;
        message =
          "Google Drive link is restricted and requires authentication.";
        redirectUrl = location;
      } else {
        accessible = false;
        message = "Google Drive link redirected, accessibility uncertain.";
        redirectUrl = location || "";
      }
    } else if (response.status === 403) {
      accessible = false;
      message = "Google Drive link is forbidden or access denied.";
    } else if (response.status === 404) {
      accessible = false;
      message = "Google Drive link not found.";
    } else {
      accessible = false;
      message = `Google Drive link returned status ${response.status}.`;
    }

    return NextResponse.json({
      status: response.status,
      accessible,
      message,
      ...(redirectUrl && { redirectUrl }),
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to check Google Drive link accessibility.",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
