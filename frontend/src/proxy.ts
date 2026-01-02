import { NextResponse, type NextRequest } from "next/server";

// 🔥 "proxy" naam ka function export karna zaroori hai
export async function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
    const isLoginPage = request.nextUrl.pathname.startsWith("/login");

    if (!sessionCookie && isDashboardPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (sessionCookie && isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// Next.js 16 ki nayi requirement ke mutabiq default export bhi yahi function hoga
export default proxy;

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};