'use client';

import type { IContract } from 'src/types/contract';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getContract } from './contract-api';
import { ContractNewEditForm } from './contract-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  contractId: string;
};

export function ContractEditView({ contractId }: Props) {
  const router = useRouter();

  const [contract, setContract] = useState<IContract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContract(contractId)
      .then(setContract)
      .catch((error) => {
        console.error(error);
        toast.error('ไม่พบสัญญานี้');
        router.replace(paths.dashboard.contract.root);
      })
      .finally(() => setLoading(false));
  }, [contractId, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!contract) {
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขสัญญา {contract.contractNo}
      </Typography>

      <ContractNewEditForm currentContract={contract} />
    </DashboardContent>
  );
}
