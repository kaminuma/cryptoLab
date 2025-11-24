import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
    return (
        <div className="flex gap-2 p-4 enigma-panel">
            <button
                onClick={() => onChange(true)}
                className={`
                    flex-1 px-4 py-2 text-sm font-medium rounded transition-all duration-200
                    ${checked
                        ? 'bg-[var(--enigma-accent)] text-black border-2 border-[var(--enigma-accent)] shadow-[0_0_10px_var(--enigma-glow)]'
                        : 'bg-[rgba(212,175,55,0.2)] text-[var(--enigma-accent)] border-2 border-[var(--enigma-accent)] hover:bg-[var(--enigma-accent)] hover:text-black'
                    }
                `}
            >
                実機モード
            </button>
            <button
                onClick={() => onChange(false)}
                className={`
                    flex-1 px-4 py-2 text-sm font-medium rounded transition-all duration-200
                    ${!checked
                        ? 'bg-[var(--enigma-accent)] text-black border-2 border-[var(--enigma-accent)] shadow-[0_0_10px_var(--enigma-glow)]'
                        : 'bg-[rgba(212,175,55,0.2)] text-[var(--enigma-accent)] border-2 border-[var(--enigma-accent)] hover:bg-[var(--enigma-accent)] hover:text-black'
                    }
                `}
            >
                一括変換
            </button>
        </div>
    );
};
