import type { ProjectConfig } from '../types'

export interface TreeNode {
  name: string
  type: 'file' | 'folder'
  children?: TreeNode[]
}

const ex = (ts: boolean) => ts ? 'tsx' : 'jsx'
const s  = (ts: boolean) => ts ? 'ts'  : 'js'

export function buildFileTree(cfg: ProjectConfig): TreeNode {
  const { projectName, framework, typescript: ts, styling, routing, stateManagement, linting, testing, buildTool, validation, httpClient, formLibrary } = cfg

  const root: TreeNode = { name: projectName, type: 'folder', children: [] }

  // ── src ──────────────────────────────────────────────────────────────────────
  const srcChildren: TreeNode[] = []

  const componentFiles = formLibrary !== 'none'
    ? [{ name: framework === 'vue' ? 'ExampleForm.vue' : `ExampleForm.${ex(ts)}`, type: 'file' as const }]
    : []
  srcChildren.push({ name: 'components', type: 'folder', children: componentFiles })
  srcChildren.push({
    name: 'pages', type: 'folder', children: [
      { name: framework === 'vue' ? 'Home.vue' : `Home.${ex(ts)}`, type: 'file' }
    ]
  })

  if (stateManagement === 'zustand') {
    srcChildren.push({ name: 'store', type: 'folder', children: [{ name: `useAppStore.${s(ts)}`, type: 'file' }] })
  } else if (stateManagement === 'redux') {
    srcChildren.push({ name: 'store', type: 'folder', children: [
      { name: `store.${s(ts)}`, type: 'file' },
      { name: `counterSlice.${s(ts)}`, type: 'file' },
    ]})
  } else if (stateManagement === 'pinia') {
    srcChildren.push({ name: 'store', type: 'folder', children: [{ name: `useAppStore.${s(ts)}`, type: 'file' }] })
  }

  if (routing === 'vue-router' && framework === 'vue') {
    srcChildren.push({ name: 'router', type: 'folder', children: [{ name: `index.${s(ts)}`, type: 'file' }] })
  }

  if (testing === 'vitest' || testing === 'jest') {
    srcChildren.push({ name: '__tests__', type: 'folder', children: [
      { name: `example.test.${s(ts)}`, type: 'file' }
    ]})
  }

  if (httpClient !== 'none') {
    const fileName = httpClient === 'tanstack-query' ? `queryClient.${s(ts)}` : httpClient === 'swr' ? `fetcher.${s(ts)}` : `client.${s(ts)}`
    srcChildren.push({ name: 'api', type: 'folder', children: [{ name: fileName, type: 'file' }] })
  }

  if (validation !== 'none') {
    srcChildren.push({ name: 'schemas', type: 'folder', children: [
      { name: `userSchema.${s(ts)}`, type: 'file' }
    ]})
  }

  if (styling === 'tailwind' || styling === 'css') {
    srcChildren.push({ name: 'index.css', type: 'file' })
  }

  if (framework === 'vue') {
    srcChildren.push({ name: 'App.vue', type: 'file' })
    srcChildren.push({ name: `main.${s(ts)}`, type: 'file' })
  } else {
    srcChildren.push({ name: `App.${ex(ts)}`, type: 'file' })
    srcChildren.push({ name: `main.${ex(ts)}`, type: 'file' })
  }

  root.children!.push({ name: 'src', type: 'folder', children: srcChildren })

  // ── cypress ───────────────────────────────────────────────────────────────────
  if (testing === 'cypress') {
    root.children!.push({
      name: 'cypress', type: 'folder', children: [
        { name: 'e2e', type: 'folder', children: [{ name: 'home.cy.ts', type: 'file' }] }
      ]
    })
  }

  // ── root files ────────────────────────────────────────────────────────────────
  root.children!.push({ name: 'index.html',    type: 'file' })
  root.children!.push({ name: 'package.json',  type: 'file' })

  if (framework !== 'angular') {
    if (buildTool === 'vite')    root.children!.push({ name: `vite.config.${s(ts)}`,    type: 'file' })
    if (buildTool === 'webpack') root.children!.push({ name: `webpack.config.${s(ts)}`, type: 'file' })
    if (ts) root.children!.push({ name: 'tsconfig.json', type: 'file' })
    if (styling === 'tailwind') {
      root.children!.push({ name: 'tailwind.config.js', type: 'file' })
      root.children!.push({ name: 'postcss.config.js',  type: 'file' })
    }
  }

  if (linting === 'eslint' || linting === 'eslint+prettier') {
    root.children!.push({ name: '.eslintrc.cjs',  type: 'file' })
    root.children!.push({ name: '.eslintignore',  type: 'file' })
  }
  if (linting === 'eslint+prettier') {
    root.children!.push({ name: '.prettierrc',    type: 'file' })
    root.children!.push({ name: '.prettierignore', type: 'file' })
  }

  if (testing === 'vitest')  root.children!.push({ name: `vitest.config.${s(ts)}`, type: 'file' })
  if (testing === 'jest')    root.children!.push({ name: 'jest.config.cjs',         type: 'file' })
  if (testing === 'cypress') root.children!.push({ name: `cypress.config.${s(ts)}`, type: 'file' })

  root.children!.push({ name: 'README.md',  type: 'file' })
  root.children!.push({ name: '.gitignore', type: 'file' })

  return root
}
