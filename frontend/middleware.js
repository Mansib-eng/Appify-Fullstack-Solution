import { NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register"];

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = token ? "/feed" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/feed") && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PAGES.includes(pathname) && token) {
    const feedUrl = request.nextUrl.clone();
    feedUrl.pathname = "/feed";
    return NextResponse.redirect(feedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/feed/:path*"],
};
