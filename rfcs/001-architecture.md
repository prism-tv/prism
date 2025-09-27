# RFC-001: Architecture (Prism/TVFX Hybrid Smart-TV Framework)

**Status:** Draft  
**Author(s):** Navaneeth M.  
**Reviewers:** (TBD)  
**Created:** 2025-09-27  
**Target Version:** v0.1.0-alpha

## Summary

Define the architecture for a hybrid Smart-TV framework (working name: Prism; alt: TVFX) that combines LightningJS (GPU/WebGL Stage) with SolidJS (fine-grained DOM UI) under a single focus engine, input abstraction, and event bus, delivering a 2017-compatible developer experience with first-class video, ads, analytics, and Liquid-Glass theming.

## Motivation

Smart-TV apps need 60fps motion on constrained hardware while still offering ergonomic UI for forms, search, dialogs. Lightning excels at animated scenes; Solid excels at DOM ergonomics with minimal runtime. A single framework that cleanly separates ownership (Stage vs Chrome) and ships batteries-included (video, ads, analytics, focus, input, devtools, legacy build) dramatically reduces time-to-market and flakiness.

### Goals
- Two-host runtime (Lightning Stage + Solid UI) with clear ownership boundaries
- Unified Focus Engine (LRUD) across both renderers; deterministic navigation
- Input adapters for Tizen/webOS/Vidaa/Vizio/Xbox/desktop
- Video Layer Manager with DRM-ready player adapter API (HLS default, Shaka/Bitmovin optional)
- Event Bus contracts for cross-realm communication
- Liquid-Glass Theme (TV-safe) and devtools overlay (FPS, textures, DOM, focus)
- 2017-Mode: ES5 output, polyfills, perf budgets, CI gates
- DX: CLI scaffold, examples, docs, and Guardrails (doctor)

### Non-Goals (v1)
- Native player integration beyond HTML5 video layer
- React/Vue hosts
- Non-web runtimes

### Glossary
- **Stage:** LightningJS-powered canvas/WebGL scene (posters, rails, focus ring, effects)
- **Chrome:** SolidJS-driven DOM UI (menus, dialogs, forms, search, metadata panels)
- **Host:** A runtime container for Stage or Chrome
- **Bus:** Typed EventTarget used for cross-realm events
- **LRUD:** Left/Right/Up/Down focus graph for TV remotes
- **2017-Mode:** Build + runtime profile targeting Chrome 38/47-era engines

### Prior Art & Rationale
- **LightningJS/Blits:** TV-focused renderer & framework (Lightning-only). Great Stage, limited hybrid story
- **lightning-tv/solid:** Proves Solid ↔ Lightning bindings. Lacks full app framework (input/video/ads/analytics)
- **Enact (LG):** React-based TV framework; DOM-only trade-offs

**Conclusion:** A hybrid fills a gap—pairing Stage performance with DOM ergonomics.

## Detailed Design

### Architecture Overview

```
+--------------------------------------------------------------+
|                         App (Prism)                          |
|  Config  |  Feature Flags  |  DI  |  Router (opt)           |
+----------------------+-------------------+-------------------+
                       |                   |
                 +-----v-----+       +-----v-----+
                 |   Stage   |       |   Chrome  |
                 | Lightning |       |  SolidJS  |
                 +-----+-----+       +-----+-----+
                       \                 /
                        \               /
                         +-----v-------+
                         |   Focus     |   (LRUD Graph)
                         +-----+-------+
                               |
                    +----------v-----------+
                    |     Input Adapters   | (Tizen/webOS/...)
                    +----------+-----------+
                               |
                        +------v------+
                        |    Bus      | (Events: intents & state)
                        +------+------+ 
                               |
                   +-----------v-----------+
                   |   Video Layer Manager |
                   |   Player Adapters     |
                   +-----------------------+
```

#### Ownership
- **Stage:** visual scene, animations, effects, focus ring rendering
- **Chrome:** controls, forms, search, dialogs, metadata
- **Focus:** single authority for which element is focused across both realms
- **Bus:** explicit intents/events (e.g., search:update, rail:patch, video:play)

### Packages (initial)
- `@prism/core` — app lifecycle, config, DI, bus, feature flags
- `@prism/stage-lightning` — Stage Host, rails, focus ring, texture recycler, effect hooks
- `@prism/ui-solid` — Chrome Host, theming, headless widgets
- `@prism/focus` — LRUD engine, registration contracts, snapshot tests
- `@prism/input-*` — tizen|webos|vidaa|vizio|xbox|desktop adapters
- `@prism/video` — `<video>` manager: pinning, opacity, z-order, events
- `@prism/player-hlsjs` — default adapter (HLS)
- `@prism/player-*` — shaka, bitmovin (optional)
- `@prism/ads` — CSAI/SSAI interfaces, IMA adapter in v0.2+
- `@prism/analytics` — event schema + adapters (Mux in v0.2+)
- `@prism/theme` — Liquid-Glass tokens, pre-blur assets, shader blur opt-in
- `@prism/devtools` — overlay (FPS/texture/DOM/focus), tv doctor
- `@prism/cli` — create-prism, prism dev|build|build:legacy|profile|doctor

### Event Bus Contracts (initial)

Events are namespaced and typed. All cross-realm interactions flow through the bus to ensure traceability and replay.

- `search:update` → `{ q: string }`
- `rail:patch` → `{ id: string, items: Item[] }`
- `focus:set` → `{ id: string }`
- `focus:change` → `{ id: string }` (emitted by Focus)
- `video:load` → `{ url: string, drm?: DrmConfig }`
- `video:play` / `video:pause` / `video:seek` → payloads as needed
- `analytics:event` → `{ type: string, data: Record<string,any> }`
- `ads:cues` → `{ markers: Array<{ t: number, type: 'preroll'|'midroll'|'postroll' }> }`

**Implementation Note:** `@prism/core` exposes emit, on, off wrappers over EventTarget with TS generics.

### Focus & Input

#### Focus Graph
- **Nodes:** `{ id, rect, role, next?: { l?, r?, u?, d? } }`
- **Deterministic navigation:** if explicit next not set, best-candidate by geometric lookup
- **Snapshot tests** store sequences (e.g., home:right,right,down) to prevent regressions

#### Registration Contracts
- **Stage** registers posters/cards when laid out
- **Chrome** registers buttons/inputs/dialog items on mount
- Both unregister on unmount; Focus emits `focus:change` to update visuals

#### Input Adapters
- Map platform keycodes → `Focus.move(dir)`/Activate/Back intents
- **Adapters:** tizen, webos, vidaa, vizio, xbox, desktop

### Video Layer & Player Adapters

#### Layering
- **Default Z-order:** video (z:0) < stage canvas (z:1) < chrome DOM (z:2)
- Provide a sanctioned stacking recipe per platform; doctor verifies

#### APIs

```typescript
interface PlayerAdapter {
  create(el: HTMLVideoElement, cfg: PlayerConfig): Promise<void>;
  load(url: string, drm?: DrmConfig): Promise<void>;
  play(): void; 
  pause(): void; 
  seek(t: number): void; 
  destroy(): void;
  on(ev: 'timeupdate'|'error'|'ended'|'manifestLoaded', cb: Function): void;
}
```

- **Default:** `@prism/player-hlsjs`
- **Optional:** Shaka/Bitmovin adapters

### Theming (Liquid-Glass)
- **Tokenized theme:** colors, radii, elevation, translucency
- **No backdrop-filter assumptions;** TV-safe approach:
  - Pre-blurred assets (PNG/WebP) as backplates
  - Optional Lightning shader blur (single layer, separable, capped cost)
  - Gradients + noise + inner shadow in DOM overlays

### Performance, Budgets & Legacy Profile
- **Build targets:** Browserslist Chrome 38, Chrome 47 for legacy bundle
- **Polyfills:** Promise, fetch, URL, Object.assign, Array.*, String.*, IntersectionObserver (if used), regenerator-runtime
- **Budgets:**
  - DOM nodes ≤ ~1200 per view
  - Texture atlas ≤ 2048²; cumulative texture memory ≤ ~80MB
  - Bundle per chunk ≤ 800KB gz (legacy)
  - Main-thread idle ≥ 30% (demo scene)
- **CI gates** enforce thresholds; profile command outputs JSON traces

### Devtools & Diagnostics
- **Overlay** toggled by F2
- FPS, draw calls, texture atlas viz
- DOM nodes, layout cost hints
- Focus graph (current, neighbors, history)
- **doctor CLI** detects anti-patterns: backdrop-filter, missing polyfills, oversize textures, font issues

### Security & Privacy
- No PII in analytics by default; adapters scrub data
- CSP guidance; sandboxed iframes disallowed by default
- Supply-chain scanning in CI; lockfile maintenance

### Accessibility & i18n
- Focus visibility requirements; minimum contrast in theme tokens
- Screen-reader support where available (limited on TVs, but DOM chrome should expose labels)
- RTL and number/date formatting hooks in UI

### Testing Strategy (Summary)
- **Unit (Vitest):** focus engine, bus, adapters with mocks
- **Integration (Playwright):** hybrid flows (search → filter → focus → play)
- **E2E Legacy:** Chrome-47-like container
- **Perf:** scripted scene runner → assert thresholds
- **Visual:** Pixelmatch frames for Stage + Chrome overlays

### Migration & Extensibility
- Plugin contracts for players/ads/analytics/auth
- Theming tokens versioned with migration scripts
- Adapters repo for third-party contributions

## Alternatives Considered

- **Lightning-only:** simpler build; loses DOM ergonomics
- **React-only:** rich ecosystem; harder 60fps on legacy TVs
- **Single-renderer abstraction:** elegant on paper; hides essential trade-offs

## Drawbacks

- Increased complexity from dual-renderer architecture
- Potential performance overhead from cross-realm communication
- Learning curve for developers unfamiliar with either LightningJS or SolidJS
- Additional build complexity for legacy browser support

## Migration Path

- Plugin contracts for players/ads/analytics/auth
- Theming tokens versioned with migration scripts
- Adapters repo for third-party contributions

## Open Questions

1. **Name:** Prism vs TVFX vs other (finalize before public beta)
2. **Router scope in v0.1:** include minimal hash router or push to v0.2?
3. **Shader blur default:** off by default, on for modern devices only?
4. **Minimum device QA set:** which exact 2017 Samsung/LG SKUs as golden?

## Appendix A — Sequence Diagrams

### Search filtering a rail

```
Solid(Search) -> Bus: search:update { q }
Bus -> Stage: rail:patch/filter('continue',{ q })
Stage -> Focus: reconcile focus if current card filtered out
Focus -> Stage: focus:change { id }
Stage: redraw()
```

### Play video

```
UI(PlayButton) -> Bus: video:load { url, drm }
Bus -> VideoMgr: load(url, drm)
VideoMgr -> PlayerAdapter(HLS): create+load
VideoMgr -> Stage: setOpacity(0.95) (dim background)
UI -> Bus: video:play
Bus -> VideoMgr: play()
```

## Appendix B — Public API Sketch

```typescript
// Core
App.bootstrap({ element, platform, theme, stage, ui, focus, video });

// Stage
Stage.registerRail(id, { items, layout });
Stage.focusCard(id);
Stage.filter(id, q);

// UI
UI.mount(<TopBar />);
UI.useTheme(theme);

// Focus
Focus.register(node); 
Focus.set(id); 
Focus.move('l'|'r'|'u'|'d');
Focus.onChange(cb);

// Video
Video.attach('#video');
Video.load(url, drm); 
Video.play(); 
Video.pause(); 
Video.seek(t);

// Bus
emit('topic', payload); 
on('topic', cb); 
off('topic', cb);
```

## Appendix C — 2017-Mode Checklist

- [ ] ES5 build
- [ ] Polyfills present
- [ ] No CSS Grid/backdrop-filter
- [ ] Texture caps respected
- [ ] Focus snapshot tests
- [ ] Legacy E2E green
- [ ] doctor passes
