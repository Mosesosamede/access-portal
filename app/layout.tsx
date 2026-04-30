import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Deloxe HR Ecosystem',
  description: 'Dual-portal ecosystem for Deloxe HR Consulting: Shop Books & My Library.',
  icons: {
    icon: 'https://i.ibb.co/pjxqNW0p/favicon.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="midnight-gradient" suppressHydrationWarning>{children}</body>
    </html>
  );
}
