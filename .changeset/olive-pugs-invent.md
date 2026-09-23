---
'@developer-overheid-nl/adr-rulesets': patch
---

Fix loading the `adrDraft` ruleset under bundlers. `@stoplight/spectral-formats` is CommonJS: Node
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
