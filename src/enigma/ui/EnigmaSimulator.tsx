import React, { useState, useEffect } from 'react';
import { EnigmaMachine } from '../core/enigmaEngine';
import modelsData from '../data/models.json';
import { ModelSelector } from './ModelSelector';
import { RotorConfig } from './RotorConfig';
import { Plugboard } from './Plugboard';
import { Keyboard } from './Keyboard';
import { InputArea } from './InputArea';
import { OutputArea } from './OutputArea';
import './enigma.css';

const DEFAULT_MODEL = "Enigma-I";

export const EnigmaSimulator: React.FC = () => {
    // State
    const [model, setModel] = useState(DEFAULT_MODEL);
    const [rotors, setRotors] = useState<string[]>(["I", "II", "III"]);
    const [reflector, setReflector] = useState("B");
    const [ringSettings, setRingSettings] = useState<string[]>(["A", "A", "A"]);
    const [positions, setPositions] = useState<string[]>(["A", "A", "A"]);
    const [plugboard, setPlugboard] = useState<Record<string, string>>({});

    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [activeLamp, setActiveLamp] = useState<string | null>(null);

    // Handle Model Change
    const handleModelChange = (newModel: string) => {
        const config = modelsData[newModel as keyof typeof modelsData];
        setModel(newModel);

        // Reset rotors to defaults for the model
        const defaultRotors = config.availableRotors.slice(0, config.rotorCount);
        // Ensure we have enough rotors
        while (defaultRotors.length < config.rotorCount) {
            defaultRotors.push(config.availableRotors[0]);
        }
        setRotors(defaultRotors);

        // Reset settings
        setRingSettings(Array(config.rotorCount).fill("A"));
        setPositions(Array(config.rotorCount).fill("A"));

        // Reset reflector if current not available
        if (!config.availableReflectors.includes(reflector)) {
            setReflector(config.availableReflectors[0]);
        }

        // Clear plugboard if not supported
        if (!config.hasPlugboard) {
            setPlugboard({});
        }
    };

    // Batch processing for Input Area
    useEffect(() => {
        if (!inputText) {
            setOutputText("");
            return;
        }

        // Re-instantiate machine to process whole string from current settings?
        // No, usually input area implies "typing these keys".
        // But if we type in the box, we want to see the result of the whole string.
        // HOWEVER, Enigma is stateful. If we type "HELL", the rotors move.
        // If we then type "O", they move again.
        // If we backspace, we can't easily "undo" rotor movement without resetting or reversing.
        // For a simulator, usually "Input Area" resets the machine to the configured start settings and processes the whole string.

        const machine = new EnigmaMachine(
            model,
            [...rotors],
            reflector,
            [...ringSettings],
            [...positions], // Initial positions
            { ...plugboard }
        );

        let out = "";
        for (const char of inputText) {
            out += machine.encodeChar(char);
        }
        setOutputText(out);

        // Note: We do NOT update 'positions' state here, because that would sync the UI rotors to the end of the message,
        // making it hard to edit the message (as the start state would be lost or we'd need separate "start" and "current" states).
        // Usually, "Rotor Config" sets the START positions.
        // The "Current Position" could be shown elsewhere, or we just assume the config is the start state.

    }, [inputText, model, rotors, reflector, ringSettings, positions, plugboard]);

    // Interactive Key Press
    const handleKeyDown = (char: string) => {
        // Create a temporary machine state from current "visual" positions?
        // Or do we want the keyboard to update the "Start Positions"?
        // Usually interactive mode updates the positions permanently.
        // But that conflicts with the "Input Area" batch mode.

        // Let's support interactive mode separately or just let it update the positions state.
        // If we update positions state, the Input Area would re-process with NEW start positions, which is wrong.

        // COMPROMISE:
        // Keyboard clicks are for "Interactive Mode". They update the positions state and append to Input/Output.
        // Editing Input Area is "Batch Mode". It uses the current positions as START positions.

        // Actually, let's just have the keyboard append to inputText.
        // Then the useEffect triggers and re-calculates everything.
        // This is the most consistent way.

        setInputText(prev => prev + char);

        // Calculate just this char for the lamp (visual feedback)
        // We need to know the state *before* this char was added to calculate the lamp.
        // But since we are using batch processing in useEffect, we can just simulate it.

        // To get the lamp for THIS key press, we need to run the machine up to this point.
        const machine = new EnigmaMachine(
            model,
            [...rotors],
            reflector,
            [...ringSettings],
            [...positions],
            { ...plugboard }
        );

        // Fast forward to current input length
        // (This is inefficient for long strings but fine for <1000 chars)
        for (let i = 0; i < inputText.length; i++) {
            machine.encodeChar(inputText[i]);
        }

        // Now encode the new char
        const encoded = machine.encodeChar(char);
        setActiveLamp(encoded);
    };

    const handleKeyUp = () => {
        setActiveLamp(null);
    };

    const handlePlugboardConnect = (a: string, b: string) => {
        setPlugboard(prev => ({
            ...prev,
            [a]: b,
            [b]: a
        }));
    };

    const handlePlugboardDisconnect = (a: string) => {
        const b = plugboard[a];
        if (!b) return;
        const newPb = { ...plugboard };
        delete newPb[a];
        delete newPb[b];
        setPlugboard(newPb);
    };

    const modelConfig = modelsData[model as keyof typeof modelsData];

    return (
        <div className="enigma-container">
            <div className="text-center">
                <h1
                    className="text-4xl font-bold mb-2 tracking-widest"
                    style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                    ENIGMA
                </h1>
                <div
                    className="text-xs tracking-[0.5em]"
                    style={{ color: '#b0b0b0', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                >
                    CIPHER MACHINE SIMULATOR
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
                {/* Left Column: Settings */}
                <div className="flex flex-col gap-4">
                    <ModelSelector selectedModel={model} onSelectModel={handleModelChange} />
                    <RotorConfig
                        model={model}
                        rotors={rotors}
                        reflector={reflector}
                        ringSettings={ringSettings}
                        positions={positions}
                        onUpdateRotors={setRotors}
                        onUpdateReflector={setReflector}
                        onUpdateRings={setRingSettings}
                        onUpdatePositions={setPositions}
                    />
                </div>

                {/* Middle Column: Keyboard & Lampboard */}
                <div className="flex flex-col gap-4">
                    <Keyboard
                        activeLamp={activeLamp}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                    />
                </div>

                {/* Right Column: IO & Plugboard */}
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <InputArea value={inputText} onChange={setInputText} />
                        <OutputArea value={outputText} />
                    </div>

                    {modelConfig.hasPlugboard && (
                        <Plugboard
                            connections={plugboard}
                            onConnect={handlePlugboardConnect}
                            onDisconnect={handlePlugboardDisconnect}
                            visible={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
