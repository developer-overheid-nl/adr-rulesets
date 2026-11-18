---
'@developer-overheid-nl/adr-rulesets': patch
---

Update `@openlint/openlint-rulesets` and `@openlint/openlint-functions` to `^0.2.0`. The OAS ruleset is now imported through
the package's public `oas` export instead of the `dist/oas/index.js` deep path, which 0.2.0 no longer ships. The rulesets
produce the same results.
