import { defineManifest } from '@crxjs/vite-plugin';
import { INTRANET_ORIGIN } from './src/config.ts';

const firefox = process.env.TARGET === 'firefox';

export default defineManifest({
  manifest_version: 3,
  name: 'TL Support',
  version: '0.1.0',
  description: 'Team lead support panel for the intranet.',
  ...(firefox && {
    browser_specific_settings: { gecko: { id: 'tl-support@stxnext.pl', strict_min_version: '115.0' } },
  }),
  permissions: ['storage'],
  host_permissions: [`${INTRANET_ORIGIN}/*`],
  content_scripts: [
    {
      matches: [`${INTRANET_ORIGIN}/*`],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
});
