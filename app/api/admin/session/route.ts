import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session");
  const isAuthenticated = sessionCookie?.value === "authenticated";

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
