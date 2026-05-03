import type { Movie } from '../types';

const NOW_SHOWING_ORDER: readonly string[] = [
  'Beast Inside',
  'The Devil Wears Prada 2',
  'The Mummy',
  'Escape Room 2',
  'Michael',
  'Project Hail Mary',
  'Protector',
];

function orderKey(m: Movie): string {
  return m.originalTitle ?? m.title;
}

export function sortNowShowingMovies(movies: Movie[]): Movie[] {
  return [...movies].sort((a, b) => {
    const ia = NOW_SHOWING_ORDER.indexOf(orderKey(a));
    const ib = NOW_SHOWING_ORDER.indexOf(orderKey(b));
    const pa = ia === -1 ? NOW_SHOWING_ORDER.length : ia;
    const pb = ib === -1 ? NOW_SHOWING_ORDER.length : ib;
    if (pa !== pb) return pa - pb;
    return b.id - a.id;
  });
}
