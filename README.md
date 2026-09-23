# @developer-overheid-nl/adr-rulesets

[Spectral](https://github.com/stoplightio/spectral) rulesets for the
[NL GOV API Design Rules](https://logius-standaarden.github.io/API-Design-Rules/) (ADR).

## Installation

```sh
pnpm add @developer-overheid-nl/adr-rulesets @stoplight/spectral-core
```

## Usage

```ts
import { Spectral } from '@stoplight/spectral-core';
import { adr21 } from '@developer-overheid-nl/adr-rulesets';

const spectral = new Spectral();
spectral.setRuleset(adr21);

const results = await spectral.run(openApiDocument);
```

Available rulesets:

| Export     | ADR version | Import path                                            |
| ---------- | ----------- | ------------------------------------------------------ |
| `adr20`    | 2.0         | `@developer-overheid-nl/adr-rulesets/rulesets/adr-20`    |
| `adr21`    | 2.1         | `@developer-overheid-nl/adr-rulesets/rulesets/adr-21`    |
| `adr22`    | 2.2         | `@developer-overheid-nl/adr-rulesets/rulesets/adr-22`    |
| `adrDraft` | draft       | `@developer-overheid-nl/adr-rulesets/rulesets/adr-draft` |

Each ruleset module also exports its URI (`ADR_20_URI`, `ADR_21_URI`, …).

Older versions (`adr20`, `adr21`) also report rules that are errors in a newer
ADR version as warnings, so you get notice before they become hard errors.

Older versions (`adr20`, `adr21`) also report rules that are errors in a newer
ADR version as warnings, so you get notice before they become hard errors.

## Development

```sh
pnpm install
pnpm generate   # regenerate adr-21, adr-22, adr-draft and the future-warnings from the published linter.yaml files
pnpm build
```

## Releasing

Releases use [changesets](https://github.com/changesets/changesets) for versioning and the changelog.

1. For every user-facing change, add a changeset in the PR: `pnpm changeset` (choose patch/minor/major and describe the change).
2. To release, check what version the open changesets add up to (`pnpm changeset status --verbose`), then tag the latest commit on `main` with it and push the tag: `git tag v0.1.1 && git push origin v0.1.1`.
3. The [Publish workflow](.github/workflows/publish.yml) applies the changesets, checks that the resulting version matches the tag, builds and publishes to npm with provenance. It then commits the version bump and `CHANGELOG.md` back to `main` and moves the tag onto that commit. Prerelease versions (e.g. `1.0.0-beta.1`) go to the `beta` dist-tag.

## License

[EUPL-1.2](LICENSE)
