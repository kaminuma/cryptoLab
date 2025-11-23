import React from 'react';
import modelsData from '../data/models.json';
import './enigma.css';

interface ModelSelectorProps {
    selectedModel: string;
    onSelectModel: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
    const models = Object.keys(modelsData);

    return (
        <div className="enigma-panel">
            <div className="enigma-title">Machine Model</div>
            <div className="flex gap-4 flex-wrap">
                {models.map(model => (
                    <button
                        key={model}
                        className={`enigma-btn ${selectedModel === model ? 'active' : ''}`}
                        style={{
                            background: selectedModel === model ? 'var(--enigma-accent)' : undefined,
                            color: selectedModel === model ? '#000' : undefined
                        }}
                        onClick={() => onSelectModel(model)}
                    >
                        {model}
                    </button>
                ))}
            </div>
            <div className="mt-4 text-sm text-gray-400">
                {/* 選択中モデルの説明文を表示 */}
                {modelsData[selectedModel as keyof typeof modelsData].description && (
                    <div className="mb-1">{modelsData[selectedModel as keyof typeof modelsData].description}</div>
                )}
                Selected: {selectedModel} ({modelsData[selectedModel as keyof typeof modelsData].rotorCount} Rotors)
            </div>
        </div>
    );
};
