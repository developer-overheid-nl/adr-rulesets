---
"@developer-overheid-nl/adr-rulesets": minor
---

Build the rulesets on [OpenLint](https://github.com/openlint/openlint) instead of Stoplight Spectral, using the
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
