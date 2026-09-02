# EdgePress for Claude Code

Author, publish, and manage your EdgePress tenant content from any Claude Code session.

## Install

Add the marketplace, then install:

```
/plugin marketplace add likudn-ik/claude-code-edgepress
/plugin install edgepress@claude-code-edgepress
```

## Setup

Create a personal access token at `https://<your-tenant>/admin/settings/api-tokens`, then:

```
export EDGEPRESS_TENANT=your-tenant.edgepress.cc
export EDGEPRESS_TOKEN=epat_...
```

Add those two lines to `~/.zshrc` or `~/.bashrc` (or your password manager's shell loader). Then run `/edgepress:whoami` to verify.

## Usage

Natural language works:

> "list my drafts older than 30 days"
> "publish the post titled 'Hero of the Season'"
> "upload hero.jpg and set it as the featured image on my latest post"
> "draft a 3-part series on X, publish part 1, schedule the rest weekly"

Slash commands for one-shot actions:

- `/edgepress:setup` — walk through PAT creation + env setup
- `/edgepress:whoami` — verify auth
- `/edgepress:doctor` — health check
- `/edgepress:spec` — refresh the cached OpenAPI spec
- `/edgepress:workflow "<task>"` — dispatch a multi-step content workflow to the subagent

## API reference

Full endpoint reference: [api-docs.edgepress.cc](https://api-docs.edgepress.cc).

## License

MIT. See [LICENSE](LICENSE).
