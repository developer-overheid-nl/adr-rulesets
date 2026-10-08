import type { RulesetDefinition } from "@stoplight/spectral-core";
import {
  ADR_20_URI,
  ADR_21_URI,
  ADR_22_URI,
  ADR_DRAFT_URI,
  adr20,
  adr21,
  adr22,
  adrDraft,
} from "./rulesets";

export type AdrVersionStatus = "final" | "draft";

export interface AdrVersion {
  /** Version id, as consumers (e.g. the don-checker CLI's `--version`) refer to it. */
  id: string;
  status: AdrVersionStatus;
  uri: string;
  ruleset: RulesetDefinition;
}

// The ADR versions this package ships, ordered oldest → newest. This is the
// single source of truth for which versions exist; add a new version here
// together with its ruleset export.
export const adrVersions = [
  { id: "2.0.2", status: "final", uri: ADR_20_URI, ruleset: adr20 },
  { id: "2.1.0", status: "final", uri: ADR_21_URI, ruleset: adr21 },
  { id: "2.2.0", status: "final", uri: ADR_22_URI, ruleset: adr22 },
  { id: "werkversie", status: "draft", uri: ADR_DRAFT_URI, ruleset: adrDraft },
] as const satisfies readonly AdrVersion[];

export type AdrVersionId = (typeof adrVersions)[number]["id"];
