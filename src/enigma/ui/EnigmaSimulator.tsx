import React, { useState, useEffect } from 'react';
import { EnigmaMachine } from '../core/enigmaEngine';
import modelsData from '../data/models.json';
import { ModelSelector } from './ModelSelector';
import { RotorConfig } from './RotorConfig';
import { Plugboard } from './Plugboard';
import { Keyboard } from './Keyboard';
import { InputArea } from './InputArea';
import { OutputArea } from './OutputArea';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { EnigmaManual } from './EnigmaManual';
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

    // Realism Mode State
    const [isRealismMode, setIsRealismMode] = useState(false);

    // Manual Modal State
    const [isManualOpen, setIsManualOpen] = useState(false);

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

    // Batch processing for Input Area (Only in Batch Mode)
    useEffect(() => {
        if (isRealismMode) return; // Skip batch processing in Realism Mode

        if (!inputText) {
            setOutputText("");
            return;
        }

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

    }, [inputText, model, rotors, reflector, ringSettings, positions, plugboard, isRealismMode]);

    // Clear IO when switching modes
    useEffect(() => {
        setInputText("");
        setOutputText("");
    }, [isRealismMode]);

    // Interactive Key Press
    const handleKeyDown = (char: string) => {
        if (isRealismMode) {
            // Realism Mode: Step rotors and update state
            const machine = new EnigmaMachine(
                model,
                [...rotors],
                reflector,
                [...ringSettings],
                [...positions], // Current positions
                { ...plugboard }
            );

            const encoded = machine.encodeChar(char);

            // Update UI state
            setActiveLamp(encoded);
            setPositions(machine.positions); // Update rotor positions!
            setInputText(prev => prev + char);
            setOutputText(prev => prev + encoded);

        } else {
            // Batch Mode: Just append to input, useEffect handles the rest
            setInputText(prev => prev + char);

            // Visual feedback (lamp) simulation for Batch Mode
            const machine = new EnigmaMachine(
                model,
                [...rotors],
                reflector,
                [...ringSettings],
                [...positions],
                { ...plugboard }
            );

            // Fast forward to current input length
            for (let i = 0; i < inputText.length; i++) {
                machine.encodeChar(inputText[i]);
            }

            const encoded = machine.encodeChar(char);
            setActiveLamp(encoded);
        }
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
            <EnigmaManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />

            <div className="text-center relative">
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

                <button
                    onClick={() => setIsManualOpen(true)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs enigma-btn px-4 py-2 transition-all hover:scale-105"
                >
                    仕様書 (Specs)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
                {/* Left Column: Settings */}
                <div className="flex flex-col gap-4">
                    <div className="enigma-panel">
                        <div className="enigma-title">Operation Mode</div>
                        <ToggleSwitch
                            checked={isRealismMode}
                            onChange={setIsRealismMode}
                        />
                    </div>
                    <div className="enigma-panel px-4 pb-4 pt-3">
                        <div className="text-xs leading-relaxed">
                            {isRealismMode ? (
                                <p className="text-gray-200">
                                    <span className="text-indigo-400 font-bold">実機モード:</span> キーを打つたびにローターが回転します。実機の操作感を体験できます。（コピペ入力不可）
                                </p>
                            ) : (
                                <p className="text-gray-200">
                                    <span className="text-enigma-accent font-bold">一括変換モード:</span> 長文をコピペして瞬時に変換できます。ローター設定は固定されます。
                                </p>
                            )}
                        </div>
                    </div>

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
                        {isRealismMode ? (
                            <div className="w-full flex flex-col gap-2">
                                <div className="bg-gray-900 p-4 rounded border border-gray-700 h-32 overflow-y-auto font-mono text-sm text-gray-300">
                                    <div className="text-xs text-gray-500 mb-1">入力ログ (Log)</div>
                                    {inputText || <span className="text-gray-600 italic">キーボードで入力してください...</span>}
                                </div>
                                <OutputArea value={outputText} label="出力 (Output)" placeholder="変換結果..." />
                            </div>
                        ) : (
                            <>
                                <InputArea
                                    value={inputText}
                                    onChange={setInputText}
                                    label="入力 (Input)"
                                    placeholder="ここにメッセージを入力..."
                                />
                                <OutputArea value={outputText} label="出力 (Output)" placeholder="変換結果..." />
                            </>
                        )}
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

