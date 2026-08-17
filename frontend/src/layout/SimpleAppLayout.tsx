import { ReactNode } from 'react';
import AuthLayout from '@/layouts/AuthLayout';

export default function SimpleAppLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}

export { SimpleAppLayout };
