const UPPER_A = 65;

const sanitizeKey = (key: string) => key.toUpperCase().replace(/[^A-Z]/g, '');

export function vigenereEncrypt(text: string, key: string) {
  const cleanKey = sanitizeKey(key);
  if (!cleanKey) return text;

  let idx = 0;
  return text.replace(/[A-Za-z]/g, (ch) => {
    const isUpper = ch === ch.toUpperCase();
    const base = isUpper ? 65 : 97;
    const plain = ch.charCodeAt(0) - base;
    const k = cleanKey.charCodeAt(idx++ % cleanKey.length) - UPPER_A;
    return String.fromCharCode(base + ((plain + k) % 26));
  });
}

export function vigenereDecrypt(text: string, key: string) {
  const cleanKey = sanitizeKey(key);
  if (!cleanKey) return text;

  let idx = 0;
  return text.replace(/[A-Za-z]/g, (ch) => {
    const isUpper = ch === ch.toUpperCase();
    const base = isUpper ? 65 : 97;
    const cipher = ch.charCodeAt(0) - base;
    const k = cleanKey.charCodeAt(idx++ % cleanKey.length) - UPPER_A;
    return String.fromCharCode(base + ((cipher - k + 26) % 26));
  });
}
