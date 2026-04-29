// Auto-generated from https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/media/linter.yaml
// Do not edit manually. Run `pnpm generate` to update.

import type { RulesetDefinition } from '@stoplight/spectral-core';
import { casing, or, pattern, schema, truthy } from '@stoplight/spectral-functions';
import { oasRuleset } from './shared';

export const ADR_21_URI = 'https://logius-standaarden.github.io/API-Design-Rules/2.1';

const adr21: RulesetDefinition = {
  extends: [oasRuleset],
  rules: {
    'oas3-api-servers': 'error',
    'nlgov:openapi3': {
      severity: 'error',
      given: '$.[\'openapi\']',
      then: {
        function: pattern,
        functionOptions: {
          match: '^3(.\\d+){1,2}$',
        },
      },
      message: 'The OpenAPI Specification is versioned using a `major.minor.patch` versioning scheme. Use a version 3 OpenAPI Specification for documentation.',
    },
    'nlgov:openapi-root-exists': {
      severity: 'error',
      given: '$',
      then: {
        field: 'openapi',
        function: truthy,
      },
      message: 'The root of the document must contain the `openapi` property.',
    },
    'nlgov:missing-version-header': {
      severity: 'error',
      given: '$..[responses][?(@property && @property.match(/(2|3)\\d\\d/))][headers]',
      then: {
        function: or,
        functionOptions: {
          properties: ['API-Version', 'Api-Version', 'Api-version', 'api-version', 'API-version'],
        },
      },
      message: 'Return the full version number in a response header.',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/version-header',
    },
    'nlgov:missing-header': {
      severity: 'error',
      given: '$..[responses][?(@property && @property.match(/(2|3)\\d\\d/))]',
      then: {
        field: 'headers',
        function: truthy,
      },
      message: 'Return the full version number in a response header.',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/version-header',
    },
    'nlgov:include-major-version-in-uri': {
      severity: 'error',
      given: ['$.servers[*]'],
      then: {
        function: pattern,
        functionOptions: {
          match: '\\/v[\\d+]',
        },
        field: 'url',
      },
      message: 'Include the major version number in the URI.',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/uri-version',
    },
    'nlgov:paths-no-trailing-slash': {
      severity: 'error',
      given: ['$.paths'],
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '.+ \\/$',
        },
        field: '@key',
      },
      message: 'Leave off trailing slashes from URIs.',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/no-trailing-slash',
    },
    'info-contact': {
      severity: 'error',
      given: ['$'],
      then: {
        field: 'info.contact',
        function: truthy,
      },
      message: 'Info object must have "contact" object.',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/doc-openapi-contact',
    },
    'nlgov:info-contact-fields-exist': {
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
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/doc-openapi-contact',
    },
    'nlgov:http-methods': {
      severity: 'error',
      given: ['$.paths[?(@property && @property.match(/(description|summary)/i))]'],
      then: {
        function: pattern,
        functionOptions: {
          match: 'post|put|get|delete|patch|parameters',
        },
        field: '@key',
      },
      message: 'Only apply standard HTTP methods.',
      documentationUrl: 'https://developer.overheid.nl/kennisbank/apis/api-design-rules/hoe-te-voldoen/http-methods',
    },
    'nlgov:paths-kebab-case': {
      severity: 'error',
      message: '{{property}} is not kebab-case.',
      given: '$.paths[?(@property && !@property.match(/\\/openapi\\.json/))]~',
      then: {
        function: pattern,
        functionOptions: {
          match: '^(\\/|(\\/_[a-z0-9]+|\\/(([a-z0-9\\-]+|{[^}]+})(\\/([a-z0-9\\-\\.]+|{[^}]+}))*)(\\/_[a-z]+)?)\\/?)$',
        },
      },
    },
    'nlgov:query-keys-camel-case': {
      severity: 'error',
      message: '{{value}} is not lower camelCase.',
      given: ['$.paths.*.*.parameters[?(@.in==\'query\')]', '$.components.securitySchemes[?(@.in==\'query\')]'],
      then: {
        function: pattern,
        field: 'name',
        functionOptions: {
          match: '^\\$?[a-z][a-z\\d]*([A-Z][a-z\\d]*)*$',
        },
      },
    },
    'nlgov:schema-camel-case': {
      severity: 'warn',
      message: 'Schema name should be UpperCamelCase in {{path}}',
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
    'nlgov:servers-use-https': {
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
    'nlgov:use-problem-schema': {
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
    'nlgov:property-casing': {
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
    'nlgov:semver': {
      severity: 'error',
      message: 'Version {{value}} is not in semver format.',
      given: '$.info.version',
      then: {
        function: pattern,
        functionOptions: {
          match: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
        },
      },
    },
  },
};

export default adr21;
