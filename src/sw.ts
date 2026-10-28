/// <reference lib="webworker" />
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { GAME_CACHE } from "./cache";
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    // Access login/logout must reach Cloudflare instead of the cached app shell.
    denylist: [/^\/games\//, /^\/cdn-cgi\/access(?:\/|$)/],
  }),
);
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin && /^\/games\//.test(url.pathname),
  async ({ request }) => {
    const cache = await caches.open(GAME_CACHE);
    return (await cache.match(request)) || fetch(request);
  },
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
