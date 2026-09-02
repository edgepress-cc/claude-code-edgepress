import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, '..', 'skills/edgepress');
const SKILL_FILE = join(SKILL_DIR, 'SKILL.md');

function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

describe('SKILL.md', () => {
  const src = readFileSync(SKILL_FILE, 'utf8');
  const fm = frontmatter(src);

  it('has a valid frontmatter block', () => {
    expect(fm).not.toBeNull();
  });

  it('name is "edgepress"', () => {
    expect(fm.name).toBe('edgepress');
  });

  it('description is non-empty and mentions the API', () => {
    expect(fm.description.length).toBeGreaterThan(60);
    expect(fm.description).toMatch(/EdgePress|api|API/);
  });

  it('contains every required section header', () => {
    const requiredSections = [
      'Setup check', 'The `ep` script', 'When to load a reference',
      'Top-level workflows', 'When to hand off', 'Common pitfalls',
      'Domain quick reference', 'Reference index', 'Session output style',
    ];
    for (const h of requiredSections) {
      expect(src, `missing section: ${h}`).toContain(h);
    }
  });
});

describe('Reference index ↔ references/ dir (bidirectional pin)', () => {
  const src = readFileSync(SKILL_FILE, 'utf8');
  const REFERENCED_IN_SKILL = [
    ...src.matchAll(/references\/([a-z-]+)\.md/g),
  ].map((m) => m[1]);

  const REFERENCES_ON_DISK = existsSync(join(SKILL_DIR, 'references'))
    ? readdirSync(join(SKILL_DIR, 'references'))
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''))
    : [];

  const REQUIRED_DOMAINS = [
    'posts', 'pages', 'media', 'categories-tags', 'users',
    'podcasts', 'daily-cartoons', 'settings', 'api-tokens',
  ];

  it.each(REQUIRED_DOMAINS)('SKILL.md references domain: %s', (domain) => {
    expect(REFERENCED_IN_SKILL, `SKILL.md does not mention references/${domain}.md`)
      .toContain(domain);
  });

  it.each(REQUIRED_DOMAINS)('references/%s.md exists on disk', (domain) => {
    expect(REFERENCES_ON_DISK, `references/${domain}.md missing`).toContain(domain);
  });

  it('every references/*.md file on disk is mentioned in SKILL.md', () => {
    for (const d of REFERENCES_ON_DISK) {
      expect(REFERENCED_IN_SKILL, `orphan reference: references/${d}.md not linked from SKILL.md`)
        .toContain(d);
    }
  });
});

describe('edgepress-workflow agent', () => {
  const src = readFileSync(join(__dirname, '..', 'agents/edgepress-workflow.md'), 'utf8');
  const fm = frontmatter(src);

  it('has a valid frontmatter block', () => {
    expect(fm).not.toBeNull();
  });

  it('name is "edgepress-workflow"', () => {
    expect(fm.name).toBe('edgepress-workflow');
  });

  it('declares a minimal tool set (no Agent/WebFetch)', () => {
    expect(fm.tools).toBeTypeOf('string');
    expect(fm.tools).toContain('Bash');
    expect(fm.tools).not.toContain('Agent');
    expect(fm.tools).not.toContain('WebFetch');
  });

  it('description mentions autonomous multi-step workflows', () => {
    expect(fm.description).toMatch(/multi-step|autonomous|workflow/i);
  });

  it('body contains work-list + idempotency + rate-limit sections', () => {
    for (const kw of ['work-list', 'idempoten', 'rate limit', 'report contract', 'non-goals']) {
      expect(src.toLowerCase()).toContain(kw.toLowerCase());
    }
  });
});

describe('slash commands', () => {
  const CMDS = ['setup', 'whoami', 'doctor', 'spec', 'workflow'];
  const dir = join(__dirname, '..', 'commands');

  it.each(CMDS)('%s.md has a description frontmatter', (name) => {
    const src = readFileSync(join(dir, `${name}.md`), 'utf8');
    const fm = frontmatter(src);
    expect(fm, `${name}.md missing frontmatter`).not.toBeNull();
    expect(fm.description, `${name}.md missing description`).toBeTypeOf('string');
    expect(fm.description.length).toBeGreaterThan(20);
  });

  it('workflow.md body accepts a $1 task argument', () => {
    const src = readFileSync(join(dir, 'workflow.md'), 'utf8');
    expect(src).toContain('$1');
  });
});
