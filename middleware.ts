import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/rewards", "/vouchers", "/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (!isProtected) return NextResponse.next();

  // Firebase Auth uses client-side JS; the server can't read the auth state
  // directly. We use a cookie set by the client after login as a lightweight
  // gate — the actual auth is enforced by Firebase security rules.
  const authToken = request.cookies.get("segreclaim_authed")?.value;

  if (!authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/rewards/:path*", "/vouchers/:path*", "/profile/:path*"],
};
