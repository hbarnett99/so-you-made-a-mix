import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/utils';
import { Providers } from '@/components/providers';

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
    <html 
      suppressHydrationWarning
      lang='en' 
      className="dark"
    >
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <Providers>
          <main className='flex h-screen flex-col justify-between lg:p-24 md:p-16 p-8'>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
