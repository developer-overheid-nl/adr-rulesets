# @developer-overheid-nl/adr-rulesets

[OpenLint](https://github.com/openlint/openlint) rulesets for the
[NL GOV API Design Rules](https://logius-standaarden.github.io/API-Design-Rules/) (ADR).

## Installation

```sh
pnpm add @developer-overheid-nl/adr-rulesets @openlint/openlint-core
```

## Usage

```ts
import { OpenLint } from '@openlint/openlint-core';
import { adr21 } from '@developer-overheid-nl/adr-rulesets';

const openLint = new OpenLint();
openLint.setRuleset(adr21);

const results = await openLint.run(openApiDocument);
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

### Versions

`adrVersions` lists every ADR version this package ships, ordered oldest → newest, so consumers
do not have to maintain their own list:

```ts
import { adrVersions } from '@developer-overheid-nl/adr-rulesets/versions';

// [{ id: '2.0.2', status: 'final', uri: ADR_20_URI, ruleset: adr20 }, …,
//  { id: 'werkversie', status: 'draft', uri: ADR_DRAFT_URI, ruleset: adrDraft }]
const latestFinal = adrVersions.findLast(version => version.status === 'final');
```

It is also exported from the package root, together with the `AdrVersion`, `AdrVersionId` and
`AdrVersionStatus` types.

## Development

```sh
pnpm install
pnpm generate   # regenerate adr-21, adr-22, adr-draft and the future-warnings from the published linter.yaml files
pnpm build
```

## Releasing

Versioning, the changelog, and npm publishing are driven by [Changesets](https://changesets.dev/). Describing a change is decoupled from cutting a release:

1. **Add a changeset with your change.** Run `pnpm changeset`, pick the bump (`major` / `minor` / `patch`), and write a one-line summary. This creates a `.changeset/<name>.md` file; commit it with your PR. Omit only for changes that don't affect the published package (CI, internal docs).

2. **Merge the version pull request.** Every push to `main` runs the [Release workflow](.github/workflows/publish.yml). While changesets are pending, it opens or updates a `chore(release): version packages` pull request that runs `pnpm version-packages`: it consumes the pending `.changeset/*.md` files, bumps `package.json` to the computed version (the highest pending bump wins), and prepends the summaries to `CHANGELOG.md`. Review that pull request and merge it when you want to release. Don't hand-edit the `version` field; Changesets owns it.

   GitHub doesn't run the CI workflow on pull requests opened by the workflow token, so the version pull request shows no checks. The release job builds and lints before it publishes anyway; close and reopen the pull request if you want the checks on it.

3. **Publish.** When the version pull request lands on `main`, the workflow finds a `package.json` version that has no `v<version>` tag yet. It builds and lints, publishes to npm with provenance, and creates the `v<version>` tag with a GitHub release whose notes are that version's `CHANGELOG.md` section. Starting the workflow by hand (**Actions** → **Release** → **Run workflow** on `main`) does the same as a push.

   To retry a failed release, use **Re-run failed jobs**. Steps that already completed (the npm publish, the GitHub release) are skipped.

   `pnpm release` (`pnpm build && changeset publish`) publishes to npm locally if you need to bypass the workflow (it creates no GitHub release).

### Pre-releases

To publish `-beta.N` prereleases before a final release, enter Changesets pre-release mode in a pull request:

```sh
pnpm changeset pre enter beta   # writes .changeset/pre.json; commit it
```

While in pre mode:

- The version pull request (titled `... (beta)`) computes e.g. `1.0.0-beta.0`; once new changesets land after a release, it bumps to `-beta.1`, and so on. Final releases are blocked until you exit pre mode.
- Merging it publishes the prerelease under the npm dist-tag `beta`, so `latest` keeps pointing at the last final release, and marks the GitHub release as a pre-release.
- Consumed changesets are **moved** to `.changeset/pre/` instead of deleted, so the final release's changelog can aggregate them. Don't delete them by hand.
- The `-beta.N` counter is derived from the current `package.json` version, one more reason never to hand-edit `version`; a hand-set version shifts the counter.

When the release is ready to go final, exit pre mode in a pull request:

```sh
pnpm changeset pre exit         # marks pre mode as exiting in .changeset/pre.json; commit it
```

After it merges, the version pull request computes the final version and cleans up the consumed changesets. Merging that publishes under `latest`.

## License

[EUPL-1.2](LICENSE)
