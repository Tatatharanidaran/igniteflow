import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { MomentumProvider } from '@/hooks/useMomentumStore';

export const metadata: Metadata = {
  title: 'IngniteFlow',
  description: 'A lightweight personal productivity operating system'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MomentumProvider>
          <AppShell>{children}</AppShell>
        </MomentumProvider>
      </body>
    </html>
  );
}
