import type { RulesetDefinition } from '@stoplight/spectral-core';
import { pattern, schema } from '@stoplight/spectral-functions';
import { oas3_0, oas3_1 } from '../formats';
import { oasValidationRules } from '../rules/oas-validation';
import { oasRuleset } from './shared';

export const ADR_22_URI = 'https://logius-standaarden.github.io/API-Design-Rules/2.2';

const adr22: RulesetDefinition = {
  description: 'NLGov REST API Design Rules 2.2',
  extends: [[oasRuleset as RulesetDefinition, 'off']],
  formats: [oas3_0, oas3_1],
  rules: {
    ...oasValidationRules,
    // /core/date-time/timezone
    'nlgov:date-time-ensure-timezone': {
      severity: 'error',
      given: '$..properties[*].format',
      message: 'Use date-time format which includes a timezone',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '^date-time-local$',
        },
      },
    },
    'nlgov:time-without-timezone': {
      severity: 'error',
      given: '$..properties[*].format',
      message: 'Use time-local format without a timezone',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '^time$',
        },
      },
    },

    // /core/date-time/date-omit-time-portion
    'nlgov:specify-format-for-date-and-time': {
      severity: 'error',
      given: ['$..properties[date,datum]', '$..properties[?(@property && @property.match(/((\\w+D)|(_[dD]))((ate)|(atum))/))]'],
      message: "Any date field must set 'format' to 'date'",
      then: {
        function: schema,
        functionOptions: {
          schema: {
            anyOf: [
              { required: ['format'] },
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
      given: [
        '$..properties[date,datum]..format',
        '$..properties[?(@property && @property.match(/((\\w+D)|(_[dD]))((ate)|(atum))/))]..format',
      ],
      message: "Field represents a date and therefore must set 'format' to 'date'",
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '^date-time$',
        },
      },
    },

    // /core/error-handling/problem-details
    'nlgov:use-problem-schema': {
      severity: 'error',
      message: 'The content type of an error response should be application/problem+json or application/problem+xml to match RFC 9457.',
      given: '$..[responses][?(@property && @property.match(/(4|5)\\d\\d/))].content',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            anyOf: [{ required: ['application/problem+json'] }, { required: ['application/problem+xml'] }],
          },
        },
      },
    },
    'nlgov:problem-schema-members': {
      severity: 'error',
      message: '{{error}}. These fields are required: status, title and detail.',
      given:
        '$..[responses][?(@property && @property.match(/(4|5)\\d\\d/))].content[?(@property=="application/problem+json" || @property=="application/problem+xml")]..schema',
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

    // /core/error-handling/invalid-input
    'nlgov:problem-invalid-input': {
      severity: 'error',
      message: 'GET endpoints that have parameters and all other endpoints must be able to return a 400 response',
      given: [
        '$.paths..[?( @property.match(/get/) && @.parameters && @.parameters.length > 0 )]',
        '$.paths..[?( @property.match(/(put)|(post)|(delete)|(patch)/))]',
      ],
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

    // /core/error-handling/bad-request
    'nlgov:problem-schema-members-bad-request': {
      severity: 'error',
      given:
        '$..[responses][?(@property && @property.match(400))].content[?(@property=="application/problem+json" || @property=="application/problem+xml")]..schema.properties',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            type: 'object',
            properties: {
              errors: {
                type: 'object',
                properties: {
                  properties: {
                    type: 'object',
                    properties: {
                      in: {},
                      detail: {},
                      location: {
                        type: 'object',
                        properties: {
                          properties: {
                            type: 'object',
                            properties: {
                              pointer: {},
                              name: {},
                              index: {},
                            },
                            additionalProperties: false,
                          },
                        },
                      },
                      code: {},
                    },
                    required: ['in', 'detail'],
                    additionalProperties: false,
                  },
                },
              },
            },
            required: ['errors'],
          },
        },
      },
    },
  },
};

export default adr22;
