import { z } from 'zod'

// Mesmos limites das constraints da tabela contact_messages (supabase/migrations).
export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  subject: { max: 120 },
  message: { min: 10, max: 2000 },
} as const

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.name.min, 'Informe seu nome (mínimo 2 letras)')
    .max(CONTACT_LIMITS.name.max, 'Nome muito longo (máximo 80 caracteres)'),
  email: z.string().trim().min(1, 'Informe seu e-mail').pipe(z.email('E-mail inválido')),
  subject: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.subject.max, 'Assunto muito longo (máximo 120 caracteres)'),
  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.message.min, 'Escreva pelo menos 10 caracteres')
    .max(CONTACT_LIMITS.message.max, 'Mensagem muito longa (máximo 2000 caracteres)'),
  // Honeypot: campo invisível para pessoas. Bots preenchem; humanos deixam vazio.
  website: z.string().optional(),
})

export type ContactFormInput = z.input<typeof contactSchema>
export type ContactFormValues = z.output<typeof contactSchema>

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail').pipe(z.email('E-mail inválido')),
  password: z.string().min(1, 'Informe a senha'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
