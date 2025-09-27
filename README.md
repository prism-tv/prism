# Prism TV

![CI](https://github.com/prism-tv/prism/actions/workflows/ci.yml/badge.svg) ![Legacy 2017 TVs](https://github.com/prism-tv/prism/actions/workflows/legacy.yml/badge.svg)

Prism TV is a modern open television platform designed to explore ambient UI patterns for streaming hardware. This monorepo hosts the core TypeScript packages, example experiences, and RFCs that shape the project direction.

## Quickstart

```sh
pnpm install
pnpm build
pnpm run legacy:verify
```

Use `pnpm dev` when interactive previews are available. The workspace relies on Turborepo, so all package scripts run through the shared pipeline.

## Project Structure

- `packages/` – publishable libraries such as `@prism-tv/core`
- `examples/` – runnable demos (Solid-powered `hello-rail` today)
- `rfcs/` – project design documents and proposals

Each package ships TypeScript sources compiled with the shared `tsconfig.base.json`. Build artifacts live under `dist/`.

## RFCs

- [RFC 000 – Template](rfcs/000-template.md)
- [RFC 001 – Architecture](rfcs/001-architecture.md)

## Contributing

Please review the [Code of Conduct](CODE_OF_CONDUCT.md), [Contributing guide](CONTRIBUTING.md), and [Security policy](SECURITY.md) before opening an issue or pull request.

## License

Licensed under the [Apache 2.0 License](LICENSE).
