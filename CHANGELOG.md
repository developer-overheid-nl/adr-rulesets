# @developer-overheid-nl/adr-rulesets

## 0.2.0

### Minor Changes

- f82cc8a: Build the rulesets on [OpenLint](https://github.com/openlint/openlint) instead of Stoplight Spectral, using the
  libraries from the `openlint@1.1.2` release. OpenLint is the community fork of Spectral and reads the same ruleset
  format. The `@stoplight/spectral-*` dependencies are replaced by `@openlint/openlint-core` 0.1, `openlint-formats` 0.1,
  `openlint-functions` 0.1 and `openlint-rulesets` 0.1. Run the rulesets with `OpenLint` from `@openlint/openlint-core`,
  as the README now shows.
  
  The ADR rules themselves don't change. The OAS ruleset that the rulesets extend now comes from
  `@openlint/openlint-rulesets`, which affects `adr21`, the only ruleset that keeps the OAS rules switched on:
  
  - New rule `oas3_2-no-deprecated-xml-attribute`, which only fires on OpenAPI 3.2 documents.
  - `oas3_1-servers-in-webhook` and `oas3_1-callbacks-in-webhook` now also check OpenAPI 3.2 documents.
  - `operation-operationId-valid-in-url` has a reworded message, and `duplicated-entry-in-enum` matches a narrower set of
    nodes.
  - The inherited OAS rules link to `https://docs.openlint.org/reference/openapi-rules`. Spectral's old documentation
    links for them return 404.
  
  Breaking for some consumers:
  
  - Node 20 and 23 are no longer supported (`engines.node` is now `^22.0 || >=24.0`), matching OpenLint's own range.
  - The published types now use OpenLint's `RulesetDefinition`. Code that passes a ruleset to Spectral's typed API, such
    as `new Spectral().setRuleset(adr21)` with `@stoplight/spectral-core`, no longer type-checks; switch to OpenLint or
    cast. At runtime Spectral still runs the rulesets.

## 0.1.1

Version 0.1.0 was published to npm earlier and then unpublished, so it can no longer be used; this is the
first 0.1 release.

### Minor Changes

- 98f3f3b: Add `adrVersions`: the list of ADR versions this package ships (`2.0.2`, `2.1.0`, `2.2.0` and the
  `werkversie` draft), ordered oldest → newest, each with its `id`, `status` (`final` or `draft`), `uri`
  and `ruleset`. Consumers such as don-checker and don-tools can derive their versions from it instead of
  maintaining their own list. Available from the package root and from `@developer-overheid-nl/adr-rulesets/versions`.

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
