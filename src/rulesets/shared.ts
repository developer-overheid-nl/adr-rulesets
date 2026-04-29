import type { RulesetDefinition } from '@stoplight/spectral-core';
import oasModule from '@stoplight/spectral-rulesets/dist/oas';

export const oasRuleset = ((oasModule as { default?: RulesetDefinition }).default ?? oasModule) as RulesetDefinition;
