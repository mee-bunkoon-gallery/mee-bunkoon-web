import { useQuery } from '@tanstack/react-query';

import { getPromotionPackages } from './promotion-package-api';

export const promotionPackageKeys = {
  all: ['promotion-packages'] as const,
  list: () => [...promotionPackageKeys.all, 'list'] as const,
};

export function usePromotionPackagesQuery() {
  return useQuery({
    queryKey: promotionPackageKeys.list(),
    queryFn: () => getPromotionPackages(),
  });
}
