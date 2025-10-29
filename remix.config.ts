import type { AppConfig } from '@remix-run/dev';

const config: AppConfig = {
  ignoredRouteFiles: ["**/.*"],
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_relativeSplatPath: true,
    v3_singleFetch: true,
    v3_throwAbortReason: true,
  },
};

export default config;


