import { CONTACT_INBOX } from '@/content/contact-inbox'
import { getPublicBackend } from '@/services/backend'
import { sendContactEmail } from '@/services/email-service'
import type { ContactInput } from '@/types/contact'

export interface SubmitResult {
  emailSent: boolean
  stored: boolean
}

/**
 * Envia o e-mail e grava a cópia para o painel EM PARALELO.
 * Sucesso se pelo menos um canal funcionou: a mensagem não se perde
 * se o FormSubmit estiver fora do ar (fica no painel) ou vice-versa.
 */
export async function submitContact(input: ContactInput): Promise<SubmitResult> {
  const [email, storage] = await Promise.allSettled([
    sendContactEmail(CONTACT_INBOX, input),
    getPublicBackend().createMessage(input),
  ])

  const result = { emailSent: email.status === 'fulfilled', stored: storage.status === 'fulfilled' }
  if (!result.emailSent && !result.stored) {
    throw new Error('Não foi possível enviar a mensagem por nenhum canal')
  }
  return result
}
