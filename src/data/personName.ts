export const personNameMaxLength = 50;
export const personNameError = 'Informe um nome com letras. Você pode usar acentos, espaços, hífen e apóstrofo.';

export function normalizePersonName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.normalize('NFC').trim().replace(/ +/g, ' ');
  if (name.length > personNameMaxLength) return null;
  return /^\p{L}[\p{L}\p{M}]*(?:[ '\u2019\u2010\u2011-]\p{L}[\p{L}\p{M}]*)*$/u.test(name) ? name : null;
}
