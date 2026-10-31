import * as z from 'zod/mini'

// Mesmos limites das constraints da tabela contact_messages (supabase/migrations).
export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  subject: { max: 120 },
  message: { min: 10, max: 2000 },
} as const

const { name, subject, message } = CONTACT_LIMITS

// z.trim() normaliza o valor antes das demais checagens (e o valor enviado já sai sem espaços).
const requiredEmail = (emptyMessage: string) =>
  z.string().check(z.trim(), z.minLength(1, emptyMessage), z.email('E-mail inválido'))

export const contactSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(name.min, 'Informe seu nome (mínimo 2 letras)'),
      z.maxLength(name.max, 'Nome muito longo (máximo 80 caracteres)'),
    ),
  email: requiredEmail('Informe seu e-mail'),
  subject: z
    .string()
    .check(z.trim(), z.maxLength(subject.max, 'Assunto muito longo (máximo 120 caracteres)')),
  message: z
    .string()
    .check(
      z.trim(),
      z.minLength(message.min, 'Escreva pelo menos 10 caracteres'),
      z.maxLength(message.max, 'Mensagem muito longa (máximo 2000 caracteres)'),
    ),
  // Honeypot: campo invisível para pessoas. Bots preenchem; humanos deixam vazio.
  website: z.optional(z.string()),
})

export type ContactFormInput = z.input<typeof contactSchema>
export type ContactFormValues = z.output<typeof contactSchema>

export const loginSchema = z.object({
  email: requiredEmail('Informe o e-mail'),
  password: z.string().check(z.minLength(1, 'Informe a senha')),
})

export type LoginFormValues = z.infer<typeof loginSchema>
