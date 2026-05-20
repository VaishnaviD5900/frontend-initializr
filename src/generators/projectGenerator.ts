import JSZip from 'jszip'
import type { ProjectConfig } from '../types'

// ── helpers ──────────────────────────────────────────────────────────────────

const ext = (ts: boolean) => (ts ? 'ts' : 'js')
const extx = (ts: boolean) => (ts ? 'tsx' : 'jsx')

// ── package.json ─────────────────────────────────────────────────────────────

function buildPackageJson(cfg: ProjectConfig): string {
  const { projectName, framework, styling, typescript, routing, stateManagement } = cfg

  const deps: Record<string, string> = {}
  const devDeps: Record<string, string> = {}

  // Framework
  if (framework === 'react') {
    deps['react'] = '^18.3.1'
    deps['react-dom'] = '^18.3.1'
    devDeps['@vitejs/plugin-react'] = '^4.3.1'
    devDeps['vite'] = '^5.3.1'
    if (typescript) {
      devDeps['@types/react'] = '^18.3.1'
      devDeps['@types/react-dom'] = '^18.3.1'
    }
  } else if (framework === 'vue') {
    deps['vue'] = '^3.4.29'
    devDeps['@vitejs/plugin-vue'] = '^5.0.5'
    devDeps['vite'] = '^5.3.1'
    if (typescript) devDeps['vue-tsc'] = '^2.0.21'
  }

  // Styling
  if (styling === 'tailwind') {
    devDeps['tailwindcss'] = '^3.4.4'
    devDeps['autoprefixer'] = '^10.4.19'
    devDeps['postcss'] = '^8.4.38'
  } else if (styling === 'mui') {
    deps['@mui/material'] = '^5.16.0'
    deps['@emotion/react'] = '^11.11.4'
    deps['@emotion/styled'] = '^11.11.5'
  } else if (styling === 'vuetify') {
    deps['vuetify'] = '^3.6.11'
    deps['@mdi/font'] = '^7.4.47'
  }

  // Routing
  if (routing === 'react-router') deps['react-router-dom'] = '^6.24.0'
  if (routing === 'tanstack-router') deps['@tanstack/react-router'] = '^1.40.0'
  if (routing === 'vue-router') deps['vue-router'] = '^4.3.3'

  // State
  if (stateManagement === 'zustand') deps['zustand'] = '^4.5.4'
  if (stateManagement === 'redux') {
    deps['@reduxjs/toolkit'] = '^2.2.6'
    deps['react-redux'] = '^9.1.2'
  }
  if (stateManagement === 'pinia') deps['pinia'] = '^2.1.7'

  // TypeScript
  if (typescript) {
    devDeps['typescript'] = '^5.4.5'
  }

  const scripts: Record<string, string> =
    framework === 'angular'
      ? { dev: 'ng serve', build: 'ng build', test: 'ng test' }
      : {
          dev: 'vite',
          build: typescript && framework !== 'vue' ? 'tsc && vite build' : framework === 'vue' && typescript ? 'vue-tsc && vite build' : 'vite build',
          preview: 'vite preview',
        }

  return JSON.stringify(
    {
      name: projectName,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts,
      dependencies: deps,
      devDependencies: devDeps,
    },
    null,
    2
  )
}

// ── vite config ──────────────────────────────────────────────────────────────

function buildViteConfig(cfg: ProjectConfig): string {
  const { framework } = cfg

  if (framework === 'react') {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})\n`
  }
  if (framework === 'vue') {
    return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})\n`
  }
  return `// Angular uses angular.json — no vite config needed\n`
}

// ── tsconfig ─────────────────────────────────────────────────────────────────

function buildTsConfig(cfg: ProjectConfig): string {
  const base = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: cfg.framework === 'react' ? 'react-jsx' : undefined,
      strict: true,
    },
    include: ['src'],
  }
  return JSON.stringify(base, null, 2)
}

// ── tailwind config ───────────────────────────────────────────────────────────

function buildTailwindConfig(cfg: ProjectConfig): string {
  const ext = cfg.framework === 'vue' ? 'vue' : cfg.framework === 'react' ? '{js,ts,jsx,tsx}' : 'ts'
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.${ext}'],
  theme: {
    extend: {},
  },
  plugins: [],
}\n`
}

// ── App component ─────────────────────────────────────────────────────────────

function buildReactApp(cfg: ProjectConfig): string {
  const { routing } = cfg

  if (routing === 'react-router') {
    return `import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App\n`
  }

  if (routing === 'tanstack-router') {
    return `import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App\n`
  }

  return `function App() {
  return (
    <div>
      <h1>Hello from your new app!</h1>
    </div>
  )
}

export default App\n`
}

function buildVueApp(cfg: ProjectConfig): string {
  if (cfg.routing === 'vue-router') {
    return `<template>
  <RouterView />
</template>

<script setup${cfg.typescript ? ' lang="ts"' : ''}>
import { RouterView } from 'vue-router'
</script>\n`
  }
  return `<template>
  <div>
    <h1>Hello from your new app!</h1>
  </div>
</template>

<script setup${cfg.typescript ? ' lang="ts"' : ''}>
</script>\n`
}

// ── Home page ─────────────────────────────────────────────────────────────────

function buildReactHomePage(cfg: ProjectConfig): string {
  return `function Home() {
  return (
    <main>
      <h1>Welcome to ${cfg.projectName}</h1>
    </main>
  )
}

export default Home\n`
}

function buildVueHomePage(cfg: ProjectConfig): string {
  return `<template>
  <main>
    <h1>Welcome to ${cfg.projectName}</h1>
  </main>
</template>

<script setup${cfg.typescript ? ' lang="ts"' : ''}>
</script>\n`
}

// ── store ─────────────────────────────────────────────────────────────────────

function buildZustandStore(typescript: boolean): string {
  if (typescript) {
    return `import { create } from 'zustand'

interface AppState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))\n`
  }
  return `import { create } from 'zustand'

export const useAppStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))\n`
}

function buildReduxStore(typescript: boolean): string {
  return `import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})
${typescript ? `
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch` : ''}\n`
}

function buildReduxSlice(_typescript: boolean): string {
  return `import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    decrement: (state) => { state.value -= 1 },
  },
})

export const { increment, decrement } = counterSlice.actions
export default counterSlice.reducer\n`
}

function buildPiniaStore(_typescript: boolean): string {
  return `import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() { this.count++ },
    decrement() { this.count-- },
  },
})\n`
}

// ── main entry ───────────────────────────────────────────────────────────────

function buildReactMain(cfg: ProjectConfig): string {
  const { styling, stateManagement } = cfg
  const lines: string[] = ["import React from 'react'", "import ReactDOM from 'react-dom/client'", "import App from './App'"]

  if (styling === 'tailwind') lines.push("import './index.css'")
  if (stateManagement === 'redux') {
    lines.push("import { Provider } from 'react-redux'")
    lines.push("import { store } from './store/store'")
  }

  lines.push('')
  if (stateManagement === 'redux') {
    lines.push(`ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)`)
  } else {
    lines.push(`ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`)
  }

  return lines.join('\n') + '\n'
}

function buildVueMain(cfg: ProjectConfig): string {
  const { styling, stateManagement, routing } = cfg
  const lines: string[] = ["import { createApp } from 'vue'", "import App from './App.vue'"]

  if (routing === 'vue-router') lines.push("import router from './router'")
  if (stateManagement === 'pinia') lines.push("import { createPinia } from 'pinia'")
  if (styling === 'tailwind') lines.push("import './index.css'")
  if (styling === 'vuetify') {
    lines.push("import 'vuetify/styles'")
    lines.push("import { createVuetify } from 'vuetify'")
    lines.push("import * as components from 'vuetify/components'")
    lines.push("import * as directives from 'vuetify/directives'")
  }

  lines.push('')
  lines.push('const app = createApp(App)')
  if (styling === 'vuetify') {
    lines.push('const vuetify = createVuetify({ components, directives })')
    lines.push('app.use(vuetify)')
  }
  if (routing === 'vue-router') lines.push('app.use(router)')
  if (stateManagement === 'pinia') lines.push('app.use(createPinia())')
  lines.push("app.mount('#app')")

  return lines.join('\n') + '\n'
}

// ── vue router ───────────────────────────────────────────────────────────────

function buildVueRouter(_cfg: ProjectConfig): string {
  return `import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
  ],
})

export default router\n`
}

// ── index.html ───────────────────────────────────────────────────────────────

function buildIndexHtml(cfg: ProjectConfig): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${cfg.projectName}</title>
  </head>
  <body>
    <div id="${cfg.framework === 'vue' ? 'app' : 'root'}"></div>
    <script type="module" src="/src/main.${cfg.typescript ? (cfg.framework === 'vue' ? 'ts' : 'tsx') : cfg.framework === 'vue' ? 'js' : 'jsx'}"></script>
  </body>
</html>\n`
}

// ── README ───────────────────────────────────────────────────────────────────

function buildReadme(cfg: ProjectConfig): string {
  const { projectName, framework, styling, typescript, routing, stateManagement } = cfg
  return `# ${projectName}

> Generated by [Frontend Initializr](https://frontend-initializr.dev)

## Stack

| | |
|---|---|
| **Framework** | ${framework} |
| **Styling** | ${styling} |
| **Language** | ${typescript ? 'TypeScript' : 'JavaScript'} |
| **Routing** | ${routing} |
| **State** | ${stateManagement} |

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
  components/   # Reusable UI components
  pages/        # Page-level components
  ${stateManagement !== 'none' ? 'store/         # State management\n  ' : ''}${routing !== 'none' && framework !== 'react' ? 'router/        # Route definitions\n  ' : ''}App.${typescript ? (framework === 'vue' ? 'vue' : 'tsx') : framework === 'vue' ? 'vue' : 'jsx'}
  main.${typescript ? (framework === 'vue' ? 'ts' : 'tsx') : framework === 'vue' ? 'js' : 'jsx'}
\`\`\`
`
}

// ── .gitignore ────────────────────────────────────────────────────────────────

const GITIGNORE = `node_modules
dist
.env
.env.local
.DS_Store
*.local\n`

// ── CSS ───────────────────────────────────────────────────────────────────────

const TAILWIND_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;\n`

const PLAIN_CSS = `*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}\n`

// ── main generator ────────────────────────────────────────────────────────────

export async function generateProject(cfg: ProjectConfig): Promise<Blob> {
  const zip = new JSZip()
  const root = zip.folder(cfg.projectName)!
  const src = root.folder('src')!
  const ts = cfg.typescript
  const fw = cfg.framework
  const e = ext(ts)
  const ex = extx(ts)

  // Root files
  root.file('package.json', buildPackageJson(cfg))
  root.file('.gitignore', GITIGNORE)
  root.file('README.md', buildReadme(cfg))
  root.file('index.html', buildIndexHtml(cfg))

  if (fw !== 'angular') {
    root.file(`vite.config.${e}`, buildViteConfig(cfg))
    if (ts) root.file('tsconfig.json', buildTsConfig(cfg))
    if (cfg.styling === 'tailwind') {
      root.file('tailwind.config.js', buildTailwindConfig(cfg))
      root.file('postcss.config.js', `export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n`)
    }
  }

  // src files
  if (fw === 'react') {
    src.file(`main.${ex}`, buildReactMain(cfg))
    src.file(`App.${ex}`, buildReactApp(cfg))
    src.file('index.css', cfg.styling === 'tailwind' ? TAILWIND_CSS : PLAIN_CSS)

    const pages = src.folder('pages')!
    pages.file(`Home.${ex}`, buildReactHomePage(cfg))

    src.folder('components')

    // Store
    if (cfg.stateManagement === 'zustand') {
      const store = src.folder('store')!
      store.file(`useAppStore.${e}`, buildZustandStore(ts))
    } else if (cfg.stateManagement === 'redux') {
      const store = src.folder('store')!
      store.file(`store.${e}`, buildReduxStore(ts))
      store.file(`counterSlice.${e}`, buildReduxSlice(ts))
    }
  }

  if (fw === 'vue') {
    src.file(`main.${ts ? 'ts' : 'js'}`, buildVueMain(cfg))
    src.file('App.vue', buildVueApp(cfg))
    src.file('index.css', cfg.styling === 'tailwind' ? TAILWIND_CSS : PLAIN_CSS)

    const pages = src.folder('pages')!
    pages.file('Home.vue', buildVueHomePage(cfg))
    src.folder('components')

    if (cfg.routing === 'vue-router') {
      const router = src.folder('router')!
      router.file(`index.${ts ? 'ts' : 'js'}`, buildVueRouter(cfg))
    }

    if (cfg.stateManagement === 'pinia') {
      const store = src.folder('store')!
      store.file(`useAppStore.${ts ? 'ts' : 'js'}`, buildPiniaStore(ts))
    }
  }

  if (fw === 'angular') {
    // Angular uses its own CLI — provide a note
    root.file('ANGULAR_NOTE.md', `# Angular Project\n\nRun the following to create your Angular project with the selected options:\n\n\`\`\`bash\nnpx @angular/cli new ${cfg.projectName} ${ts ? '' : '--no-strict '}--routing=${cfg.routing !== 'none'} --style=${cfg.styling === 'angular-material' ? 'scss' : 'css'}\n\`\`\`\n\nThen install Angular Material if selected:\n\`\`\`bash\nng add @angular/material\n\`\`\`\n`)
  }

  return zip.generateAsync({ type: 'blob' })
}
