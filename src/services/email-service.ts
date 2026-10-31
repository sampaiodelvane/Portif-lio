import type { ContactInput } from '@/types/contact'

// FormSubmit (formsubmit.co): encaminha o formulário para um e-mail, sem conta nem chave.
// A primeira mensagem dispara um e-mail de ativação para a caixa de destino; até o clique em
// "Activate Form", a API responde success "false" e a mensagem fica só no painel.
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/'

interface FormSubmitResponse {
  success?: string | boolean
  message?: string
}

export async function sendContactEmail(inbox: string, input: ContactInput): Promise<void> {
  const response = await fetch(`${FORMSUBMIT_ENDPOINT}${encodeURIComponent(inbox)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: input.name,
      // O campo "email" vira o Reply-To: responder o e-mail responde ao visitante.
      email: input.email,
      subject: input.subject || 'Sem assunto',
      message: input.message,
      _subject: `[Portfólio] ${input.subject || `Mensagem de ${input.name}`}`,
      _template: 'table',
      _captcha: 'false',
    }),
  })
  if (!response.ok) throw new Error(`FormSubmit respondeu ${response.status}`)

  const body = (await response.json().catch(() => ({}))) as FormSubmitResponse
  if (String(body.success) !== 'true') {
    throw new Error(body.message ?? 'FormSubmit não confirmou o envio')
  }
}
