export interface User {
  id: string
  email: string
}

export interface Build {
  id: string
  name: string
  class: string
  main_skill: string
  level?: number
  created_at?: string
}
