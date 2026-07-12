import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 跳过 api、Next 内部资源与带扩展名的静态文件（如 favicon.ico）
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
