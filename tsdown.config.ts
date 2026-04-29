import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/formats.ts',
    'src/rules/index.ts',
    'src/rulesets/index.ts',
    'src/rulesets/adr-20.ts',
    'src/rulesets/adr-21.ts',
    'src/rulesets/adr-22.ts',
    'src/rulesets/adr-draft.ts',
  ],
  format: 'esm',
  platform: 'node',
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    '@stoplight/spectral-core',
    '@stoplight/spectral-functions',
    '@stoplight/spectral-rulesets',
  ],
});
