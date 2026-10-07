This is Kućni budžet, an Expo/React Native household budget app. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Product

Routes live in `src/app/(tabs)/`: `index` (Početna, `/`), `transactions` (Unosi, `/transactions`), and `budget` (Plan, `/budget`). `src/app/add.tsx` is the entry form at `/add` and is not a tab. `src/app/_layout.tsx` is a stack. The tab router is `src/components/app-tabs.tsx` (web variant: `app-tabs.web.tsx`). Shared screen chrome is `src/components/screen.tsx`.

Domain math, dates, and money parsing live in `src/domain/` and stay free of React Native imports so `npm test` can run them with `tsx`. Početna shows `monthSummary` for the selected month. Unosi lists the current month and opens `/add`. Plan is still a shell.

The database is SQLite. `src/domain/schema.ts` is the schema and `src/domain/budget-db.ts` is the store API. Tests run that SQL against `node:sqlite` in memory. On a phone, `src/domain/expo-database.ts` opens `kucni-budzet.db` with `expo-sqlite`. In the browser, `src/domain/expo-database.web.ts` runs the same SQL with `sql.js` and stores the file in `localStorage`. Do not persist the budget as a JSON blob.

Currency is RSD. Amounts are stored as integer para (1 dinar = 100 para). Parsing accepts `1500,50` and `1,500.50`. A separator followed by exactly three digits is a thousands separator (`1.500` = 1500).

This version has no account and no server.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
