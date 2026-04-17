'use client';

import { Suspense } from 'react';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
