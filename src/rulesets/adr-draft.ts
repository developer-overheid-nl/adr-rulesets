// Auto-generated from https://logius-standaarden.github.io/API-Design-Rules/media/linter.yaml
// Do not edit manually. Run `pnpm generate` to update.

import type { RulesetDefinition } from '@stoplight/spectral-core';
import { oas2, oas3 } from '@stoplight/spectral-formats';
import { or, pattern, schema, truthy } from '@stoplight/spectral-functions';
import { oasValidationRules } from '../rules/oas-validation';
import { oasRuleset } from './shared';

export const ADR_DRAFT_URI = 'https://logius-standaarden.github.io/API-Design-Rules';

const adrDraft: RulesetDefinition = {
  extends: [[oasRuleset as RulesetDefinition, 'off']],
  formats: [oas3],
  rules: {
    ...oasValidationRules,
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
      formats: [oas2],
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
          notMatch: '.+\\/$',
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
      given: '$.paths[?(@property && !@property.match(/\\/openapi\\.(json)|(yaml)/))]~',
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
    'nlgov:servers-use-https': {
      severity: 'error',
      message: 'Server URL {{value}} {{error}}.',
      given: ['$.servers[*]', '$.paths..servers[*]'],
      then: {
        field: 'url',
        function: pattern,
        functionOptions: {
          notMatch: '^http://.*',
        },
      },
    },
    'nlgov:use-problem-schema': {
      severity: 'error',
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
    'nlgov:problem-schema-members': {
      severity: 'error',
      message: '{{error}}. These fields are required: status, title and detail.',
      given: '$..[responses][?(@property && @property.match(/(4|5)\\d\\d/))].content[?(@property=="application/problem+json" || @property=="application/problem+xml")]..schema',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            type: 'object',
            properties: {
              properties: {
                type: 'object',
                required: ['status', 'title', 'detail'],
              },
            },
          },
        },
      },
    },
    'nlgov:problem-invalid-input': {
      severity: 'error',
      message: 'GET and DELETE endpoints that have parameters, and all other endpoints must be able to return a 400 response',
      given: ['$.paths..[?( @property.match(/(get)|(delete)/) && @.parameters && @.parameters.length > 0 )]', '$.paths..[?( @property.match(/(put)|(post)|(patch)/))]'],
      then: {
        function: schema,
        functionOptions: {
          schema: {
            type: 'object',
            properties: {
              responses: {
                type: 'object',
                required: ['400'],
              },
            },
          },
        },
      },
    },
    'nlgov:date-time-ensure-timezone': {
      severity: 'error',
      given: '$..properties[*].format',
      message: 'Use date-time format which includes a time zone',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '/^date-time-local$/',
        },
      },
    },
    'nlgov:time-without-timezone': {
      severity: 'error',
      given: '$..properties[*].format',
      message: 'Use time-local format without a time zone',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '/^time$/',
        },
      },
    },
    'nlgov:specify-format-for-date-and-time': {
      severity: 'error',
      given: ['$..properties[date,datum]', '$..properties[?(@property && @property.match(/((\\w+D)|(_[dD]))((ate)|(atum))/))]'],
      message: 'Any date field must set \'format\' to \'date\'',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            anyOf: [
              {
                required: ['format'],
              },
              {
                properties: {
                  allOf: {
                    type: 'array',
                    items: {
                      required: ['format'],
                    },
                  },
                },
                required: ['allOf'],
              },
            ],
          },
        },
      },
    },
    'nlgov:use-date-instead-of-datetime': {
      severity: 'error',
      given: ['$..properties[date,datum]..format', '$..properties[?(@property && @property.match(/((\\w+D)|(_[dD]))((ate)|(atum))/))]..format'],
      message: 'Field represents a date and therefore must set \'format\' to \'date\'',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '/^date-time$/',
        },
      },
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

export default adrDraft;
