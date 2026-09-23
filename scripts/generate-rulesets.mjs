import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import jsYaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const RULESETS_DIR = join(ROOT_DIR, 'src', 'rulesets');
const RULES_DIR = join(ROOT_DIR, 'src', 'rules');

// Versions ordered oldest → newest. Every version (except the newest) gets a
// `<name>-future-warnings.ts` file containing rules that are errors in any
// newer version but missing from the version itself, exposed as warnings so
// users get advance notice before they become hard errors.
const VERSIONS = [
  {
    name: 'adr-20',
    filename: 'adr-20.ts',
    uri: 'https://gitdocumentatie.logius.nl/publicatie/api/adr/2.0.0',
    constName: 'ADR_20_URI',
    varName: 'adr20',
    handWritten: true,
    warningsName: 'adr20FutureWarnings',
    warningsFilename: 'adr-20-future-warnings.ts',
  },
  {
    name: 'adr-21',
    filename: 'adr-21.ts',
    url: 'https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/media/linter.yaml',
    uri: 'https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0',
    constName: 'ADR_21_URI',
    varName: 'adr21',
    handWritten: false,
    warningsName: 'adr21FutureWarnings',
    warningsFilename: 'adr-21-future-warnings.ts',
  },
  {
    name: 'adr-22',
    filename: 'adr-22.ts',
    url: 'https://gitdocumentatie.logius.nl/publicatie/api/adr/2.2.0/media/linter.yaml',
    uri: 'https://gitdocumentatie.logius.nl/publicatie/api/adr/2.2.0',
    constName: 'ADR_22_URI',
    varName: 'adr22',
    handWritten: false,
  },
];

const DRAFT = {
  name: 'adr-draft',
  filename: 'adr-draft.ts',
  url: 'https://logius-standaarden.github.io/API-Design-Rules/media/linter.yaml',
  uri: 'https://logius-standaarden.github.io/API-Design-Rules',
  constName: 'ADR_DRAFT_URI',
  varName: 'adrDraft',
};

const KNOWN_FUNCTIONS = new Set([
  'alphabetical', 'casing', 'defined', 'enumeration', 'falsy',
  'length', 'or', 'pattern', 'schema', 'truthy', 'undefined',
  'unreferencedReusableObject', 'xor',
]);

// Format names Spectral resolves for YAML/JSON rulesets. In a JS ruleset the
// `formats` entries have to be the actual Format functions, so we emit them as
// identifiers imported from @stoplight/spectral-formats.
const KNOWN_FORMATS = new Set([
  'oas2', 'oas3', 'oas3_0', 'oas3_1',
  'aas2', 'aas3', 'asyncApi2', 'asyncapi2',
  'aas2_0', 'aas2_1', 'aas2_2', 'aas2_3', 'aas2_4', 'aas2_5', 'aas2_6', 'aas3_0',
  'jsonSchema', 'jsonSchemaLoose', 'jsonSchemaDraft4', 'jsonSchemaDraft6',
  'jsonSchemaDraft7', 'jsonSchemaDraft2019_09', 'jsonSchemaDraft2020_12',
  'arazzo1_0',
]);

function formatIdentifier(name) {
  if (typeof name !== 'string' || !KNOWN_FORMATS.has(name)) {
    throw new Error(`Unknown format \`${name}\`; add it to KNOWN_FORMATS if @stoplight/spectral-formats exports it`);
  }
  return name;
}

// @stoplight/spectral-formats re-exports via tslib's __exportStar, which Node
// cannot statically detect, so named ESM imports fail at runtime there. Bundlers
// do detect them, and then hand back a namespace whose `default` is undefined.
// Take the namespace and unwrap `default` only when it is there, the same way
// ./shared does for the oas ruleset, so both loaders work.
function formatsImport(names) {
  return [
    `import * as spectralFormats from '@stoplight/spectral-formats';`,
    `const { ${names.join(', ')} } = (spectralFormats as { default?: typeof spectralFormats }).default ?? spectralFormats;`,
  ].join('\n');
}

function serializeFormats(value) {
  const names = Array.isArray(value) ? value : [value];
  return `[${names.map(formatIdentifier).join(', ')}]`;
}

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

  if (propertyName === 'function' && typeof value === 'string' && KNOWN_FUNCTIONS.has(value)) {
    return value;
  }

  if (propertyName === 'formats') {
    return serializeFormats(value);
  }

  if (typeof value === 'string') {
    return `'${escapeString(value)}'`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
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

function collectFormats(obj, formats) {
  if (typeof obj !== 'object' || obj === null) return;

  if (Array.isArray(obj)) {
    obj.forEach(item => collectFormats(item, formats));
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'formats') {
      const names = Array.isArray(value) ? value : [value];
      names.forEach(name => formats.add(formatIdentifier(name)));
    } else {
      collectFormats(value, formats);
    }
  }
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

// Returns the set of top-level keys inside the object whose opening brace
// follows `openMarker` in `text`. Brace-depth tracking ignores keys nested
// deeper than the immediate object, so we only collect rule names.
function extractTopLevelKeys(text, openMarker) {
  const startIdx = text.indexOf(openMarker);
  if (startIdx === -1) return new Set();
  let i = startIdx + openMarker.length;
  let depth = 1;
  let buffer = '';
  while (i < text.length && depth > 0) {
    const ch = text[i];
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
    } else if (depth === 1) {
      buffer += ch;
    }
    i++;
  }
  const names = new Set();
  const re = /(?:^|[,\n])\s*(?:'([^']+)'|([a-zA-Z_$][a-zA-Z0-9_$-]*))\s*:/g;
  let m;
  while ((m = re.exec(buffer)) !== null) {
    names.add(m[1] || m[2]);
  }
  return names;
}

function getHandWrittenRuleNames(v) {
  const filePath = join(RULESETS_DIR, v.filename);
  const fileText = readFileSync(filePath, 'utf8');
  const names = extractTopLevelKeys(fileText, 'rules: {');
  // Include rules contributed via known spread imports
  if (fileText.includes('...oasValidationRules')) {
    for (const name of getOasValidationRuleNames()) {
      names.add(name);
    }
  }
  return names;
}

function stripNlgovPrefix(name) {
  return name.startsWith('nlgov:') ? name.slice('nlgov:'.length) : name;
}

function isErrorRule(rule) {
  if (typeof rule === 'string') return rule === 'error';
  if (typeof rule !== 'object' || rule === null) return false;
  return rule.severity === 'error' || rule.severity === 0;
}

function displayVersion(name) {
  const m = name.match(/^adr-(\d)(\d)$/);
  return m ? `ADR ${m[1]}.${m[2]}` : name;
}

function annotateMessage(originalMessage, sourceVersionName) {
  const note = `(becomes an error in ${displayVersion(sourceVersionName)})`;
  return originalMessage ? `${originalMessage} ${note}` : note;
}

let oasValidationRuleNamesCache = null;
function getOasValidationRuleNames() {
  if (oasValidationRuleNamesCache !== null) return oasValidationRuleNamesCache;
  const oasValText = readFileSync(join(RULES_DIR, 'oas-validation.ts'), 'utf8');
  // Locate the const declaration and walk to its opening brace so the marker
  // is tolerant of optional type annotations.
  const declIdx = oasValText.search(/\boasValidationRules\b[^=]*=\s*\{/);
  if (declIdx === -1) {
    throw new Error('Could not locate `oasValidationRules` declaration in oas-validation.ts');
  }
  const braceIdx = oasValText.indexOf('{', declIdx);
  const fromBrace = oasValText.slice(braceIdx);
  oasValidationRuleNamesCache = extractTopLevelKeys(fromBrace, '{');
  return oasValidationRuleNamesCache;
}

function computeFutureWarnings(currentVersion, allVersions, parsedRulesByVersion) {
  const currentIndex = allVersions.indexOf(currentVersion);
  const baseNames = currentVersion.handWritten
    ? getHandWrittenRuleNames(currentVersion)
    : new Set(Object.keys(parsedRulesByVersion[currentVersion.name] || {}));
  // oasValidationRules is spread into every version, so its rule names always
  // count as covered when deciding what to lift into future warnings.
  for (const name of getOasValidationRuleNames()) {
    baseNames.add(name);
  }

  const warnings = {};
  const seen = new Set();
  // Walk newer versions in order so the FIRST occurrence (closest next
  // version that promotes the rule to an error) wins.
  for (let j = currentIndex + 1; j < allVersions.length; j++) {
    const newer = allVersions[j];
    const newerRules = parsedRulesByVersion[newer.name] || {};
    for (const [name, rule] of Object.entries(newerRules)) {
      if (!isErrorRule(rule)) continue;
      const stripped = stripNlgovPrefix(name);
      if (baseNames.has(name) || baseNames.has(stripped)) continue;
      if (seen.has(name) || seen.has(stripped)) continue;
      seen.add(name);
      seen.add(stripped);
      // String-shorthand overrides (e.g. 'oas3-schema': 'error') can't carry a
      // custom message — they're severity-only overrides for an upstream rule.
      // Object-form rules get their message annotated with the source version.
      if (typeof rule === 'string') {
        warnings[name] = 'warn';
      } else {
        warnings[name] = {
          ...rule,
          severity: 'warn',
          message: annotateMessage(rule.message, newer.name),
        };
      }
    }
  }
  return warnings;
}

function generateFutureWarningsFile(v, warnings, sourceUrls) {
  const functions = new Set();
  const formats = new Set();
  for (const rule of Object.values(warnings)) {
    if (typeof rule === 'object' && rule !== null) {
      collectFunctions(rule, functions);
      collectFormats(rule, formats);
    }
  }

  const ruleLines = [];
  for (const [name, rule] of Object.entries(warnings)) {
    if (typeof rule === 'string') {
      ruleLines.push(`  ${formatKey(name)}: '${rule}',`);
    } else {
      ruleLines.push(`  ${formatKey(name)}: ${serializeValue(rule, '  ', null)},`);
    }
  }

  const imports = [
    `import type { HumanReadableDiagnosticSeverity, RuleDefinition } from '@stoplight/spectral-core';`,
  ];
  if (formats.size > 0) {
    const sorted = [...formats].sort();
    imports.push(formatsImport(sorted));
  }
  if (functions.size > 0) {
    const sorted = [...functions].sort();
    imports.push(`import { ${sorted.join(', ')} } from '@stoplight/spectral-functions';`);
  }

  const sourceList = sourceUrls.map(u => `//   - ${u}`).join('\n');
  const body = ruleLines.length > 0 ? `\n${ruleLines.join('\n')}\n` : '';

  return `// Auto-generated by scripts/generate-rulesets.mjs.
// Do not edit manually. Run \`pnpm generate\` to update.
//
// Error rules from newer ADR versions that are missing in ${v.name}, exposed
// as warnings so users get advance notice before the rule becomes a hard
// error in a future version. Source rulesets:
${sourceList}

${imports.join('\n')}

export const ${v.warningsName}: Record<string, RuleDefinition | HumanReadableDiagnosticSeverity> = {${body}};
`;
}

// Convert a parsed YAML `extends:` value into a TS expression. Currently only
// the `spectral:oas` reference is supported (which is all our source YAMLs
// use); anything else throws so we notice immediately.
function serializeExtendsEntry(entry) {
  if (typeof entry === 'string') {
    if (entry === 'spectral:oas') return 'oasRuleset';
    throw new Error(`Unsupported extends reference: ${entry}`);
  }
  if (Array.isArray(entry) && entry.length === 2) {
    const [ref, severity] = entry;
    if (ref !== 'spectral:oas') {
      throw new Error(`Unsupported extends reference: ${ref}`);
    }
    return `[oasRuleset as RulesetDefinition, '${severity}']`;
  }
  throw new Error(`Unrecognised extends entry: ${JSON.stringify(entry)}`);
}

function serializeExtends(parsedExtends) {
  if (parsedExtends === undefined || parsedExtends === null) {
    return '[oasRuleset]';
  }
  if (typeof parsedExtends === 'string' || (Array.isArray(parsedExtends) && parsedExtends.length === 2 && typeof parsedExtends[0] === 'string' && !Array.isArray(parsedExtends[0]))) {
    // A single reference (string) or a single tuple at the top level.
    return `[${serializeExtendsEntry(parsedExtends)}]`;
  }
  if (Array.isArray(parsedExtends)) {
    const items = parsedExtends.map(serializeExtendsEntry);
    return `[${items.join(', ')}]`;
  }
  throw new Error(`Unsupported extends shape: ${JSON.stringify(parsedExtends)}`);
}

function generateVersionTs(v, yamlContent) {
  const parsed = jsYaml.load(yamlContent);
  const rules = parsed.rules || {};
  const extendsExpr = serializeExtends(parsed.extends);

  const functions = new Set();
  const formats = new Set();
  for (const rule of Object.values(rules)) {
    if (typeof rule === 'object' && rule !== null) {
      collectFunctions(rule, functions);
      collectFormats(rule, formats);
    }
  }
  // A ruleset-level `formats` scopes every rule that doesn't override it.
  const rulesetFormats = parsed.formats;
  if (rulesetFormats !== undefined && rulesetFormats !== null) {
    collectFormats({ formats: rulesetFormats }, formats);
  }

  const oasValNames = getOasValidationRuleNames();
  const ruleLines = [];
  if (v.warningsName) {
    ruleLines.push(`    ...${v.warningsName},`);
  }
  ruleLines.push(`    ...oasValidationRules,`);
  for (const [name, rule] of Object.entries(rules)) {
    // Skip rules that oasValidationRules already covers; the spread above
    // enforces 'error' severity for those and the YAML override is redundant.
    if (oasValNames.has(name)) continue;
    if (typeof rule === 'string') {
      ruleLines.push(`    ${formatKey(name)}: '${rule}',`);
    } else {
      ruleLines.push(`    ${formatKey(name)}: ${serializeValue(rule, '    ', null)},`);
    }
  }

  const imports = [
    `import type { RulesetDefinition } from '@stoplight/spectral-core';`,
  ];
  if (formats.size > 0) {
    const sorted = [...formats].sort();
    imports.push(formatsImport(sorted));
  }
  if (functions.size > 0) {
    const sorted = [...functions].sort();
    imports.push(`import { ${sorted.join(', ')} } from '@stoplight/spectral-functions';`);
  }
  imports.push(`import { oasValidationRules } from '../rules/oas-validation';`);
  if (v.warningsName) {
    const warningsBase = v.warningsFilename.replace(/\.ts$/, '');
    imports.push(`import { ${v.warningsName} } from './${warningsBase}';`);
  }
  imports.push(`import { oasRuleset } from './shared';`);

  const rulesetFormatsLine =
    rulesetFormats === undefined || rulesetFormats === null
      ? ''
      : `\n  formats: ${serializeFormats(rulesetFormats)},`;

  return `// Auto-generated from ${v.url}
// Do not edit manually. Run \`pnpm generate\` to update.

${imports.join('\n')}

export const ${v.constName} = '${v.uri}';

const ${v.varName}: RulesetDefinition = {
  extends: ${extendsExpr},${rulesetFormatsLine}
  rules: {
${ruleLines.join('\n')}
  },
};

export default ${v.varName};
`;
}

async function fetchYaml(source) {
  console.log(`Fetching ${source.url}...`);
  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function main() {
  const yamlByName = {};
  const parsedRulesByVersion = {};

  // Fetch all sources that have a URL
  const fetchable = [...VERSIONS.filter(v => !v.handWritten), DRAFT];
  for (const source of fetchable) {
    const yaml = await fetchYaml(source);
    yamlByName[source.name] = yaml;
    parsedRulesByVersion[source.name] = jsYaml.load(yaml)?.rules || {};
  }

  // Compute future warnings for every version that has newer versions after it
  const warningsByVersion = {};
  for (let i = 0; i < VERSIONS.length - 1; i++) {
    const v = VERSIONS[i];
    if (!v.warningsName) continue;
    const warnings = computeFutureWarnings(v, VERSIONS, parsedRulesByVersion);
    warningsByVersion[v.name] = warnings;
    const newerUrls = VERSIONS.slice(i + 1).filter(n => n.url).map(n => n.url);
    const warningsTs = generateFutureWarningsFile(v, warnings, newerUrls);
    const warningsPath = join(RULESETS_DIR, v.warningsFilename);
    writeFileSync(warningsPath, warningsTs, 'utf8');
    console.log(`Generated ${warningsPath} (${Object.keys(warnings).length} warning rules)`);
  }

  // Generate auto-generated version files (after warnings, so the spread refs resolve)
  for (const v of VERSIONS) {
    if (v.handWritten) continue;
    const tsContent = generateVersionTs(v, yamlByName[v.name]);
    const outputPath = join(RULESETS_DIR, v.filename);
    writeFileSync(outputPath, tsContent, 'utf8');
    console.log(`Generated ${outputPath}`);
  }

  // Generate draft (no warnings infrastructure; tracks its own future)
  const draftTs = generateVersionTs(DRAFT, yamlByName[DRAFT.name]);
  const draftPath = join(RULESETS_DIR, DRAFT.filename);
  writeFileSync(draftPath, draftTs, 'utf8');
  console.log(`Generated ${draftPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
