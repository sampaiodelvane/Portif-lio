import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CONTACT_INBOX } from '@/content/contact-inbox'
import { DEMO_KEYS, readStored } from '@/test/demo-backend'
import { jsonResponse, mockFetch } from '@/test/github-fixtures'
import { renderRoute } from '@/test/render-route'
import type { ContactMessage } from '@/types/contact'

async function openForm() {
  const user = userEvent.setup()
  renderRoute('/contato')
  await screen.findByRole('heading', { level: 1, name: 'Contato' })
  return user
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
  await user.type(screen.getByLabelText(/Assunto/), 'Vaga front-end')
  await user.type(screen.getByLabelText('Mensagem'), 'Olá! Gostei do portfólio e quero conversar.')
}

const submitButton = () => screen.getByRole('button', { name: /enviar mensagem|enviando/i })
const storedMessages = () => readStored<ContactMessage[]>(DEMO_KEYS.messages) ?? []

describe('ContactForm — validação', () => {
  it('mostra os erros de todos os campos obrigatórios e não envia', async () => {
    const user = await openForm()

    await user.click(submitButton())

    expect(await screen.findByText('Informe seu nome (mínimo 2 letras)')).toBeInTheDocument()
    expect(screen.getByText('Informe seu e-mail')).toBeInTheDocument()
    expect(screen.getByText('Escreva pelo menos 10 caracteres')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
    // Foco vai para o primeiro campo inválido (acessibilidade)
    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(storedMessages()).toHaveLength(0)
  })

  it('valida formato de e-mail e liga a mensagem ao campo (aria-describedby)', async () => {
    const user = await openForm()
    const email = screen.getByLabelText('E-mail')

    await user.type(email, 'ana@')
    await user.tab()

    const error = await screen.findByText('E-mail inválido')
    expect(email.getAttribute('aria-describedby')).toContain(error.id)
  })

  it('rejeita mensagem acima do limite e mostra o contador', async () => {
    const user = await openForm()
    const message = screen.getByLabelText('Mensagem')

    await user.click(message)
    await user.paste('a'.repeat(2001))
    await user.tab()

    expect(
      await screen.findByText('Mensagem muito longa (máximo 2000 caracteres)'),
    ).toBeInTheDocument()
    expect(screen.getByText('2001/2000 caracteres')).toBeInTheDocument()
  })
})

describe('ContactForm — envio', () => {
  it('bloqueia o botão durante o envio e grava uma única cópia mesmo com clique duplo', async () => {
    const user = await openForm()
    await fillValid(user)

    await user.dblClick(submitButton())

    expect(await screen.findByRole('status')).toHaveTextContent('Mensagem enviada')
    expect(storedMessages()).toHaveLength(1)
    expect(storedMessages()[0]).toMatchObject({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      subject: 'Vaga front-end',
      readAt: null,
    })
  })

  it('mostra "Enviando…" com o botão desabilitado enquanto aguarda', async () => {
    let release: (r: Response) => void = () => {}
    mockFetch([
      { match: /formsubmit/, respond: () => new Promise<Response>((r) => (release = r)) as never },
    ])
    const user = await openForm()
    await fillValid(user)

    await user.click(submitButton())

    const button = await screen.findByRole('button', { name: /enviando/i })
    expect(button).toBeDisabled()
    release(jsonResponse({ success: 'true' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Mensagem enviada')
  })

  it('envia pelo FormSubmit para a caixa do autor e grava cópia no painel', async () => {
    const fetchMock = mockFetch([
      { match: /formsubmit/, respond: () => jsonResponse({ success: 'true' }) },
    ])
    const user = await openForm()
    await fillValid(user)

    await user.click(submitButton())

    await screen.findByRole('status')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_INBOX)}`)
    expect(JSON.parse(String(init.body))).toMatchObject({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      _subject: '[Portfólio] Vaga front-end',
    })
    expect(storedMessages()).toHaveLength(1)
  })

  it('formulário ainda não ativado no FormSubmit: guarda no painel e mostra sucesso', async () => {
    mockFetch([
      {
        match: /formsubmit/,
        respond: () => jsonResponse({ success: 'false', message: 'This form needs Activation' }),
      },
    ])
    const user = await openForm()
    await fillValid(user)

    await user.click(submitButton())

    expect(await screen.findByRole('status')).toHaveTextContent('Mensagem enviada')
    expect(storedMessages()).toHaveLength(1)
  })

  it('se todos os canais falham, mostra erro e mantém o que foi digitado', async () => {
    mockFetch([{ match: /formsubmit/, respond: () => jsonResponse({}, { status: 500 }) }])
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    const user = await openForm()
    await fillValid(user)

    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível enviar agora')
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza')
    expect(submitButton()).toBeEnabled()
  })

  it('descarta silenciosamente envio de bot (honeypot preenchido)', async () => {
    const user = await openForm()
    await fillValid(user)
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]')
    if (!honeypot) throw new Error('honeypot ausente')
    await user.type(honeypot, 'http://spam.example')

    await user.click(submitButton())

    await waitFor(() => expect(screen.getByLabelText('Nome')).toHaveValue(''))
    expect(storedMessages()).toHaveLength(0)
  })
})
