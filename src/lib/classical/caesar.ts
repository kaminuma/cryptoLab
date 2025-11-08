const UPPER_A = 65;
const UPPER_Z = 90;
const LOWER_A = 97;
const LOWER_Z = 122;

const wrap = (code: number, low: number, high: number, shift: number) =>
  String.fromCharCode(((code - low + shift) % 26 + 26) % 26 + low);

export function caesarEncrypt(text: string, shift: number) {
  return text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= UPPER_A && code <= UPPER_Z) return wrap(code, UPPER_A, UPPER_Z, shift);
      if (code >= LOWER_A && code <= LOWER_Z) return wrap(code, LOWER_A, LOWER_Z, shift);
      return ch;
    })
    .join('');
}

export function caesarDecrypt(text: string, shift: number) {
  return caesarEncrypt(text, -shift);
}
