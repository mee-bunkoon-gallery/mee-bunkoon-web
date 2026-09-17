import type { IColorTheme } from 'src/types/color-theme';

import { apiFetch } from 'src/lib/api-fetch';

export type ColorThemeInput = { name: string; hexCode?: string };

export async function getColorThemes(): Promise<IColorTheme[]> {
  const { colorThemes } = await apiFetch<{ colorThemes: IColorTheme[] }>('/api/color-themes/');
  return colorThemes;
}

export async function createColorTheme(input: ColorThemeInput): Promise<IColorTheme> {
  const { colorTheme } = await apiFetch<{ colorTheme: IColorTheme }>('/api/color-themes/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return colorTheme;
}

export async function updateColorTheme(id: string, input: ColorThemeInput): Promise<IColorTheme> {
  const { colorTheme } = await apiFetch<{ colorTheme: IColorTheme }>(`/api/color-themes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return colorTheme;
}

export async function deleteColorTheme(id: string): Promise<void> {
  await apiFetch(`/api/color-themes/${id}/`, { method: 'DELETE' });
}
