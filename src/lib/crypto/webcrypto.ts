const toBufferSource = (bytes?: Uint8Array) => (bytes ? (bytes as unknown as BufferSource) : undefined)

export async function aesGcmEncrypt(keyRaw: Uint8Array, data: Uint8Array, aad?: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', toBufferSource(keyRaw)!, 'AES-GCM', false, ['encrypt']);
  const params: AesGcmParams = {
    name: 'AES-GCM',
    iv: toBufferSource(iv)!,
    tagLength: 128
  };
  if (aad) {
    params.additionalData = toBufferSource(aad);
  }
  const buf = await crypto.subtle.encrypt(params, key, toBufferSource(data)!);
  return { iv, ct: new Uint8Array(buf) };
}

export async function aesGcmDecrypt(keyRaw: Uint8Array, iv: Uint8Array, ct: Uint8Array, aad?: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', toBufferSource(keyRaw)!, 'AES-GCM', false, ['decrypt']);
  const params: AesGcmParams = {
    name: 'AES-GCM',
    iv: toBufferSource(iv)!,
    tagLength: 128
  };
  if (aad) {
    params.additionalData = toBufferSource(aad);
  }
  const pt = await crypto.subtle.decrypt(params, key, toBufferSource(ct)!);
  return new Uint8Array(pt);
}

export async function hkdf(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, len = 32) {
  const key = await crypto.subtle.importKey('raw', toBufferSource(ikm)!, { name: 'HKDF' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: toBufferSource(salt), info: toBufferSource(info) },
    key,
    len * 8,
  );
  return new Uint8Array(bits);
}
