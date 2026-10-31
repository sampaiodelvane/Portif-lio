export interface ContactInput {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactMessage extends ContactInput {
  id: string
  createdAt: string
  /** null = não lida */
  readAt: string | null
}

export interface FeaturedProject {
  /** Slug do projeto no catálogo (src/content/projects.ts). */
  slug: string
  position: number
}
