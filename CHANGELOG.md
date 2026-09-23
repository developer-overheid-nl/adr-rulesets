# @developer-overheid-nl/adr-rulesets

## 0.0.2

### Patch Changes

- a24e73c: Fix loading the `adrDraft` ruleset under bundlers. `@stoplight/spectral-formats` is CommonJS: Node
  cannot detect its named exports, but esbuild/Vite can — and then hand back a namespace whose
  `default` is undefined, so `import spectralFormats from '...'` followed by destructuring threw
  `TypeError: Cannot destructure property 'oas2' of 'default' as it is undefined`. The generator now
  imports the namespace and unwraps `default` only when it is present, the same way `./shared` already
  does for the oas ruleset, so both loaders work.
  
  Move the ESLint toolchain (`eslint`, `typescript-eslint`, `@eslint/js`, `globals`,
  `eslint-config-prettier`, `eslint-plugin-prettier`, `eslint-plugin-react-hooks`,
  `eslint-plugin-react-refresh`) from `dependencies` to `devDependencies`. It is only needed to lint
  this repository, so consumers no longer install it. Only the four `@stoplight/spectral-*` packages
  the rulesets actually import remain runtime dependencies.

## 0.0.1

### Patch Changes

- 87e4369: Fix loading the `adrDraft` ruleset (and the package's main entry, which re-exports it) under Node ESM.
  `@stoplight/spectral-formats` is CommonJS and its named exports can't be detected by Node, so
  `import { oas2, oas3 } from '@stoplight/spectral-formats'` threw a `SyntaxError` at import time. The
  generator now imports the module as a whole and destructures the formats.
  
  Prepare the package for publishing to npm: add repository, homepage, bugs, keywords and
  `engines.node` (`>=20`) metadata, and ship a README and the EUPL-1.2 LICENSE in the package.
