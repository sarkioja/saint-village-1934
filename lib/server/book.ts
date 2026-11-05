// Carregamento do texto do livro — SERVIDOR APENAS.
//
// Sao ~414 KB de prosa (textos por regiao + facoes) usados somente na montagem do
// prompt. Nunca importe este modulo de codigo de cliente.
import type { BookText } from './prompt';

import b1934 from './book/1934.json';
import b1946 from './book/1946.json';
import b1974 from './book/1974.json';
import b1994 from './book/1994.json';
import b1999 from './book/1999.json';

const BOOKS: Record<string, BookText> = {
  '1934': b1934 as BookText,
  '1946': b1946 as BookText,
  '1974': b1974 as BookText,
  '1994': b1994 as BookText,
  '1999': b1999 as BookText,
};

export function loadBook(era: string): BookText {
  const b = BOOKS[era];
  if (!b) throw new Error('era desconhecida: ' + era);
  return b;
}

export const ERAS = Object.keys(BOOKS);
