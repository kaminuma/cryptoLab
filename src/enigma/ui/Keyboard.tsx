import React from 'react';
import './enigma.css';

interface KeyboardProps {
    activeLamp: string | null;
    onKeyDown: (char: string) => void;
    onKeyUp: (char: string) => void;
}

const KEYS_ROW1 = "QWERTZUIO".split("");
const KEYS_ROW2 = "ASDFGHJK".split("");
const KEYS_ROW3 = "PYXCVBNML".split(""); // Enigma layout often QWERTZ... but let's stick to standard QWERTZ/QWERTY or the specific Enigma layout.
// German Enigma Layout: QWERTZUIO / ASDFGHJK / PYXCVBNML
// Wait, standard German is QWERTZUIOP... Enigma is QWERTZUIO (9) / ASDFGHJK (8) / PYXCVBNML (9). Total 26.

export const Keyboard: React.FC<KeyboardProps> = ({ activeLamp, onKeyDown, onKeyUp }) => {

    const renderRow = (keys: string[], isLamp: boolean) => (
        <div className="keyboard-row">
            {keys.map(char => {
                const isActive = isLamp && activeLamp === char;
                return isLamp ? (
                    <div key={char} className={`lamp ${isActive ? 'active' : ''}`}>
                        {char}
                    </div>
                ) : (
                    <button
                        key={char}
                        className="key"
                        onMouseDown={() => onKeyDown(char)}
                        onMouseUp={() => onKeyUp(char)}
                        onMouseLeave={() => onKeyUp(char)} // Handle drag off
                        onTouchStart={(e) => { e.preventDefault(); onKeyDown(char); }}
                        onTouchEnd={(e) => { e.preventDefault(); onKeyUp(char); }}
                    >
                        {char}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="enigma-panel flex flex-col gap-8">
            {/* Lampboard */}
            <div className="keyboard-layout">
                <div className="text-xs text-gray-500 mb-2 text-center">
                    <span className="block font-bold">LAMPBOARD</span>
                    <span className="text-[10px] opacity-70">出力（点灯のみ）</span>
                </div>
                {renderRow(KEYS_ROW1, true)}
                {renderRow(KEYS_ROW2, true)}
                {renderRow(KEYS_ROW3, true)}
            </div>

            {/* Keyboard */}
            <div className="keyboard-layout">
                <div className="text-xs text-gray-500 mb-2 text-center">
                    <span className="block font-bold">KEYBOARD</span>
                    <span className="text-[10px] opacity-70">入力（クリック可能）</span>
                </div>
                {renderRow(KEYS_ROW1, false)}
                {renderRow(KEYS_ROW2, false)}
                {renderRow(KEYS_ROW3, false)}
            </div>
        </div>
    );
};
