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

  it('declares one skill, one agent, five commands', () => {
    expect(manifest.skills).toEqual(['skills/edgepress']);
    expect(manifest.agents).toEqual(['agents/edgepress-workflow.md']);
    expect(manifest.commands).toEqual([
      'commands/setup.md',
      'commands/whoami.md',
      'commands/doctor.md',
      'commands/spec.md',
      'commands/workflow.md',
    ]);
  });
});

describe('manifest ↔ file tree', () => {
  const entries = [
    ...manifest.skills.map((p) => ({ kind: 'skill', path: p, mustBeDir: true })),
    ...manifest.agents.map((p) => ({ kind: 'agent', path: p, mustBeDir: false })),
    ...manifest.commands.map((p) => ({ kind: 'command', path: p, mustBeDir: false })),
  ];
  it.each(entries)('$kind $path exists on disk', ({ path, mustBeDir }) => {
    const full = join(ROOT, path);
    expect(existsSync(full), `${path} missing`).toBe(true);
    if (mustBeDir) expect(statSync(full).isDirectory()).toBe(true);
    else expect(statSync(full).isFile()).toBe(true);
  });
});
