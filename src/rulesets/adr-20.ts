import type { RulesetDefinition } from '@stoplight/spectral-core';
import { or, pattern, schema, truthy } from '@stoplight/spectral-functions';
import { oas3_0, oas3_1 } from '../formats';
import { oasValidationRules } from '../rules/oas-validation';
import { adr20FutureWarnings } from './adr-20-future-warnings';
import { oasRuleset } from './shared';

export const ADR_20_URI = 'https://logius-standaarden.github.io/API-Design-Rules/2.0';

const adr20: RulesetDefinition = {
  description: 'NLGov REST API Design Rules',
  extends: [[oasRuleset as RulesetDefinition, 'off']],
  formats: [oas3_0, oas3_1],
  rules: {
    ...oasValidationRules,
    ...adr20FutureWarnings,
    // /core/version-header
    'missing-version-header': {
      severity: 'error',
      given: '$..[responses][?(@property && @property.match(/(2|3)\\d\\d/))][headers]',
      then: {
        function: or,
        functionOptions: {
          properties: ['API-Version', 'Api-Version', 'Api-version', 'api-version', 'API-version'],
        },
      },
      message: '/core/version-header: Return the full version number in a response header',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/version-header',
    },
    'missing-header': {
      severity: 'error',
      given: '$..[responses][?(@property && @property.match(/(2|3)\\d\\d/))]',
      then: {
        field: 'headers',
        function: truthy,
      },
      message: '/core/version-header: Return the full version number in a response header',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/version-header',
    },
    // /core/uri-version
    'include-major-version-in-uri': {
      severity: 'error',
      given: ['$.servers[*]'],
      then: {
        function: pattern,
        functionOptions: {
          match: '\\/v[\\d+]',
        },
        field: 'url',
      },
      message: '/core/uri-version: Include the major version number in the URI',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/uri-version',
    },
    // /core/no-trailing-slash
    'paths-no-trailing-slash': {
      severity: 'error',
      given: ['$.paths'],
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '.+\\/$',
        },
        field: '@key',
      },
      message: '/core/no-trailing-slash: Leave off trailing slashes from URIs',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/no-trailing-slash',
    },
    // /core/http-methods
    'http-methods': {
      severity: 'error',
      given: ['$.paths[?(@property && @property.match(/(description|summary)/i))]'],
      then: {
        function: pattern,
        functionOptions: {
          match: 'post|put|get|delete|patch|parameters',
        },
        field: '@key',
      },
      message: '/core/http-methods: Only apply standard HTTP methods',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/http-methods',
    },
    // /core/semver
    semver: {
      severity: 'error',
      message: 'Version {{value}} should be in semver format.',
      given: '$.info.version',
      then: {
        function: pattern,
        functionOptions: {
          match:
            '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
        },
      },
    },
    'info-version': {
      severity: 'error',
      given: ['$.info'],
      then: {
        function: schema,
        functionOptions: {
          schema: {
            required: ['version'],
          },
        },
      },
      message: 'Missing `info.version` field.',
    },
  },
};

export default adr20;
