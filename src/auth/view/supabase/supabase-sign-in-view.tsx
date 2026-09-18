'use client';

import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiEyeFill, RiEyeOffFill, RiLockPasswordFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { signInWithPassword } from '../../context/supabase';

// ----------------------------------------------------------------------

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignInSchema = z.object({
  email: schemaUtils.email(),
  password: z
    .string()
    .min(1, { error: 'กรุณากรอกรหัสผ่าน' })
    .min(6, { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }),
});

// ----------------------------------------------------------------------

export function SupabaseSignInView() {
  const router = useRouter();

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignInSchemaType = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({ email: data.email, password: data.password });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="email" label="อีเมล" slotProps={{ inputLabel: { shrink: true } }} />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Link
          component={RouterLink}
          href={paths.auth.supabase.resetPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          ลืมรหัสผ่าน?
        </Link>

        <Field.Text
          name="password"
          label="รหัสผ่าน"
          placeholder="กรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร"
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    {showPassword.value ? <RiEyeFill /> : <RiEyeOffFill />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Button
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="ลงชื่อเข้าใช้..."
      >
        ลงชื่อเข้าใช้
      </Button>
    </Box>
  );

  return (
    <Card
      sx={{
        p: { xs: 3, sm: 5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: { xs: 2.5, sm: 3 },
        boxShadow: '0 24px 64px rgba(13, 32, 61, 0.12)',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          mb: 3,
          display: 'grid',
          borderRadius: 2,
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }}
      >
        <RiLockPasswordFill size={28} />
      </Box>
      <Typography variant="h3">เข้าสู่ระบบหลังบ้าน</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        กรอกอีเมลและรหัสผ่านเพื่อจัดการข้อมูลของร้าน
      </Typography>

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </Card>
  );
}
