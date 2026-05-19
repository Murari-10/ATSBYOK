import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Set country/currency cookies from Vercel headers or existing cookie
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.cookies.get("country")?.value ||
    "US";
  const currency = country === "IN" ? "INR" : "USD";
  response.cookies.set("country", country, { path: "/" });
  response.cookies.set("currency", currency, { path: "/" });

  // Protected routes — redirect to /login if no session
  const protectedPrefixes = ["/dashboard", "/optimize", "/settings"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /login while already logged in → /dashboard
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
