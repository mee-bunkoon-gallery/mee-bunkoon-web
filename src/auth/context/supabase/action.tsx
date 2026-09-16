'use client';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type ResetPasswordParams = {
  email: string;
};

export type UpdatePasswordParams = {
  password: string;
  /** Present only when arriving from a password-recovery email link. */
  accessToken?: string;
  refreshToken?: string;
};

async function postJson(url: string, body?: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'Something went wrong!');
  }

  return payload;
}

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  await postJson('/api/auth/sign-in/', { email, password });
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  await postJson('/api/auth/sign-up/', { email, password, firstName, lastName });
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  await postJson('/api/auth/sign-out/');
};

/** **************************************
 * Reset password
 *************************************** */
export const resetPassword = async ({ email }: ResetPasswordParams): Promise<void> => {
  await postJson('/api/auth/reset-password/', { email });
};

/** **************************************
 * Update password
 *************************************** */
export const updatePassword = async ({
  password,
  accessToken,
  refreshToken,
}: UpdatePasswordParams): Promise<void> => {
  await postJson('/api/auth/update-password/', { password, accessToken, refreshToken });
};
