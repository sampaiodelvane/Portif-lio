export interface AuthUser {
  id: string
  email: string
}

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated'; user: null }

export interface AuthContextValue {
  state: AuthState
  /** 'local' = modo demonstração (localStorage); 'supabase' = backend real. */
  mode: 'local' | 'supabase'
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
