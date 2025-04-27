import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware để kiểm tra nếu người dùng đã đăng nhập
export function middleware(request: NextRequest) {
  // Kiểm tra cookie 'refreshToken'
  const token = request.cookies.get('refreshToken');

  // Nếu không có token, chuyển hướng người dùng tới trang login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu có token, cho phép yêu cầu đi tiếp
  return NextResponse.next();
}

// Áp dụng middleware cho tất cả các route trong ứng dụng
export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'], 
};
