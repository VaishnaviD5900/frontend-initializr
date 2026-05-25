# Frontend Initializr

> Scaffold your frontend project in seconds, pick your stack, download a zip, start coding.

Live at: **[frontend-initializr.vercel.app](https://frontend-initializr.vercel.app)**

---

## What is it?

Frontend Initializr is a browser-based project scaffolder inspired by [Spring Initializr](https://start.spring.io). Configure your stack visually and download a ready-to-run project zip — no CLI, no install required.

## What it generates

A fully wired project with your choices of:

| Option | Choices |
|---|---|
| **Build Tool** | Vite _(Webpack & Parcel coming soon)_ |
| **Framework** | React, Vue _(Angular coming soon)_ |
| **Styling** | Tailwind CSS, Material UI, Vuetify, Plain CSS |
| **Language** | TypeScript, JavaScript |
| **Routing** | React Router, TanStack Router, Vue Router |
| **State** | Zustand, Redux Toolkit, Pinia |
| **Package Manager** | npm, pnpm, yarn |
| **Linting** | ESLint + Prettier, ESLint only |
| **Testing** | Vitest, Jest, Cypress |

## Getting started (downloaded project)

```bash
# unzip, then:
npm install
npm run dev
```

---

## Development

```bash
git clone https://github.com/VaishnaviD5900/frontend-initializr.git
cd frontend-initializr
npm install
npm run dev
```

Built with **React + TypeScript + Vite + Tailwind CSS**.

## Project structure

```
src/
  components/       # FileTree, FileTreeModal, CopyButton
  generators/       # projectGenerator.ts — builds the zip
  utils/            # buildFileTree.ts — generates file tree from config
  types/            # ProjectConfig types
  App.tsx           # Main UI
  main.tsx
```

## Deployment

Deployed on Vercel. The `vercel.json` handles SPA routing and asset caching.

```bash
npm run build   # builds to dist/
```

---

## Roadmap

- [ ] Angular support
- [ ] Webpack & Parcel config generation
- [ ] Share config via URL
- [ ] More styling options (Chakra UI, shadcn/ui)
- [ ] Auth boilerplate option

## License

MIT
