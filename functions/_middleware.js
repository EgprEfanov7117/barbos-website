export function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'novary.pages.dev' && ['GET', 'HEAD'].includes(request.method) && !url.pathname.startsWith('/api/')) {
    url.hostname = 'barbos.pages.dev';
    url.protocol = 'https:';
    return Response.redirect(url.href, 301);
  }
  return next();
}
