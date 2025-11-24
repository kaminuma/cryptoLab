import rotorsData from '../data/rotors.json';
import reflectorsData from '../data/reflectors.json';
import { applyPlugboard } from './plugboard';
import { stepStandard, stepNavy, stepTirpitz, stepCustom } from './stepping';
import modelsData from '../data/models.json';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class EnigmaMachine {
    model: string;
    rotors: any[];
    reflector: string;
    ringSettings: string[];
    positions: string[];
    plugboard: Record<string, string>;

    constructor(
        model: string,
        rotors: string[],
        reflector: string,
        ringSettings: string[],
        positions: string[],
        plugboard: Record<string, string>
    ) {
        this.model = model;
        this.rotors = rotors.map((id, index) => ({
            id,
            position: positions[index],
            ringSetting: ringSettings[index]
        }));
        this.reflector = reflector;
        this.ringSettings = ringSettings;
        this.positions = positions;
        this.plugboard = plugboard;
    }

    stepRotors() {
        // Look up stepping mode from models.json
        const modelConfig = modelsData[this.model as keyof typeof modelsData];
        const steppingMode = modelConfig ? modelConfig.steppingMode : "STANDARD";

        let newRotors;
        switch (steppingMode) {
            case "NAVY":
                newRotors = stepNavy(this.rotors);
                break;
            case "TIRPITZ":
                newRotors = stepTirpitz(this.rotors);
                break;
            case "CUSTOM":
            case "FIXED":
                newRotors = stepCustom(this.rotors);
                break;
            case "STANDARD":
            default:
                newRotors = stepStandard(this.rotors);
                break;
        }
        this.rotors = newRotors;
        this.positions = this.rotors.map(r => r.position);
    }

    encodeChar(ch: string): string {
        // console.log(`Encoding ${ch}`);
        // 1. Plugboard
        let current = applyPlugboard(ch, this.plugboard);
        // console.log(`Plugboard: ${ch} -> ${current}`);

        // 2. Step Rotors
        this.stepRotors();
        // console.log(`Rotors stepped: ${this.positions.join(',')}`);

        // 3. Forward Pass (Right to Left)
        for (let i = this.rotors.length - 1; i >= 0; i--) {
            const before = current;
            current = this.forwardPass(current, i);
            // console.log(`Rotor ${i} (${this.rotors[i].id}) Forward: ${before} -> ${current}`);
        }

        // 4. Reflector
        const beforeRef = current;
        current = this.reflect(current);
        // console.log(`Reflector (${this.reflector}): ${beforeRef} -> ${current}`);

        // 5. Backward Pass (Left to Right)
        for (let i = 0; i < this.rotors.length; i++) {
            const before = current;
            current = this.backwardPass(current, i);
            // console.log(`Rotor ${i} (${this.rotors[i].id}) Backward: ${before} -> ${current}`);
        }

        // 6. Plugboard
        const beforePlug = current;
        current = applyPlugboard(current, this.plugboard);
        // console.log(`Plugboard Out: ${beforePlug} -> ${current}`);

        return current;
    }

    // Helper to get numeric value (0-25)
    toIndex(char: string): number {
        return ALPHABET.indexOf(char);
    }

    // Helper to get char from index
    toChar(index: number): string {
        return ALPHABET[(index + 26) % 26];
    }

    forwardPass(char: string, rotorIndex: number): string {
        const rotorState = this.rotors[rotorIndex];
        const rotorData = rotorsData[rotorState.id as keyof typeof rotorsData];

        const posOffset = this.toIndex(rotorState.position);
        const ringOffset = this.toIndex(rotorState.ringSetting);

        // Input index relative to rotor wiring
        // offset = pos - ring
        const offset = posOffset - ringOffset;

        const inputIdx = this.toIndex(char);
        // Enter rotor at (input + offset)
        const enterIdx = (inputIdx + offset + 26) % 26;

        // Map through wiring
        const wiringChar = rotorData.wiring[enterIdx];
        const wiringOutIdx = this.toIndex(wiringChar);

        // Exit rotor at (output - offset)
        const exitIdx = (wiringOutIdx - offset + 26) % 26;

        return this.toChar(exitIdx);
    }

    backwardPass(char: string, rotorIndex: number): string {
        const rotorState = this.rotors[rotorIndex];
        const rotorData = rotorsData[rotorState.id as keyof typeof rotorsData];

        const posOffset = this.toIndex(rotorState.position);
        const ringOffset = this.toIndex(rotorState.ringSetting);

        const offset = posOffset - ringOffset;

        const inputIdx = this.toIndex(char);
        const enterIdx = (inputIdx + offset + 26) % 26;

        // Inverse mapping
        // Find index where wiring[index] == enterChar
        const enterChar = this.toChar(enterIdx);
        const wiringInIdx = rotorData.wiring.indexOf(enterChar);

        const exitIdx = (wiringInIdx - offset + 26) % 26;

        return this.toChar(exitIdx);
    }

    reflect(char: string): string {
        const reflectorData = reflectorsData[this.reflector as keyof typeof reflectorsData];
        const idx = this.toIndex(char);
        return reflectorData[idx];
    }
}
