export type Framework = 'react' | 'vue' | 'angular'
export type Styling = 'tailwind' | 'mui' | 'vuetify' | 'angular-material' | 'css'
export type Routing = 'react-router' | 'tanstack-router' | 'vue-router' | 'angular-router' | 'none'
export type StateManagement = 'zustand' | 'redux' | 'pinia' | 'ngrx' | 'none'
export type BuildTool = 'vite' | 'webpack' | 'parcel'
export type PackageManager = 'npm' | 'pnpm' | 'yarn'
export type Linting = 'eslint' | 'eslint+prettier' | 'none'
export type Testing = 'vitest' | 'jest' | 'cypress' | 'none'
export type Validation = 'zod' | 'yup' | 'valibot' | 'none'
export type HttpClient = 'axios' | 'ky' | 'tanstack-query' | 'swr' | 'none'
export type FormLibrary = 'react-hook-form' | 'formik' | 'vee-validate' | 'none'

export interface ProjectConfig {
  projectName: string
  buildTool: BuildTool
  framework: Framework
  styling: Styling
  typescript: boolean
  routing: Routing
  stateManagement: StateManagement
  packageManager: PackageManager
  linting: Linting
  testing: Testing
  validation: Validation
  httpClient: HttpClient
  formLibrary: FormLibrary
}

export const DEFAULT_CONFIG: ProjectConfig = {
  projectName: 'my-app',
  buildTool: 'vite',
  framework: 'react',
  styling: 'tailwind',
  typescript: true,
  routing: 'react-router',
  stateManagement: 'zustand',
  packageManager: 'npm',
  linting: 'eslint+prettier',
  testing: 'vitest',
  validation: 'zod',
  httpClient: 'axios',
  formLibrary: 'react-hook-form',
}
