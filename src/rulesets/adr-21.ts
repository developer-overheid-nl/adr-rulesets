// Auto-generated from https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/media/linter.yaml
// Do not edit manually. Run `pnpm generate` to update.

import type { RulesetDefinition } from '@stoplight/spectral-core';
import { casing, or, pattern, schema, truthy } from '@stoplight/spectral-functions';
import { oasValidationRules } from '../rules/oas-validation';
import { adr21FutureWarnings } from './adr-21-future-warnings';
import { oasRuleset } from './shared';

export const ADR_21_URI = 'https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0';

const adr21: RulesetDefinition = {
  extends: [oasRuleset],
  rules: {
    ...adr21FutureWarnings,
    ...oasValidationRules,
    'oas3-api-servers': 'error',
    openapi3: {
      severity: 'error',
      given: ['$.[\'openapi\']'],
      then: {
        function: pattern,
        functionOptions: {
          match: '^3.0.*$',
        },
      },
      message: 'Use OpenAPI Specification for documentation',
    },
    'missing-version-header': {
      severity: 'error',
      given: '$..[responses][?(@property && @property.match(/(2|3)\\d\\d/))][headers]',
      then: {
        function: or,
        functionOptions: {
          properties: ['API-Version', 'Api-Version', 'Api-version', 'api-version', 'API-version'],
        },
      },
      message: 'Return the full version number in a response header',
    },
    'missing-header': {
      severity: 'error',
      given: '$..[responses][?(@property && @property.match(/(2|3)\\d\\d/))]',
      then: {
        field: 'headers',
        function: truthy,
      },
      message: '/core/version-header: Return the full version number in a response header: https://logius-standaarden.github.io/API-Design-Rules/#/core/version-header',
    },
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
      message: '/core/uri-version: Include the major version number in the URI: https://logius-standaarden.github.io/API-Design-Rules/#/core/uri-version',
    },
    'paths-no-trailing-slash': {
      severity: 'error',
      given: ['$.paths'],
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '.+ \\/$',
        },
        field: '@key',
      },
      message: '/core/no-trailing-slash: Leave off trailing slashes from URIs: https://logius-standaarden.github.io/API-Design-Rules/#/core/no-trailing-slash',
    },
    'paths-open-api-json-resource-exists': {
      severity: 'error',
      given: ['$.paths'],
      then: {
        function: truthy,
        field: '/openapi.json',
      },
      message: 'There does not exist a resource `/openapi.json` that returns the OpenAPI specification document',
    },
    'paths-open-api-json-resource-has-get': {
      severity: 'error',
      given: ['$.paths[/openapi.json]'],
      then: {
        function: pattern,
        functionOptions: {
          match: 'get',
        },
        field: '@key',
      },
      message: 'There does not exist a GET method (and no other methods) for the `/openapi.json` resource',
    },
    'paths-open-api-json-specify-cors-header': {
      severity: 'error',
      given: ['$.paths[/openapi.json].get.responses[?(@property && @property.match(/(2|3)\\d\\d/))].headers'],
      then: {
        function: truthy,
        field: 'access-control-allow-origin',
      },
      message: 'The response of the `/openapi.json` resource should set the `access-control-allow-origin` header with value `*`',
    },
    'info-contact': 'error',
    'info-contact-fields-exist': {
      severity: 'error',
      given: ['$.info.contact'],
      then: {
        function: schema,
        functionOptions: {
          schema: {
            required: ['email', 'name', 'url'],
          },
        },
      },
      message: 'Missing fields in `info.contact` field. Must specify email, name and url.',
    },
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
      message: '/core/http-methods: Only apply standard HTTP methods: https://logius-standaarden.github.io/API-Design-Rules/#http-methods',
    },
    'paths-kebab-case': {
      severity: 'warn',
      message: '{{property}} is not kebab-case.',
      given: '$.paths[?(@property && !@property.match(/\\/openapi\\.json/))]~',
      then: {
        function: pattern,
        functionOptions: {
          match: '^(\\/|(\\/_[a-z0-9]+|\\/(([a-z0-9\\-]+|{[^}]+})(\\/([a-z0-9\\-\\.]+|{[^}]+}))*)(\\/_[a-z]+)?)\\/?)$',
        },
      },
    },
    'schema-camel-case': {
      severity: 'warn',
      message: 'Schema name should be CamelCase in {{path}}',
      given: '$.components.schemas[*]~',
      then: {
        function: casing,
        functionOptions: {
          type: 'pascal',
          separator: {
            char: '',
          },
        },
      },
    },
    'servers-use-https': {
      severity: 'warn',
      message: 'Server URL {{value}} {{error}}.',
      given: ['$.servers[*]', '$.paths..servers[*]'],
      then: {
        field: 'url',
        function: pattern,
        functionOptions: {
          match: '^https://.*',
        },
      },
    },
    'use-problem-schema': {
      severity: 'warn',
      message: 'The content type of an error response should be application/problem+json or application/problem+xml to match RFC 9457.',
      given: '$..[responses][?(@property && @property.match(/(4|5)\\d\\d/))].content',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            anyOf: [
              {
                required: ['application/problem+json'],
              },
              {
                required: ['application/problem+xml'],
              },
            ],
          },
        },
      },
    },
    'property-casing': {
      severity: 'warn',
      given: ['$.*.schemas[*].properties.[?(@property && @property.match(/_links/i))]'],
      then: {
        function: casing,
        functionOptions: {
          type: 'camel',
        },
        field: '@key',
      },
      message: 'Properties must be lowerCamelCase.',
    },
  },
};

export default adr21;
