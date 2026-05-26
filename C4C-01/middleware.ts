import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
    if (path.startsWith("/foundation") && role !== "FOUNDATION_WORKER") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
    if (path.startsWith("/caregiver") && role !== "CAREGIVER") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
    if (path.startsWith("/me") && role !== "PATIENT") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
    if (path.startsWith("/account") && !role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/caregiver/:path*",
    "/foundation/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/handover/:path*",
    "/me/:path*",
  ],
};

