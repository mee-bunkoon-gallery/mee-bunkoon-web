import type { IHeroBanner, HeroBannerInput } from 'src/types/hero-banner';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getHeroBanner,
  getHeroBanners,
  createHeroBanner,
  deleteHeroBanner,
  updateHeroBanner,
} from './hero-banner-api';

export const heroBannerKeys = {
  all: ['hero-banners'] as const,
  list: (params: unknown) => ['hero-banners', 'list', params] as const,
  detail: (id: string) => ['hero-banners', 'detail', id] as const,
};

export function useHeroBannersQuery(params: { page: number; rowsPerPage: number }) {
  return useQuery({
    queryKey: heroBannerKeys.list(params),
    queryFn: () => getHeroBanners(params),
    placeholderData: keepPreviousData,
  });
}

export function useHeroBannerQuery(id: string) {
  return useQuery({ queryKey: heroBannerKeys.detail(id), queryFn: () => getHeroBanner(id) });
}

export function useCreateHeroBannerMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createHeroBanner,
    onSuccess: () => client.invalidateQueries({ queryKey: heroBannerKeys.all }),
  });
}

export function useUpdateHeroBannerMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: HeroBannerInput }) =>
      updateHeroBanner(id, input),
    onSuccess: (banner: IHeroBanner) => {
      client.invalidateQueries({ queryKey: heroBannerKeys.all });
      client.setQueryData(heroBannerKeys.detail(banner.id), banner);
    },
  });
}

export function useDeleteHeroBannerMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteHeroBanner,
    onSuccess: () => client.invalidateQueries({ queryKey: heroBannerKeys.all }),
  });
}
