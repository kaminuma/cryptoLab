export function applyPlugboard(ch: string, mapping: Record<string, string>): string {
    if (mapping[ch]) return mapping[ch];
    const entry = Object.entries(mapping).find(([_, value]) => value === ch);
    if (entry) return entry[0];
    return ch;
}
