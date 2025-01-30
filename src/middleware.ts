// Middleware desabilitado temporariamente
export function middleware() {
  console.log('Middleware - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Middleware - Supabase Anon Key (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10));
  return;
}

export const config = {
  matcher: [],
}; 