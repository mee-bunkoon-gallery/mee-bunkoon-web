import type { IEventType } from 'src/types/event-type';

import { apiFetch } from 'src/lib/api-fetch';

export type EventTypeInput = { name: string };

export async function getEventTypes(): Promise<IEventType[]> {
  const { eventTypes } = await apiFetch<{ eventTypes: IEventType[] }>('/api/event-types/');
  return eventTypes;
}

export async function getEventTypesPage(params: {
  page?: number;
  rowsPerPage?: number;
}): Promise<{ eventTypes: IEventType[]; total: number }> {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page ?? 0));
  qs.set('rowsPerPage', String(params.rowsPerPage ?? 10));
  return apiFetch<{ eventTypes: IEventType[]; total: number }>(`/api/event-types/?${qs}`);
}

export async function createEventType(input: EventTypeInput): Promise<IEventType> {
  const { eventType } = await apiFetch<{ eventType: IEventType }>('/api/event-types/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return eventType;
}

export async function updateEventType(id: string, input: EventTypeInput): Promise<IEventType> {
  const { eventType } = await apiFetch<{ eventType: IEventType }>(`/api/event-types/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return eventType;
}

export async function deleteEventType(id: string): Promise<void> {
  await apiFetch(`/api/event-types/${id}/`, { method: 'DELETE' });
}
