import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getCompanyProfile, updateCompanyProfile, type CompanyProfileInput } from './settings-api';

// ----------------------------------------------------------------------

export const companyProfileKeys = {
  all: ['company-profile'] as const,
};

export function useCompanyProfileQuery() {
  return useQuery({
    queryKey: companyProfileKeys.all,
    queryFn: () => getCompanyProfile(),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateCompanyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompanyProfileInput) => updateCompanyProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyProfileKeys.all });
    },
  });
}
