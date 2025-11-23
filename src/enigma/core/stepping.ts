import rotorsData from '../data/rotors.json';

type RotorId = keyof typeof rotorsData;

interface RotorState {
    id: RotorId;
    position: string; // Current letter visible (e.g., "A")
    ringSetting: string; // Ring setting letter (e.g., "A")
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function isNotchAt(rotorId: RotorId, position: string): boolean {
    const rotor = rotorsData[rotorId];
    return (rotor.notch as string[]).includes(position);
}

function rotate(char: string): string {
    const idx = ALPHABET.indexOf(char);
    return ALPHABET[(idx + 1) % 26];
}

// Standard Enigma I Double Stepping
export function stepStandard(rotors: RotorState[]): RotorState[] {
    const [left, mid, right] = rotors;

    // Check notch positions BEFORE stepping
    const rightNotch = isNotchAt(right.id, right.position);
    const midNotch = isNotchAt(mid.id, mid.position);

    // Right rotor always steps
    let stepMid = false;
    let stepLeft = false;

    // Double stepping mechanism:
    // 1. If right rotor is at notch, middle rotor will step
    // 2. If middle rotor is at notch, BOTH middle and left step (double stepping anomaly)
    if (midNotch) {
        // Middle rotor at notch: step both middle and left
        stepMid = true;
        stepLeft = true;
    } else if (rightNotch) {
        // Only right at notch: step middle
        stepMid = true;
    }

    const newRightPos = rotate(right.position);
    const newMidPos = stepMid ? rotate(mid.position) : mid.position;
    const newLeftPos = stepLeft ? rotate(left.position) : left.position;

    return [
        { ...left, position: newLeftPos },
        { ...mid, position: newMidPos },
        { ...right, position: newRightPos }
    ];
}

// Navy (M3/M4)
// M3 is same as Standard.
// M4 has 4 rotors. The 4th (leftmost) never steps. The other 3 behave like Standard.
export function stepNavy(rotors: RotorState[]): RotorState[] {
    if (rotors.length === 4) {
        const [fourth, left, mid, right] = rotors;
        // Apply standard stepping to the rightmost 3 rotors
        const stepped3 = stepStandard([left, mid, right]);
        return [fourth, ...stepped3];
    } else {
        return stepStandard(rotors);
    }
}

// Tirpitz (Enigma G) - Gear Driven / Odometer (No double stepping)
export function stepTirpitz(rotors: RotorState[]): RotorState[] {
    // Enigma G usually has a gear mechanism.
    // Right always steps.
    // If Right notches, Mid steps.
    // If Mid notches AND Right notches, Left steps? 
    // Actually, strictly odometer:
    // Right steps.
    // If Right moves from Notch -> Next, Mid steps.
    // If Mid moves from Notch -> Next, Left steps.

    // However, for character-by-character simulation, we check the state *before* stepping.

    const [left, mid, right] = rotors;

    const rightNotch = isNotchAt(right.id, right.position);
    const midNotch = isNotchAt(mid.id, mid.position);

    const stepRight = true;
    const stepMid = rightNotch;
    const stepLeft = midNotch && rightNotch; // Standard odometer carry?
    // Wait, standard odometer: 09 -> 10. The 1 moves when 9->0.
    // So Mid steps when Right passes notch.
    // Left steps when Mid passes notch.
    // But does Left step only when Mid *moves*? Yes.
    // So Left steps if Mid is stepping AND Mid is at notch.

    const newRightPos = rotate(right.position);
    const newMidPos = stepMid ? rotate(mid.position) : mid.position;
    const newLeftPos = (stepMid && midNotch) ? rotate(left.position) : left.position;

    return [
        { ...left, position: newLeftPos },
        { ...mid, position: newMidPos },
        { ...right, position: newRightPos }
    ];
}

// Custom (Enigma T) - Assumed Odometer / Single Stepping
export function stepCustom(rotors: RotorState[]): RotorState[] {
    // Similar to Tirpitz/Commercial for this simulation context
    return stepTirpitz(rotors);
}
