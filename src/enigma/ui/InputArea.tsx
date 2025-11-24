import React from 'react';
import './enigma.css';

interface InputAreaProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange, label = "Input", placeholder = "TYPE MESSAGE HERE..." }) => {
    return (
        <div className="enigma-panel flex-1">
            <div className="enigma-title">{label}</div>
            <textarea
                className="io-area"
                value={value}
                onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder={placeholder}
            />
        </div>
    );
};
