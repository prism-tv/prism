# Contributing to Prism

Thank you for your interest in contributing 🎉

## Ways to Contribute
- Report bugs via GitHub Issues
- Suggest features via Issues or RFCs
- Submit pull requests to fix bugs, improve docs, or add features

## Development Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/prism-tv/prism.git
   cd prism
   pnpm install
   ```
2. Run in dev mode:
   ```bash
   pnpm dev
   ```
3. Build all packages:
   ```bash
   pnpm build
   ```

## RFC Process
- Significant changes require an RFC in `/rfcs`.
- RFC template: summary, motivation, design, alternatives, drawbacks.

## Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/).
Examples:
- `feat: add focus manager`
- `fix: handle texture disposal`

## Code Style
- TypeScript strict mode
- Prettier + ESLint for formatting
- Keep bundles ES5-compatible (2017 TVs)

## Pull Request Checklist
- [ ] Tests added or updated
- [ ] Docs updated
- [ ] Legacy build verified
- [ ] Changeset entry added
