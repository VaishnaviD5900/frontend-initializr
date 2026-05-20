export type Framework = 'react' | 'vue' | 'angular'
export type Styling = 'tailwind' | 'mui' | 'vuetify' | 'angular-material' | 'css'
export type Routing = 'react-router' | 'tanstack-router' | 'vue-router' | 'angular-router' | 'none'
export type StateManagement = 'zustand' | 'redux' | 'pinia' | 'ngrx' | 'none'

export interface ProjectConfig {
  projectName: string
  framework: Framework
  styling: Styling
  typescript: boolean
  routing: Routing
  stateManagement: StateManagement
}

export const DEFAULT_CONFIG: ProjectConfig = {
  projectName: 'my-app',
  framework: 'react',
  styling: 'tailwind',
  typescript: true,
  routing: 'react-router',
  stateManagement: 'zustand',
}
