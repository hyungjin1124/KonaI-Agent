import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';

export const metadata: Metadata = {
  title: 'KonaAgent',
  description: 'KonaI Agent Demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans" data-hydrated="true">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
