import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import jsYaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULESETS_DIR = join(__dirname, '..', 'src', 'rulesets');

const SOURCES = [
  {
    filename: 'adr-draft.ts',
    url: 'https://logius-standaarden.github.io/API-Design-Rules/media/linter.yaml',
    uri: 'https://logius-standaarden.github.io/API-Design-Rules',
    constName: 'ADR_DRAFT_URI',
    varName: 'adrDraft',
  },
  {
    filename: 'adr-21.ts',
    url: 'https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/media/linter.yaml',
    uri: 'https://logius-standaarden.github.io/API-Design-Rules/2.1',
    constName: 'ADR_21_URI',
    varName: 'adr21',
  },
];

const KNOWN_FUNCTIONS = new Set([
  'alphabetical', 'casing', 'defined', 'enumeration', 'falsy',
  'length', 'or', 'pattern', 'schema', 'truthy', 'undefined',
  'unreferencedReusableObject', 'xor',
]);

function escapeString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');
}

function needsQuoting(key) {
  return !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

function formatKey(key) {
  return needsQuoting(key) ? `'${escapeString(key)}'` : key;
}

function serializeValue(value, indent, propertyName) {
  if (value === null || value === undefined) {
    return 'null';
  }

  // function property values are bare identifiers
  if (propertyName === 'function' && typeof value === 'string' && KNOWN_FUNCTIONS.has(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return `'${escapeString(value)}'`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    // Short arrays of simple values on one line
    if (value.every(v => typeof v === 'string') && value.length <= 5) {
      const items = value.map(v => `'${escapeString(v)}'`);
      return `[${items.join(', ')}]`;
    }
    const items = value.map(v => `${indent}  ${serializeValue(v, indent + '  ', null)},`);
    return `[\n${items.join('\n')}\n${indent}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      return `${indent}  ${formatKey(k)}: ${serializeValue(v, indent + '  ', k)},`;
    });
    return `{\n${lines.join('\n')}\n${indent}}`;
  }

  return String(value);
}

function collectFunctions(obj, functions) {
  if (typeof obj !== 'object' || obj === null) return;

  if (Array.isArray(obj)) {
    obj.forEach(item => collectFunctions(item, functions));
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'function' && typeof value === 'string' && KNOWN_FUNCTIONS.has(value)) {
      functions.add(value);
    } else {
      collectFunctions(value, functions);
    }
  }
}

function generateTs(config, yamlContent) {
  const parsed = jsYaml.load(yamlContent);
  const rules = parsed.rules || {};

  // Collect used functions
  const functions = new Set();
  for (const rule of Object.values(rules)) {
    if (typeof rule === 'object' && rule !== null) {
      collectFunctions(rule, functions);
    }
  }

  // Generate rules block
  const ruleLines = [];
  for (const [name, rule] of Object.entries(rules)) {
    if (typeof rule === 'string') {
      // Shorthand severity override
      ruleLines.push(`    ${formatKey(name)}: '${rule}',`);
    } else {
      ruleLines.push(`    ${formatKey(name)}: ${serializeValue(rule, '    ', null)},`);
    }
  }

  // Build imports
  const imports = [
    `import type { RulesetDefinition } from '@stoplight/spectral-core';`,
  ];
  if (functions.size > 0) {
    const sorted = [...functions].sort();
    imports.push(`import { ${sorted.join(', ')} } from '@stoplight/spectral-functions';`);
  }
  imports.push(`import { oasRuleset } from './shared';`);

  return `// Auto-generated from ${config.url}
// Do not edit manually. Run \`pnpm generate\` to update.

${imports.join('\n')}

export const ${config.constName} = '${config.uri}';

const ${config.varName}: RulesetDefinition = {
  extends: [oasRuleset],
  rules: {
${ruleLines.join('\n')}
  },
};

export default ${config.varName};
`;
}

async function main() {
  for (const source of SOURCES) {
    console.log(`Fetching ${source.url}...`);
    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${response.status} ${response.statusText}`);
    }
    const yamlContent = await response.text();

    const tsContent = generateTs(source, yamlContent);
    const outputPath = join(RULESETS_DIR, source.filename);
    writeFileSync(outputPath, tsContent, 'utf8');
    console.log(`Generated ${outputPath}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
