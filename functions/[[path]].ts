// Cloudflare Pages Function (Edge Worker)
// Intercepts requests at Cloudflare Edge to enforce no trailing slashes and canonical SPA routing
interface Env {
  ASSETS: {
    fetch: (request: Request | string | URL) => Promise<Response>;
  };
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}) => {
  const url = new URL(context.request.url);

  // 1. If physical static file (has extension like .js, .css, .png, .ico, .txt, .xml, .svg)
  // Let Cloudflare Pages ASSETS handle it directly
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return context.next();
  }

  // 2. Trailing slash normalization at Cloudflare Edge:
  // If request ends with slash (e.g. /tips/mwanasoka-tips/), 301 redirect to non-slash URL
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    const cleanUrl = new URL(url.toString());
    cleanUrl.pathname = cleanUrl.pathname.replace(/\/+$/, '');
    return Response.redirect(cleanUrl.toString(), 301);
  }

  // 3. Known misplaced root paths that belong under /tips/ or /jackpots/
  // Redirect root /mwanasoka-tips -> /tips/mwanasoka-tips
  if (url.pathname === '/mwanasoka-tips') {
    const targetUrl = new URL(url.toString());
    targetUrl.pathname = '/tips/mwanasoka-tips';
    return Response.redirect(targetUrl.toString(), 301);
  }
  if (url.pathname === '/sunpel-predictions' || url.pathname === '/sunpel-prediction') {
    const targetUrl = new URL(url.toString());
    targetUrl.pathname = '/tips/sunpel-predictions';
    return Response.redirect(targetUrl.toString(), 301);
  }
  if (url.pathname === '/sonko-tips-today' || url.pathname === '/sonko-tips') {
    const targetUrl = new URL(url.toString());
    targetUrl.pathname = '/tips/sonko-tips-today';
    return Response.redirect(targetUrl.toString(), 301);
  }
  if (url.pathname.startsWith('/jackpot/')) {
    const targetUrl = new URL(url.toString());
    targetUrl.pathname = url.pathname.replace(/^\/jackpot\//, '/jackpots/');
    return Response.redirect(targetUrl.toString(), 301);
  }

  // 4. Fetch the SPA index.html for all other routes
  const response = await context.next();

  // If Cloudflare Pages issues a 301/308 redirect or 404, intercept and serve index.html directly
  if ((response.status >= 300 && response.status < 400) || response.status === 404) {
    const indexResponse = await context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
    const newHeaders = new Headers(indexResponse.headers);
    newHeaders.set('content-type', 'text/html; charset=utf-8');
    newHeaders.set('cache-control', 'no-cache, no-store, must-revalidate');
    newHeaders.delete('location');
    return new Response(indexResponse.body, {
      status: 200,
      headers: newHeaders,
    });
  }

  // For HTML responses, prevent caching stale redirects
  const newHeaders = new Headers(response.headers);
  newHeaders.set('cache-control', 'no-cache, no-store, must-revalidate');
  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
};
