import { EnigmaMachine } from '../core/enigmaEngine';

const testVector = {
    name: "Enigma Instruction Manual 1930",
    model: "Enigma-I",
    rotors: ["II", "I", "III"], // Wheel Order: II I III
    reflector: "A",
    rings: ["X", "M", "V"], // 24 13 22 -> X M V (Assuming A=1)
    positions: ["A", "B", "L"], // Message Key: ABL
    plugboard: {
        "A": "M", "F": "I", "N": "V", "P": "S", "T": "U", "W": "Z"
    },
    ciphertext: "GCDSEAHUGWTQGRKVLFGXUCALXVYMIGMMNMFDXTGNVHVRMMEVOUYFZSLRHDRRXFJWCFHUHMUNZEFRDISIKBGPMYVXUZ"
};

function runVerification() {
    console.log(`Running Verification: ${testVector.name}`);

    // Setup Plugboard (Bidirectional)
    const plugs: Record<string, string> = {};
    Object.entries(testVector.plugboard).forEach(([k, v]) => {
        plugs[k] = v;
        plugs[v] = k;
    });

    const machine = new EnigmaMachine(
        testVector.model,
        testVector.rotors,
        testVector.reflector,
        testVector.rings,
        testVector.positions,
        plugs
    );

    let plaintext = "";
    for (const char of testVector.ciphertext) {
        plaintext += machine.encodeChar(char);
    }

    console.log(`Ciphertext: ${testVector.ciphertext}`);
    console.log(`Plaintext:  ${plaintext}`);

    // Expected plaintext fragment (from common knowledge of this vector):
    // "FEINDLIQEINFANTERIEKOLONNE..." (Feindliche Infanteriekolonne...)
    // Note: 'CH' is often replaced by 'Q' or 'J' in Enigma messages.

    if (plaintext.includes("FEIND")) {
        console.log("✅ VERIFICATION PASSED: Decrypted text contains expected German words.");
    } else {
        console.error("❌ VERIFICATION FAILED: Decrypted text does not look like German.");
    }
}

runVerification();
