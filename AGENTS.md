# Agent Instructions

## Package Manager
- Use **bun** for local workflows: `bun install`, `bun dev`, `bun run build`, `bun run lint`
- Node version target: `^20.19.0 || >=22.12.0`

## File-Scoped Commands
| Task | Command |
|------|---------|
| Lint single file | `bunx eslint path/to/file.ts --fix --cache` |
| Format single file | `bunx prettier --write path/to/file.ts` |
| Build check | `bun run build` |
| Type check | `bun run type-check` |

## Commit Attribution
- AI commits MUST include:
```txt
Co-Authored-By: Codex 5.3 <noreply@openai.com>
```

## Key Conventions
- Stack: Vue 3 + TypeScript + Vite + Pinia + Vue Router + qiankun
- Import alias: use `@` for `src` (configured in `vite.config.ts`)
- Keep micro-frontend global state initialization in `src/main.ts` before app mount
- Keep qiankun global-state contract changes centralized in `src/microApp.ts`
- Manage sub-app registry in `src/config/subapps.ts`; preserve `SubApp` shape and `props.bus`
- Put shared event bus usage through `src/utils/bus.ts` and avoid ad-hoc globals

## Project Structure
- App bootstrap: `src/main.ts`
- Router: `src/router`
- Global state / stores: `src/stores`
- Micro-frontend integration: `src/microApp.ts`, `src/config/subapps.ts`
