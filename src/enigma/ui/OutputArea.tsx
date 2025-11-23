import React from 'react';
import './enigma.css';

interface OutputAreaProps {
    value: string;
}

export const OutputArea: React.FC<OutputAreaProps> = ({ value }) => {
    return (
        <div className="enigma-panel flex-1">
            <div className="enigma-title">Output</div>
            <textarea
                className="io-area"
                value={value}
                readOnly
                placeholder="ENCODED MESSAGE..."
            />
        </div>
    );
};
