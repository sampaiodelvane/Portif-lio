import { Settings } from 'lucide-react'
import { StatusMessage } from '@/components/ui/StatusMessage'

export function MissingUsernameMessage() {
  return (
    <StatusMessage icon={Settings} title="Usuário do GitHub não configurado">
      Defina <code className="font-mono text-sm text-ink">VITE_GITHUB_USERNAME</code> no{' '}
      <code className="font-mono text-sm text-ink">.env.local</code> (ou nas variáveis de ambiente
      da Vercel) e reinicie o servidor.
    </StatusMessage>
  )
}
