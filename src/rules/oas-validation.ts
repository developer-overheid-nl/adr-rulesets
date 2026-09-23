import type { HumanReadableDiagnosticSeverity } from "@stoplight/spectral-core";

// Baseline OpenAPI validation rules that should be hard errors in every ADR
// ruleset, regardless of the version's `extends:` strategy.
export const oasValidationRules: Record<
  string,
  HumanReadableDiagnosticSeverity
> = {
  "oas3-schema": "error",
  "operation-operationId-unique": "error",
  "path-params": "error",
  "openapi-tags-uniqueness": "error",
  "oas3-valid-media-example": "error",
  "oas3-valid-schema-example": "error",
  "oas3-server-variables": "error",
};
