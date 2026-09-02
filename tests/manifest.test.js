import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const manifest = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));

describe('plugin.json', () => {
  it('parses as JSON', () => {
    expect(manifest).toBeTypeOf('object');
  });

  it('has the required top-level fields', () => {
    expect(manifest.name).toBe('edgepress');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.license).toBe('MIT');
    expect(manifest.description).toBeTypeOf('string');
    expect(manifest.description.length).toBeGreaterThan(0);
  });

  it('author is an object with name (Claude Code manifest schema)', () => {
    expect(manifest.author).toBeTypeOf('object');
    expect(manifest.author.name).toBeTypeOf('string');
    expect(manifest.author.name.length).toBeGreaterThan(0);
  });

  it('does NOT declare skills/agents/commands arrays — those are auto-discovered from the file tree', () => {
    // The Claude Code plugin loader walks skills/, agents/, commands/ itself.
    // Declaring these as arrays in the manifest fails schema validation.
    expect(manifest.skills).toBeUndefined();
    expect(manifest.agents).toBeUndefined();
    expect(manifest.commands).toBeUndefined();
  });
});

// The plugin loader auto-discovers these files; we still pin their existence
// so a rename or delete breaks the test suite before it breaks users.
describe('plugin file tree (auto-discovered by Claude Code)', () => {
  const expected = [
    { kind: 'skill', path: 'skills/edgepress', mustBeDir: true },
    { kind: 'skill', path: 'skills/edgepress/SKILL.md', mustBeDir: false },
    { kind: 'agent', path: 'agents/edgepress-workflow.md', mustBeDir: false },
    { kind: 'command', path: 'commands/setup.md', mustBeDir: false },
    { kind: 'command', path: 'commands/whoami.md', mustBeDir: false },
    { kind: 'command', path: 'commands/doctor.md', mustBeDir: false },
    { kind: 'command', path: 'commands/spec.md', mustBeDir: false },
    { kind: 'command', path: 'commands/workflow.md', mustBeDir: false },
  ];
  it.each(expected)('$kind $path exists on disk', ({ path, mustBeDir }) => {
    const full = join(ROOT, path);
    expect(existsSync(full), `${path} missing`).toBe(true);
    if (mustBeDir) expect(statSync(full).isDirectory()).toBe(true);
    else expect(statSync(full).isFile()).toBe(true);
  });
});
