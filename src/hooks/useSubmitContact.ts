import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitContact } from '@/services/contact-service'
import type { ContactInput } from '@/types/contact'

export function useSubmitContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ContactInput) => submitContact(input),
    // Se o admin estiver com o painel aberto em outra aba do mesmo app, a lista atualiza.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  })
}
