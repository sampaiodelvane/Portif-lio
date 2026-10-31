import { ContactForm } from '@/components/contact/ContactForm'
import { PageHeading } from '@/components/PageHeading'

export default function ContactPage() {
  return (
    <>
      <title>Contato · Portfólio</title>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <PageHeading eyebrow="Fale comigo" title="Contato">
          Tem um projeto, vaga ou dúvida sobre algum repositório? Mande uma mensagem — ela chega por
          e-mail e fica registrada no painel.
        </PageHeading>
        <ContactForm />
      </div>
    </>
  )
}
