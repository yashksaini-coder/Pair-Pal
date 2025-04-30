import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { SessionProvider } from '@/components/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevSync - Connect with Developers',
  description: 'Find your perfect coding partner with DevSync',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem
          >
            <div className="relative min-h-screen pb-16 md:pb-0">
              <Navigation/>
              <main className="">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}