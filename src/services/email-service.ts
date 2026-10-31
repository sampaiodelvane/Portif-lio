import type { EmailJsConfig } from '@/lib/env'
import type { ContactInput } from '@/types/contact'

// API REST do EmailJS chamada com fetch: dispensa o SDK no bundle.
const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

export async function sendContactEmail(config: EmailJsConfig, input: ContactInput): Promise<void> {
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: config.templateId,
      user_id: config.publicKey,
      // Nomes das variáveis do template no painel do EmailJS.
      template_params: {
        from_name: input.name,
        reply_to: input.email,
        subject: input.subject,
        message: input.message,
      },
    }),
  })
  if (!response.ok) throw new Error(`EmailJS respondeu ${response.status}`)
}
