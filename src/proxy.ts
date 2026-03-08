import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }
  // O Better Auth pode usar prefixos diferentes em produção (HTTPS), por isso verificamos ambos
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isPublicRoute = request.nextUrl.pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redireciona para o login se não houver sessão e tentar acessar rota protegida
  if (!sessionToken && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se já tem sessão e tenta acessar o login...
  if (sessionToken && isAuthRoute) {
    // A MÁGICA ACONTECE AQUI: Verifica se ele foi expulso pelo Layout
    const isSuspended =
      request.nextUrl.searchParams.get("error") === "account_suspended";

    if (isSuspended) {
      // Se foi expulso, nós DELETAMOS o cookie residual para quebrar o loop
      // e deixamos ele renderizar a página de login para ver o Toast vermelho.
      const response = NextResponse.next();
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("__Secure-better-auth.session_token");
      return response;
    }

    // Caso contrário (login normal já logado), manda para o dashboard
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/register"],
};
