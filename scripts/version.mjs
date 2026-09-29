#!/usr/bin/env node
/**
 * VERSION is the single source of truth for Sanctuary's version.
 *
 *   node scripts/version.mjs          → prints the version
 *   node scripts/version.mjs check    → fails unless VERSION is valid SemVer
 *                                        and CHANGELOG.md has a "## [x.y.z]" section for it
 *   node scripts/version.mjs notes [x.y.z] → prints that CHANGELOG section (release notes);
 *                                        defaults to the current VERSION
 */
import { readFileSync } from 'node:fs';

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

function readVersion(text = readFileSync('VERSION', 'utf8')) {
  return text.trim();
}

/** Body of "## [version]" up to the next "## [" heading, trimmed. */
function changelogSection(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## ['));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
}

function main(command, arg) {
  const version = readVersion();
  if (!command) {
    console.log(version);
    return;
  }
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  if (command === 'notes') {
    const section = changelogSection(changelog, arg ?? version);
    if (section === null) process.exit(1);
    console.log(section);
    return;
  }
  const notes = changelogSection(changelog, version);
  if (command === 'check') {
    const problems = [];
    if (!SEMVER.test(version)) problems.push(`VERSION "${version}" is not valid SemVer (x.y.z).`);
    if (!notes) problems.push(`CHANGELOG.md has no "## [${version}]" section with content.`);
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log(`Version ${version} OK`);
    return;
  }
  console.error(`Unknown command: ${command}`);
  process.exit(2);
}

main(process.argv[2], process.argv[3]);
