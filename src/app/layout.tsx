import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';

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
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <main id='main-app'>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
