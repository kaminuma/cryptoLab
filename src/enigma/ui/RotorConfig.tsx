import React from 'react';
import modelsData from '../data/models.json';
import './enigma.css';

interface RotorConfigProps {
    model: string;
    rotors: string[];
    reflector: string;
    ringSettings: string[];
    positions: string[];
    onUpdateRotors: (rotors: string[]) => void;
    onUpdateReflector: (reflector: string) => void;
    onUpdateRings: (rings: string[]) => void;
    onUpdatePositions: (positions: string[]) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const RotorConfig: React.FC<RotorConfigProps> = ({
    model,
    rotors,
    reflector,
    ringSettings,
    positions,
    onUpdateRotors,
    onUpdateReflector,
    onUpdateRings,
    onUpdatePositions
}) => {
    const modelConfig = modelsData[model as keyof typeof modelsData];
    const availableRotors = modelConfig.availableRotors;
    const availableReflectors = modelConfig.availableReflectors;

    const handleRotorChange = (index: number, value: string) => {
        const newRotors = [...rotors];
        newRotors[index] = value;
        onUpdateRotors(newRotors);
    };

    const handleRingChange = (index: number, value: string) => {
        const newRings = [...ringSettings];
        newRings[index] = value;
        onUpdateRings(newRings);
    };

    const handlePosChange = (index: number, value: string) => {
        const newPositions = [...positions];
        newPositions[index] = value;
        onUpdatePositions(newPositions);
    };

    return (
        <div className="enigma-panel">
            <div className="enigma-title">Rotor Configuration</div>

            <div className="mb-4">
                <label className="block mb-2 text-sm">Reflector</label>
                <select
                    className="enigma-select"
                    value={reflector}
                    onChange={(e) => onUpdateReflector(e.target.value)}
                >
                    {availableReflectors.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            <div className="rotor-group">
                {rotors.map((rotor, index) => (
                    <div key={index} className="rotor-unit">
                        <div className="text-xs text-gray-400">Slot {index + 1}</div>

                        {/* Rotor Selection */}
                        <select
                            className="enigma-select"
                            value={rotor}
                            onChange={(e) => handleRotorChange(index, e.target.value)}
                        >
                            {availableRotors.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>

                        {/* Ring Setting */}
                        <div className="flex flex-col items-center">
                            <label className="text-xs text-gray-500">Ring</label>
                            <select
                                className="enigma-select text-xs"
                                value={ringSettings[index]}
                                onChange={(e) => handleRingChange(index, e.target.value)}
                            >
                                {ALPHABET.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>

                        {/* Position (The Window) */}
                        <div className="flex flex-col items-center mt-2 w-full">
                            <label className="text-xs text-gray-500 mb-1">Position</label>
                            <div className="rotor-stack">
                                <button
                                    className="enigma-btn rotor-btn-vertical"
                                    onClick={() => {
                                        const currentIdx = ALPHABET.indexOf(positions[index]);
                                        const prev = ALPHABET[(currentIdx - 1 + 26) % 26];
                                        handlePosChange(index, prev);
                                    }}
                                >-</button>
                                <div className="rotor-window">{positions[index]}</div>
                                <button
                                    className="enigma-btn rotor-btn-vertical"
                                    onClick={() => {
                                        const currentIdx = ALPHABET.indexOf(positions[index]);
                                        const next = ALPHABET[(currentIdx + 1) % 26];
                                        handlePosChange(index, next);
                                    }}
                                >+</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
