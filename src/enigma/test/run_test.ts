import { EnigmaMachine } from '../core/enigmaEngine';

const testCase = {
    "model": "Enigma-I",
    "rotors": ["I", "II", "III"],
    "rings": ["A", "A", "A"],
    "positions": ["A", "A", "A"],
    "plugboard": { "A": "B" },
    "input": "HELLOWORLD",
    "expected": "ILADBBMTBZ"
};

function runTest() {
    console.log("Running Enigma Test Case...");

    const machine = new EnigmaMachine(
        testCase.model,
        testCase.rotors,
        "B", // Spec didn't specify reflector for test, assuming B as it's standard for I
        testCase.rings,
        testCase.positions,
        testCase.plugboard
    );

    let output = "";
    for (const char of testCase.input) {
        output += machine.encodeChar(char);
    }

    console.log(`Input:    ${testCase.input}`);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Actual:   ${output}`);

    if (output === testCase.expected) {
        console.log("✅ TEST PASSED");
        process.exit(0);
    } else {
        console.error("❌ TEST FAILED");
        process.exit(1);
    }
}

runTest();
