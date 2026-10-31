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
  repoName: string
  position: number
}
