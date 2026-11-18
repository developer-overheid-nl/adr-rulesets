---
'@developer-overheid-nl/adr-rulesets': patch
---

Update `@openlint/openlint-rulesets` to `^0.3.0`. It depends on the 1.0 releases of `@openlint/ruleset-spectral-oas`,
`-arazzo` and `-asyncapi`, the versions the next `@geonovum/standards-checker` release depends on, so a consumer of both
packages, such as don-checker, installs one copy of the OAS ruleset instead of two. The rulesets produce the same results.
