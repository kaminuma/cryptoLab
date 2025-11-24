import React from 'react';
import './enigma.css';

interface OutputAreaProps {
    value: string;
    label?: string;
    placeholder?: string;
}

export const OutputArea: React.FC<OutputAreaProps> = ({ value, label = "Output", placeholder = "ENCODED MESSAGE..." }) => {
    return (
        <div className="enigma-panel flex-1">
            <div className="enigma-title">{label}</div>
            <textarea
                className="io-area"
                value={value}
                readOnly
                placeholder={placeholder}
            />
        </div>
    );
};
