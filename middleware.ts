// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de wallets admin autorizadas
const ADMIN_WALLETS = [
  '0x...', // Agrega aquí las direcciones de wallet de los administradores
];

export function middleware(request: NextRequest) {
  // Solo aplicar a rutas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Aquí podrías implementar diferentes métodos de autenticación:
    
    // Opción 1: Token en headers
    const authToken = request.headers.get('authorization');
    
    // Opción 2: Cookie de sesión
    const sessionCookie = request.cookies.get('admin-session');
    
    // Opción 3: Query parameter temporal (menos seguro)
    const adminKey = request.nextUrl.searchParams.get('key');
    
    // Por ahora, ejemplo simple con clave en variable de entorno
    const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
    
    if (adminKey !== ADMIN_KEY && !sessionCookie) {
      // Redirigir a página de login o mostrar error
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};