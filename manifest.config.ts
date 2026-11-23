import { defineManifest } from '@crxjs/vite-plugin';
import { INTRANET_ORIGIN } from './src/config.ts';

export default defineManifest({
  manifest_version: 3,
  name: 'TL Support',
  version: '0.1.0',
  description: 'Team lead support panel for the intranet.',
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
