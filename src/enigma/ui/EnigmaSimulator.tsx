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

            <div className="enigma-header">
                <div className="enigma-header-content">
                    <h1 className="enigma-main-title">ENIGMA</h1>
                    <div className="enigma-subtitle">CIPHER MACHINE SIMULATOR</div>
                </div>
                <button
                    onClick={() => setIsManualOpen(true)}
                    className="enigma-btn enigma-specs-btn"
                >
                    仕様書 (Specs)
                </button>
            </div>

            <div className="enigma-main-grid">
                {/* Left Column: Settings */}
                <div className="enigma-settings-col">
                    <div className="enigma-panel">
                        <div className="enigma-title">Operation Mode</div>
                        <ToggleSwitch
                            checked={isRealismMode}
                            onChange={setIsRealismMode}
                        />
                    </div>
                    <div className="enigma-panel enigma-mode-desc">
                        <div className="enigma-mode-text">
                            {isRealismMode ? (
                                <p>
                                    <span className="enigma-mode-label realism">実機モード:</span> キーを打つたびにローターが回転します。実機の操作感を体験できます。（コピペ入力不可）
                                </p>
                            ) : (
                                <p>
                                    <span className="enigma-mode-label batch">一括変換モード:</span> 長文をコピペして瞬時に変換できます。ローター設定は固定されます。
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
                <div className="enigma-keyboard-col">
                    <Keyboard
                        activeLamp={activeLamp}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                    />
                </div>

                {/* Right Column: IO & Plugboard */}
                <div className="enigma-io-col">
                    <div className="enigma-io-wrapper">
                        {isRealismMode ? (
                            <div className="enigma-io-stack">
                                <div className="enigma-log-area">
                                    <div className="enigma-log-label">入力ログ (Log)</div>
                                    <div className="enigma-log-content">
                                        {inputText || <span className="enigma-log-placeholder">キーボードで入力してください...</span>}
                                    </div>
                                </div>
                                <OutputArea value={outputText} label="出力 (Output)" placeholder="変換結果..." />
                            </div>
                        ) : (
                            <div className="enigma-io-side-by-side">
                                <InputArea
                                    value={inputText}
                                    onChange={setInputText}
                                    label="入力 (Input)"
                                    placeholder="ここにメッセージを入力..."
                                />
                                <OutputArea value={outputText} label="出力 (Output)" placeholder="変換結果..." />
                            </div>
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

