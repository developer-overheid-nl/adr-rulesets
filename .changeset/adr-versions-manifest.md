---
'@developer-overheid-nl/adr-rulesets': minor
---

Add `adrVersions`: the list of ADR versions this package ships (`2.0.2`, `2.1.0`, `2.2.0` and the
`werkversie` draft), ordered oldest → newest, each with its `id`, `status` (`final` or `draft`), `uri`
and `ruleset`. Consumers such as don-checker and don-tools can derive their versions from it instead of
maintaining their own list. Available from the package root and from `@developer-overheid-nl/adr-rulesets/versions`.
