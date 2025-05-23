import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});
export const metadata: Metadata = {
  title: 'So You Made a Mix.',
  description: 'So You Made a Mix.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
        >
          <main className='flex h-screen flex-col justify-between lg:p-24 md:p-16 p-8'>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
