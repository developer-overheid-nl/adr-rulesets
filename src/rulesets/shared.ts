import type { RulesetDefinition } from '@openlint/openlint-core';
import oasModule from '@openlint/openlint-rulesets/dist/oas/index.js';

export const oasRuleset = ((oasModule as { default?: RulesetDefinition }).default ?? oasModule) as RulesetDefinition;
