import type { IColorTheme } from 'src/types/color-theme';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getColorThemes,
  createColorTheme,
  deleteColorTheme,
  updateColorTheme,
  getColorThemesPage,
  type ColorThemeInput,
} from './color-theme-api';

// ----------------------------------------------------------------------

export const colorThemeKeys = {
  all: ['color-themes'] as const,
  lists: () => [...colorThemeKeys.all, 'list'] as const,
  list: (params: unknown) => [...colorThemeKeys.lists(), params] as const,
};

/** Full unpaginated list — used for dropdown/autocomplete selectors. */
export function useColorThemesQuery() {
  return useQuery({
    queryKey: colorThemeKeys.list({ all: true }),
    queryFn: () => getColorThemes(),
  });
}

export function useColorThemesPageQuery(params: { page: number; rowsPerPage: number }) {
  return useQuery({
    queryKey: colorThemeKeys.list(params),
    queryFn: () => getColorThemesPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateColorThemeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ColorThemeInput) => createColorTheme(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: colorThemeKeys.lists() });
    },
  });
}

export function useUpdateColorThemeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ColorThemeInput }) =>
      updateColorTheme(id, input),
    onSuccess: (_colorTheme: IColorTheme) => {
      queryClient.invalidateQueries({ queryKey: colorThemeKeys.lists() });
    },
  });
}

export function useDeleteColorThemeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteColorTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: colorThemeKeys.lists() });
    },
  });
}
