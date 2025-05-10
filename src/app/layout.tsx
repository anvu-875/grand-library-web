import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grand Library',
  description:
    'A comprehensive wiki for game information, guides, and resources',
  appleWebApp: {
    title: 'Grand',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <main id='main-app'>{children}</main>
      </body>
    </html>
  );
}
