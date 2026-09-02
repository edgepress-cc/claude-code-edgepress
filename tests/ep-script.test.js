import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EP = join(__dirname, '..', 'skills/edgepress/scripts/ep');

function run(args, env = {}) {
  return spawnSync('bash', [EP, ...args], {
    env: { PATH: process.env.PATH, ...env },
    encoding: 'utf8',
  });
}

describe('ep script — --endpoint dry-run (URL construction)', () => {
  const auth = { EDGEPRESS_TENANT: 'blog.edgepress.cc', EDGEPRESS_TOKEN: 'epat_test' };

  it('builds the correct URL for a simple GET', () => {
    const r = run(['--endpoint', 'GET', '/posts'], auth);
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toBe('GET https://blog.edgepress.cc/api/v1/posts');
  });

  it('preserves query strings verbatim', () => {
    const r = run(['--endpoint', 'GET', '/posts?limit=10&status=draft'], auth);
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toBe('GET https://blog.edgepress.cc/api/v1/posts?limit=10&status=draft');
  });

  it('preserves path parameters', () => {
    const r = run(['--endpoint', 'DELETE', '/posts/42'], auth);
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toBe('DELETE https://blog.edgepress.cc/api/v1/posts/42');
  });
});

describe('ep script — env-var guard', () => {
  it('exits 3 with a clear message when EDGEPRESS_TENANT is missing', () => {
    const r = run(['--endpoint', 'GET', '/posts'], { EDGEPRESS_TOKEN: 'epat_test' });
    expect(r.status).toBe(3);
    expect(r.stderr).toContain('EDGEPRESS_TENANT');
    expect(r.stderr).toContain('/edgepress:setup');
  });

  it('exits 3 with a clear message when EDGEPRESS_TOKEN is missing', () => {
    const r = run(['--endpoint', 'GET', '/posts'], { EDGEPRESS_TENANT: 'blog.edgepress.cc' });
    expect(r.status).toBe(3);
    expect(r.stderr).toContain('EDGEPRESS_TOKEN');
    expect(r.stderr).toContain('/edgepress:setup');
  });
});

describe('ep script — argument validation', () => {
  const auth = { EDGEPRESS_TENANT: 'blog.edgepress.cc', EDGEPRESS_TOKEN: 'epat_test' };

  it('exits 2 with usage when METHOD is missing', () => {
    const r = run([], auth);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('usage:');
  });

  it('exits 2 with usage when PATH is missing', () => {
    const r = run(['GET'], auth);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('usage:');
  });

  it('exits 2 on unknown flag', () => {
    const r = run(['--nope', 'GET', '/posts'], auth);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('unknown flag');
  });
});
