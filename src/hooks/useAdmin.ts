import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { featuredKey } from '@/hooks/useFeaturedProjects'
import { loadAdminBackend } from '@/services/backend'
import type { ContactMessage } from '@/types/contact'

const messagesKey = ['admin', 'messages'] as const

export function useAdminMessages() {
  return useQuery({
    queryKey: messagesKey,
    queryFn: async () => (await loadAdminBackend()).listMessages(),
    staleTime: 30_000,
  })
}

/**
 * Mutação com atualização otimista: a UI muda na hora e volta ao estado
 * anterior se o servidor recusar. Ao final, revalida com o servidor.
 */
function useOptimisticMessages<TVars>(
  mutate: (vars: TVars) => Promise<void>,
  apply: (messages: ContactMessage[], vars: TVars) => ContactMessage[],
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mutate,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: messagesKey })
      const previous = queryClient.getQueryData<ContactMessage[]>(messagesKey)
      if (previous) queryClient.setQueryData(messagesKey, apply(previous, vars))
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(messagesKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: messagesKey }),
  })
}

export function useSetMessageRead() {
  return useOptimisticMessages(
    async ({ id, read }: { id: string; read: boolean }) =>
      (await loadAdminBackend()).setMessageRead(id, read),
    (messages, { id, read }) =>
      messages.map((m) =>
        m.id === id ? { ...m, readAt: read ? new Date().toISOString() : null } : m,
      ),
  )
}

export function useDeleteMessage() {
  return useOptimisticMessages(
    async (id: string) => (await loadAdminBackend()).deleteMessage(id),
    (messages, id) => messages.filter((m) => m.id !== id),
  )
}

export function useSaveFeatured() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (repoNames: string[]) => (await loadAdminBackend()).setFeatured(repoNames),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: featuredKey }),
  })
}
