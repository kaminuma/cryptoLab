export async function ecdhDeriveSecret() {
  const alg = { name: 'ECDH', namedCurve: 'P-256' } as const;
  const alice = await crypto.subtle.generateKey(alg, true, ['deriveBits']);
  const bob = await crypto.subtle.generateKey(alg, true, ['deriveBits']);
  const zab = await crypto.subtle.deriveBits({ name: 'ECDH', public: alice.publicKey }, bob.privateKey, 256);
  const zba = await crypto.subtle.deriveBits({ name: 'ECDH', public: bob.publicKey }, alice.privateKey, 256);
  const za = new Uint8Array(zab);
  const zb = new Uint8Array(zba);
  return { za, zb, alice, bob };
}
