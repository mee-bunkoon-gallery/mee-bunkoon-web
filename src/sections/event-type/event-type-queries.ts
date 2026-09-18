import type { IEventType } from 'src/types/event-type';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getEventTypes,
  createEventType,
  deleteEventType,
  updateEventType,
  getEventTypesPage,
  type EventTypeInput,
} from './event-type-api';

// ----------------------------------------------------------------------

export const eventTypeKeys = {
  all: ['event-types'] as const,
  lists: () => [...eventTypeKeys.all, 'list'] as const,
  list: (params: unknown) => [...eventTypeKeys.lists(), params] as const,
};

/** Full unpaginated list — used for dropdown/autocomplete selectors. */
export function useEventTypesQuery() {
  return useQuery({
    queryKey: eventTypeKeys.list({ all: true }),
    queryFn: () => getEventTypes(),
  });
}

export function useEventTypesPageQuery(params: { page: number; rowsPerPage: number }) {
  return useQuery({
    queryKey: eventTypeKeys.list(params),
    queryFn: () => getEventTypesPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateEventTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EventTypeInput) => createEventType(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.lists() });
    },
  });
}

export function useUpdateEventTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EventTypeInput }) =>
      updateEventType(id, input),
    onSuccess: (_eventType: IEventType) => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.lists() });
    },
  });
}

export function useDeleteEventTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.lists() });
    },
  });
}
