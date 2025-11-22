import React, { useState } from 'react';
import './enigma.css';

interface PlugboardProps {
    connections: Record<string, string>;
    onConnect: (a: string, b: string) => void;
    onDisconnect: (a: string) => void;
    visible: boolean;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const Plugboard: React.FC<PlugboardProps> = ({ connections, onConnect, onDisconnect, visible }) => {
    const [selected, setSelected] = useState<string | null>(null);

    if (!visible) return null;

    const handleClick = (char: string) => {
        // If already connected, disconnect
        if (connections[char]) {
            onDisconnect(char);
            setSelected(null);
            return;
        }

        // If selecting first plug
        if (!selected) {
            setSelected(char);
        } else {
            // Connecting to second plug
            if (selected === char) {
                setSelected(null); // Cancel
            } else {
                onConnect(selected, char);
                setSelected(null);
            }
        }
    };

    return (
        <div className="enigma-panel">
            <div className="enigma-title">Plugboard</div>
            <div className="plugboard-grid">
                {ALPHABET.map(char => {
                    const isConnected = !!connections[char];
                    const isSelected = selected === char;
                    const connectedTo = connections[char];

                    return (
                        <div
                            key={char}
                            className={`plug-socket ${isConnected ? 'connected' : ''} ${isSelected ? 'selected' : ''}`}
                            style={{
                                borderColor: isSelected ? '#fff' : undefined,
                                background: isSelected ? 'rgba(255,255,255,0.1)' : undefined
                            }}
                            onClick={() => handleClick(char)}
                            title={isConnected ? `Connected to ${connectedTo}` : 'Empty'}
                        >
                            {char}
                            {isConnected && <div className="absolute -bottom-2 text-[10px] text-yellow-500">{connectedTo}</div>}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 text-sm text-gray-400 text-center">
                {selected ? `Select target for ${selected}...` : 'Click a letter to connect/disconnect.'}
            </div>
        </div>
    );
};
