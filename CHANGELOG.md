# @developer-overheid-nl/adr-rulesets

## 0.0.1

### Patch Changes

- 87e4369: Fix loading the `adrDraft` ruleset (and the package's main entry, which re-exports it) under Node ESM.
  `@stoplight/spectral-formats` is CommonJS and its named exports can't be detected by Node, so
  `import { oas2, oas3 } from '@stoplight/spectral-formats'` threw a `SyntaxError` at import time. The
  generator now imports the module as a whole and destructures the formats.
  
  Prepare the package for publishing to npm: add repository, homepage, bugs, keywords and
  `engines.node` (`>=20`) metadata, and ship a README and the EUPL-1.2 LICENSE in the package.
