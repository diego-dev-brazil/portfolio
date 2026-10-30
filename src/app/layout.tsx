import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diego Augusto | Software Developer and AI Builder',
  description:
    'Portfólio de Diego Augusto — Software Developer and AI Builder. Automação, ferramentas internas, inteligência artificial e produtos digitais.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
