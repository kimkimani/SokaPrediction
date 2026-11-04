// Cloudflare Pages Function (Edge Worker)
// Guarantees zero redirects across all routes, supporting both trailing slash and non-trailing slash URLs
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

  // If request is for a physical static file (has extension like .js, .css, .png, .ico, .txt, .xml, .svg)
  // Let Cloudflare Pages ASSETS handle it directly
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return context.next();
  }

  // Attempt normal asset resolution
  const response = await context.next();

  // If Cloudflare Pages tries to issue a 301/302/307/308 redirect (e.g. trailing slash normalization)
  // or a 404 Not Found, intercept it and serve /index.html directly with 200 OK!
  if ((response.status >= 300 && response.status < 400) || response.status === 404) {
    const indexResponse = await context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
    const newHeaders = new Headers(indexResponse.headers);
    newHeaders.set('content-type', 'text/html; charset=utf-8');
    newHeaders.delete('location');

    return new Response(indexResponse.body, {
      status: 200,
      headers: newHeaders,
    });
  }

  return response;
};
