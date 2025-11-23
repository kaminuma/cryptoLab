export function applyPlugboard(ch: string, mapping: Record<string, string>): string {
    return mapping[ch] ?? ch;
}
