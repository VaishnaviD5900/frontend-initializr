import JSZip from 'jszip'
import type { ProjectConfig } from '../types'

// ── helpers ──────────────────────────────────────────────────────────────────

const ext = (ts: boolean) => (ts ? 'ts' : 'js')
const extx = (ts: boolean) => (ts ? 'tsx' : 'jsx')

// ── package.json ─────────────────────────────────────────────────────────────

function buildPackageJson(cfg: ProjectConfig): string {
  const { projectName, buildTool, framework, styling, typescript, routing, stateManagement, linting, testing, validation, httpClient, formLibrary } = cfg

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

  // Linting
  if (linting === 'eslint' || linting === 'eslint+prettier') {
    devDeps['eslint'] = '^8.57.0'
    if (typescript) devDeps['@typescript-eslint/eslint-plugin'] = '^7.0.0'
    if (typescript) devDeps['@typescript-eslint/parser'] = '^7.0.0'
    if (framework === 'react') devDeps['eslint-plugin-react'] = '^7.34.0'
    if (framework === 'react') devDeps['eslint-plugin-react-hooks'] = '^4.6.2'
    if (framework === 'vue') devDeps['eslint-plugin-vue'] = '^9.26.0'
  }
  if (linting === 'eslint+prettier') {
    devDeps['prettier'] = '^3.3.2'
    devDeps['eslint-config-prettier'] = '^9.1.0'
    devDeps['eslint-plugin-prettier'] = '^5.1.3'
  }

  // Testing
  if (testing === 'vitest') {
    devDeps['vitest'] = '^1.6.0'
    devDeps['@vitest/ui'] = '^1.6.0'
    devDeps['jsdom'] = '^24.1.0'
    if (framework === 'react') devDeps['@testing-library/react'] = '^16.0.0'
    if (framework === 'vue') devDeps['@testing-library/vue'] = '^8.1.0'
  }
  if (testing === 'jest') {
    devDeps['jest'] = '^29.7.0'
    devDeps['jest-environment-jsdom'] = '^29.7.0'
    if (typescript) devDeps['ts-jest'] = '^29.1.5'
    if (typescript) devDeps['@types/jest'] = '^29.5.12'
    if (framework === 'react') devDeps['@testing-library/react'] = '^16.0.0'
    if (framework === 'react') devDeps['@testing-library/jest-dom'] = '^6.4.6'
  }
  if (testing === 'cypress') {
    devDeps['cypress'] = '^13.13.0'
  }

  // Validation
  if (validation === 'zod')      deps['zod']      = '^3.23.8'
  if (validation === 'yup')      deps['yup']      = '^1.4.0'
  if (validation === 'valibot')  deps['valibot']  = '^0.31.0'

  // HTTP Client
  if (httpClient === 'axios')          deps['axios']                  = '^1.7.2'
  if (httpClient === 'ky')             deps['ky']                     = '^1.3.0'
  if (httpClient === 'tanstack-query') {
    deps['@tanstack/react-query']      = '^5.51.1'
    devDeps['@tanstack/react-query-devtools'] = '^5.51.1'
  }
  if (httpClient === 'swr')            deps['swr']                    = '^2.2.5'

  // Form Library
  if (formLibrary === 'react-hook-form') {
    deps['react-hook-form'] = '^7.52.1'
    if (validation === 'zod') deps['@hookform/resolvers'] = '^3.9.0'
  }
  if (formLibrary === 'formik') {
    deps['formik'] = '^2.4.6'
    if (validation === 'yup') deps['yup'] = '^1.4.0'
  }
  if (formLibrary === 'vee-validate') {
    deps['vee-validate'] = '^4.13.2'
    if (validation === 'yup') deps['@vee-validate/yup'] = '^4.13.2'
    if (validation === 'zod') deps['@vee-validate/zod'] = '^4.13.2'
  }

  const scripts: Record<string, string> =
    framework === 'angular'
      ? { dev: 'ng serve', build: 'ng build', test: 'ng test' }
      : buildTool === 'webpack'
      ? {
          dev: 'webpack serve',
          build: 'webpack --mode production',
        }
      : buildTool === 'parcel'
      ? {
          dev: 'parcel src/index.html',
          build: 'parcel build src/index.html',
        }
      : {
          dev: 'vite',
          build: typescript && framework !== 'vue' ? 'tsc && vite build' : framework === 'vue' && typescript ? 'vue-tsc && vite build' : 'vite build',
          preview: 'vite preview',
          ...(linting !== 'none' ? { lint: 'eslint src --ext .ts,.tsx,.js,.jsx,.vue' } : {}),
          ...(testing === 'vitest' ? { test: 'vitest', 'test:ui': 'vitest --ui' } : {}),
          ...(testing === 'jest' ? { test: 'jest' } : {}),
          ...(testing === 'cypress' ? { 'test:e2e': 'cypress open' } : {}),
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
  const { projectName, buildTool, framework, styling, typescript, routing, stateManagement, packageManager } = cfg
  return `# ${projectName}

> Generated by [Frontend Initializr](https://frontend-initializr.dev)

## Stack

| | |
|---|---|
| **Build Tool** | ${buildTool} |
| **Framework** | ${framework} |
| **Styling** | ${styling} |
| **Language** | ${typescript ? 'TypeScript' : 'JavaScript'} |
| **Routing** | ${routing} |
| **State** | ${stateManagement} |
| **Package Manager** | ${packageManager} |

## Getting Started

\`\`\`bash
${packageManager} install
${packageManager} run dev
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

  // Validation schema example
  if (cfg.validation !== 'none') {
    const schemas = src.folder('schemas')!
    const ts = cfg.typescript
    if (cfg.validation === 'zod')     schemas.file(`userSchema.${ts ? 'ts' : 'js'}`, buildZodSchema(ts))
    if (cfg.validation === 'yup')     schemas.file(`userSchema.${ts ? 'ts' : 'js'}`, buildYupSchema())
    if (cfg.validation === 'valibot') schemas.file(`userSchema.${ts ? 'ts' : 'js'}`, buildValibotSchema(ts))
  }

  // HTTP Client
  if (cfg.httpClient !== 'none') {
    const api = src.folder('api')!
    const ts = cfg.typescript
    const ext = ts ? 'ts' : 'js'
    if (cfg.httpClient === 'axios')          api.file(`client.${ext}`, buildAxiosClient(ts))
    if (cfg.httpClient === 'ky')             api.file(`client.${ext}`, buildKyClient(ts))
    if (cfg.httpClient === 'tanstack-query') api.file(`queryClient.${ext}`, buildTanstackQuerySetup(ts))
    if (cfg.httpClient === 'swr')            api.file(`fetcher.${ext}`, buildSwrSetup(ts))
  }

  // Form Library
  if (cfg.formLibrary !== 'none') {
    const forms = src.folder('components')!
    const ts = cfg.typescript
    const ext = ts ? (cfg.framework === 'vue' ? 'vue' : 'tsx') : (cfg.framework === 'vue' ? 'vue' : 'jsx')
    if (cfg.formLibrary === 'react-hook-form') forms.file(`ExampleForm.${ext}`, buildReactHookForm(ts, cfg.validation))
    if (cfg.formLibrary === 'formik')          forms.file(`ExampleForm.${ext}`, buildFormik(ts, cfg.validation))
    if (cfg.formLibrary === 'vee-validate')    forms.file('ExampleForm.vue', buildVeeValidate(ts, cfg.validation))
  }

  // Linting
  if (cfg.linting === 'eslint' || cfg.linting === 'eslint+prettier') {
    root.file('.eslintrc.cjs', buildEslintConfig(cfg))
    root.file('.eslintignore', 'dist\nnode_modules\n')
  }
  if (cfg.linting === 'eslint+prettier') {
    root.file('.prettierrc', PRETTIER_CONFIG)
    root.file('.prettierignore', PRETTIER_IGNORE)
  }

  // Testing
  if (cfg.testing === 'vitest') {
    root.file(`vitest.config.${e}`, buildVitestConfig(cfg))
    const tests = src.folder('__tests__')!
    tests.file(`example.test.${e}`, buildVitestExample(cfg))
  }
  if (cfg.testing === 'jest') {
    root.file('jest.config.cjs', buildJestConfig(cfg))
    const tests = src.folder('__tests__')!
    tests.file(`example.test.${e}`, buildJestExample(cfg))
  }
  if (cfg.testing === 'cypress') {
    root.file(`cypress.config.${e}`, buildCypressConfig(cfg))
    const cypress = root.folder('cypress')!
    const e2e = cypress.folder('e2e')!
    e2e.file('home.cy.ts', buildCypressExample())
  }

  return zip.generateAsync({ type: 'blob' })
}

// ── eslint config ─────────────────────────────────────────────────────────────

function buildEslintConfig(cfg: ProjectConfig): string {
  const { framework, typescript } = cfg
  const plugins: string[] = []
  const extendsArr: string[] = ['eslint:recommended']

  if (typescript) extendsArr.push('plugin:@typescript-eslint/recommended')
  if (framework === 'react') {
    plugins.push("'react'", "'react-hooks'")
    extendsArr.push('plugin:react/recommended', 'plugin:react-hooks/recommended')
  }
  if (framework === 'vue') extendsArr.push('plugin:vue/vue3-recommended')

  return `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [${extendsArr.map(e => `'${e}'`).join(', ')}],
  ${plugins.length ? `plugins: [${plugins.join(', ')}],` : ''}
  ${typescript ? `parser: '${framework === 'vue' ? 'vue-eslint-parser' : '@typescript-eslint/parser'}',` : ''}
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
  },
}\n`
}

// ── prettier config ───────────────────────────────────────────────────────────

const PRETTIER_CONFIG = `{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}\n`

const PRETTIER_IGNORE = `dist
node_modules
*.min.js\n`

// ── vitest config ─────────────────────────────────────────────────────────────

function buildVitestConfig(cfg: ProjectConfig): string {
  const { typescript } = cfg
  return `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    ${typescript ? "include: ['src/**/*.{test,spec}.{ts,tsx}']," : "include: ['src/**/*.{test,spec}.{js,jsx}'],"}
  },
})\n`
}

function buildVitestExample(_cfg: ProjectConfig): string {
  return `import { describe, it, expect } from 'vitest'

describe('example', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})\n`
}

// ── jest config ───────────────────────────────────────────────────────────────

function buildJestConfig(cfg: ProjectConfig): string {
  const { typescript, framework } = cfg
  return `/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  ${typescript ? `transform: { '^.+\\\\.(ts|tsx)$': 'ts-jest' },` : ''}
  ${framework === 'react' ? `setupFilesAfterFramework: ['@testing-library/jest-dom'],` : ''}
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
}\n`
}

function buildJestExample(cfg: ProjectConfig): string {
  const { typescript } = cfg
  return `${typescript ? "import type { } from '@jest/globals'" : ''}
describe('example', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})\n`
}

// ── cypress config ────────────────────────────────────────────────────────────

function buildCypressConfig(_cfg: ProjectConfig): string {
  return `import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: false,
  },
})\n`
}

function buildCypressExample(): string {
  return `describe('Home page', () => {
  it('should load', () => {
    cy.visit('/')
    cy.contains('h1').should('exist')
  })
})\n`
}

// ── validation schema examples ────────────────────────────────────────────────

function buildZodSchema(typescript: boolean): string {
  return `import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18'),
})

${typescript ? 'export type User = z.infer<typeof userSchema>' : ''}
`
}

function buildYupSchema(): string {
  return `import * as yup from 'yup'

export const userSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required(),
  email: yup.string().email('Invalid email address').required(),
  age: yup.number().min(18, 'Must be at least 18').required(),
})
`
}

function buildValibotSchema(typescript: boolean): string {
  return `import { object, string, number, minLength, minValue, email${typescript ? ', InferOutput' : ''} } from 'valibot'

export const userSchema = object({
  name: string([minLength(2, 'Name must be at least 2 characters')]),
  email: string([email('Invalid email address')]),
  age: number([minValue(18, 'Must be at least 18')]),
})

${typescript ? 'export type User = InferOutput<typeof userSchema>' : ''}
`
}

// ── http client examples ──────────────────────────────────────────────────────

function buildAxiosClient(_typescript: boolean): string {
  return `import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // handle unauthorized
    }
    return Promise.reject(error)
  }
)

export default api
`
}

function buildKyClient(_typescript: boolean): string {
  return `import ky from 'ky'

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('token')
        if (token) request.headers.set('Authorization', \`Bearer \${token}\`)
      },
    ],
  },
})

export default api
`
}

function buildTanstackQuerySetup(typescript: boolean): string {
  return `import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Example query hook
${typescript ? "export interface Post { id: number; title: string; body: string }" : ""}
export const postsQuery = {
  queryKey: ['posts'],
  queryFn: async () => {
    const res = await fetch(\`\${import.meta.env.VITE_API_URL ?? '/api'}/posts\`)
    if (!res.ok) throw new Error('Failed to fetch posts')
    return res.json()${typescript ? ' as Promise<Post[]>' : ''}
  },
}
`
}

function buildSwrSetup(typescript: boolean): string {
  return `import useSWR from 'swr'

const fetcher = (url${typescript ? ': string' : ''}) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

// Example SWR hook
export function usePosts() {
  const { data, error, isLoading } = useSWR(
    \`\${import.meta.env.VITE_API_URL ?? '/api'}/posts\`,
    fetcher
  )
  return { posts: data, error, isLoading }
}
`
}

// ── form library examples ─────────────────────────────────────────────────────

function buildReactHookForm(typescript: boolean, validation: string): string {
  const hasZod = validation === 'zod'
  return `import { useForm${hasZod ? ", SubmitHandler" : ""} } from 'react-hook-form'
${hasZod ? "import { zodResolver } from '@hookform/resolvers/zod'\nimport { userSchema } from '../schemas/userSchema'" : ""}
${typescript && hasZod ? "import type { z } from 'zod'\ntype FormData = z.infer<typeof userSchema>" : typescript ? "\ninterface FormData {\n  name: string\n  email: string\n}" : ""}

export function ExampleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm${typescript && hasZod ? '<FormData>' : typescript ? '<FormData>' : ''}(${hasZod ? "{\n    resolver: zodResolver(userSchema),\n  }" : ""})

  const onSubmit${typescript ? ': SubmitHandler<FormData>' : ''} = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  )
}
`
}

function buildFormik(typescript: boolean, validation: string): string {
  const hasYup = validation === 'yup'
  return `import { Formik, Form, Field, ErrorMessage } from 'formik'
${hasYup ? "import { userSchema } from '../schemas/userSchema'" : ""}

${typescript ? `interface FormValues {
  name: string
  email: string
}` : ""}

const initialValues${typescript ? ': FormValues' : ''} = { name: '', email: '' }

export function ExampleForm() {
  return (
    <Formik
      initialValues={initialValues}
      ${hasYup ? "validationSchema={userSchema}" : ""}
      onSubmit={(values) => console.log(values)}
    >
      <Form>
        <Field name="name" placeholder="Name" />
        <ErrorMessage name="name" component="span" />

        <Field name="email" placeholder="Email" />
        <ErrorMessage name="email" component="span" />

        <button type="submit">Submit</button>
      </Form>
    </Formik>
  )
}
`
}

function buildVeeValidate(typescript: boolean, validation: string): string {
  const hasYup = validation === 'yup'
  return `<template>
  <Form @submit="onSubmit"${hasYup ? ' :validation-schema="schema"' : ''}>
    <Field name="name" placeholder="Name" />
    <ErrorMessage name="name" />

    <Field name="email" placeholder="Email" />
    <ErrorMessage name="email" />

    <button type="submit">Submit</button>
  </Form>
</template>

<script setup${typescript ? ' lang="ts"' : ''}>
import { Form, Field, ErrorMessage } from 'vee-validate'
${hasYup ? "import { userSchema as schema } from '../schemas/userSchema'" : ""}

const onSubmit = (values${typescript ? ': Record<string, string>' : ''}) => {
  console.log(values)
}
</script>
`
}
