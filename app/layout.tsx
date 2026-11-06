import type { Metadata, Viewport } from 'next';
import './oracle.css';
// Depois de oracle.css de proposito: padroniza campos que o CSS do artifact
// deixou com alturas e recuos diferentes (ver o comentario no arquivo).
import './campos.css';

export const metadata: Metadata = {
  title: 'Saint Village XX Century · Oráculo',
  description:
    'Narrador de crônicas solo numa metrópole portuária da Costa Oeste. A mesma cidade ao longo de um século: cinco eras, um dado de seis faces e a sua consciência.',
};

// O artifact declarava exatamente isto no <head>.
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
