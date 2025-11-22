import React from 'react';
import './enigma.css';

interface InputAreaProps {
    value: string;
    onChange: (value: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange }) => {
    return (
        <div className="enigma-panel flex-1">
            <div className="enigma-title">Input</div>
            <textarea
                className="io-area"
                value={value}
                onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="TYPE MESSAGE HERE..."
            />
        </div>
    );
};
