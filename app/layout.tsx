import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Deloxe HR Ecosystem',
  description: 'Dual-portal ecosystem for Deloxe HR Consulting: Sales Hub & Access Portal.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="midnight-gradient" suppressHydrationWarning>{children}</body>
    </html>
  );
}
