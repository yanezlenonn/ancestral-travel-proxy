import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ancestral Travel - Planejador de Viagens com IA',
  description: 'Crie roteiros personalizados baseados na sua ancestralidade',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#ffffff'
      }}>
        {children}
      </body>
    </html>
  );
}
