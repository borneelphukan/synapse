'use client';

import { Suspense } from 'react';
import { ResetPasswordPage } from '@/views/reset_password';

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
