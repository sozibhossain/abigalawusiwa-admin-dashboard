import { withAuth } from "next-auth/middleware"
import { type NextRequest, NextResponse } from "next/server"

export const middleware = withAuth(
  function middleware(request: NextRequest) {
    const token = request.nextauth.token
    const pathname = request.nextUrl.pathname

    const protectedRoutes = ["/dashboard"]
    const publicRoutes = ["/auth/login", "/auth/forgot-password", "/auth/verify-code", "/auth/reset-password", "/"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isPublicRoute = publicRoutes.some((route) => pathname === route)

    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    if (isPublicRoute && token && pathname !== "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedRoutes = ["/dashboard"]
        const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

        if (isProtectedRoute) {
          return !!token
        }
        return true
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
