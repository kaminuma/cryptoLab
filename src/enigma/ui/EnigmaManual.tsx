import React from 'react';
import rotorsData from '../data/rotors.json';
import reflectorsData from '../data/reflectors.json';
import './enigma.css';

interface EnigmaManualProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EnigmaManual: React.FC<EnigmaManualProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#0a0a0a]/95 border border-[var(--enigma-accent)]/40 rounded-sm shadow-[0_0_50px_rgba(212,175,55,0.1)] w-full max-w-4xl max-h-[90vh] overflow-y-auto text-gray-100 font-mono backdrop-blur-2xl relative" onClick={e => e.stopPropagation()}>
                {/* Decorative Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--enigma-accent)]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--enigma-accent)]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--enigma-accent)]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--enigma-accent)]"></div>
                {/* Header */}
                <div className="sticky top-0 bg-[#0a0a0a]/90 border-b border-[var(--enigma-accent)]/20 p-5 flex justify-center items-center z-10 backdrop-blur-md">
                    <h2 className="text-2xl font-bold text-white tracking-[0.1em] font-mono" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                        ENIGMA <span className="text-enigma-accent">SPECIFICATIONS</span>
                    </h2>
                </div>

                <div className="p-6 space-y-8">
                    {/* ... content ... */}
                    {/* (Existing content remains unchanged, just showing context) */}

                    {/* ... sections ... */}
                </div>

                <div className="p-4 border-t border-gray-700 text-center">
                    <button
                        onClick={onClose}
                        className="enigma-btn px-8 py-2 text-lg"
                    >
                        閉じる (CLOSE)
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Introduction */}
                    <section>
                        <h3 className="text-sm font-bold text-enigma-accent mb-3 border-b border-[var(--enigma-accent)]/30 pb-1 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--enigma-accent)] rounded-full inline-block"></span>
                            概要 (Overview)
                        </h3>
                        <p className="text-sm leading-relaxed mb-2 text-gray-200">
                            本シミュレータは、第二次世界大戦で使用されたドイツ軍の暗号機「Enigma I」の動作を忠実に再現しています。
                            ローターの配線、ノッチ（回転トリガー）の位置、ダブルステッピング（二重回転）などの機械的挙動は、歴史的な仕様に基づいています。
                        </p>
                    </section>

                    {/* Signal Path */}
                    <section>
                        <h3 className="text-sm font-bold text-enigma-accent mb-3 border-b border-[var(--enigma-accent)]/30 pb-1 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--enigma-accent)] rounded-full inline-block"></span>
                            信号経路 (Signal Path)
                        </h3>
                        <div className="bg-black/40 p-4 rounded border border-[var(--enigma-accent)]/20 text-xs md:text-sm overflow-x-auto shadow-inner relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjEyLCAxNzUsIDU1LCAwLjAxKSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>
                            <code className="whitespace-nowrap text-enigma-accent font-mono tracking-wider relative z-10">
                                [KEYBOARD] → [PLUGBOARD] → [ROTOR III] → [ROTOR II] → [ROTOR I] → [REFLECTOR] → [ROTOR I] → [ROTOR II] → [ROTOR III] → [PLUGBOARD] → [LAMPBOARD]
                            </code>
                        </div>
                        <p className="text-xs text-gray-300 mt-2">
                            ※信号は右端のローター(III)から入り、左端のリフレクターで反射して、再び右端へ戻ってきます。往復で異なる配線を通るため、複雑な暗号化が行われます。
                        </p>
                    </section>

                    {/* Model Specifications */}
                    <section>
                        <h3 className="text-sm font-bold text-enigma-accent mb-3 border-b border-[var(--enigma-accent)]/30 pb-1 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--enigma-accent)] rounded-full inline-block"></span>
                            モデル別仕様 (Model Specifications)
                        </h3>
                        <p className="text-sm mb-4 text-gray-200">
                            本シミュレータは複数のEnigmaモデルをサポートしています。モデルによってローター数や回転挙動が異なります。
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-black/40 text-enigma-accent uppercase text-[10px] tracking-wider border-b border-[var(--enigma-accent)]/20">
                                        <th className="p-2 border border-gray-700">Model</th>
                                        <th className="p-2 border border-gray-700">Description</th>
                                        <th className="p-2 border border-gray-700">Rotors</th>
                                        <th className="p-2 border border-gray-700">Stepping Logic</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-800/50">
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 font-bold text-enigma-accent">Enigma-I</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-gray-200">ドイツ陸・空軍標準モデル</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-center text-gray-200">3</td>
                                        <td className="p-3 text-gray-200">Double Stepping (標準)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-800/50">
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 font-bold text-enigma-accent">M3</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-gray-200">海軍用モデル (初期)</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-center text-gray-200">3</td>
                                        <td className="p-3 text-gray-200">Double Stepping (標準)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-800/50">
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 font-bold text-enigma-accent">M4</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-gray-200">Uボート用モデル</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-center text-gray-200">4</td>
                                        <td className="p-3 text-gray-200">Navy (左端は回転しない)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-800/50">
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 font-bold text-enigma-accent">Commercial</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-gray-200">民間用モデル</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-center text-gray-200">3</td>
                                        <td className="p-3 text-gray-200">Odometer (単純回転)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-800/50">
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 font-bold text-enigma-accent">G / T</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-gray-200">特殊モデル (Abwehr/Tirpitz)</td>
                                        <td className="p-3 border-r border-[var(--enigma-accent)]/10 text-center text-gray-200">3</td>
                                        <td className="p-3 text-gray-200">Gear Driven (ギア駆動)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </section>

                    {/* Rotor Specifications */}
                    <section>
                        <h3 className="text-sm font-bold text-enigma-accent mb-3 border-b border-[var(--enigma-accent)]/30 pb-1 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--enigma-accent)] rounded-full inline-block"></span>
                            ローター仕様 (Rotor Specifications)
                        </h3>
                        <p className="text-sm mb-4 text-gray-200">
                            各ローターは固有の内部配線と「ノッチ（切り欠き）」を持っています。ノッチは隣のローターを回転させるタイミングを決定します。
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-black/40 text-enigma-accent uppercase text-[10px] tracking-wider border-b border-[var(--enigma-accent)]/20">
                                        <th className="p-2 border border-gray-700">Model</th>
                                        <th className="p-2 border border-gray-700">Notch (Turnover)</th>
                                        <th className="p-2 border border-gray-700">Wiring (Input A-Z maps to...)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(rotorsData).map(([key, data]) => (
                                        <tr key={key} className="hover:bg-gray-800/50">
                                            <td className="p-3 border-r border-[var(--enigma-accent)]/10 font-bold text-enigma-accent">{key}</td>
                                            <td className="p-3 border-r border-[var(--enigma-accent)]/10">
                                                {data.notch.map(n => (
                                                    <span key={n} className="inline-block bg-[var(--enigma-accent)]/20 text-enigma-accent px-1.5 py-0.5 rounded mr-1 text-[10px] border border-[var(--enigma-accent)]/30">
                                                        {n} → {String.fromCharCode(n.charCodeAt(0) + 1)}
                                                    </span>
                                                ))}
                                                {data.notch.length === 0 && <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="p-3 font-mono text-gray-300 tracking-[0.15em] text-[10px]">{data.wiring}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Reflector Specifications */}
                    <section>
                        <h3 className="text-sm font-bold text-enigma-accent mb-3 border-b border-[var(--enigma-accent)]/30 pb-1 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--enigma-accent)] rounded-full inline-block"></span>
                            リフレクター仕様 (Reflector Specifications)
                        </h3>
                        <p className="text-sm mb-4 text-gray-200">
                            リフレクターは信号を折り返します。入力された文字を別の文字に変換して送り返すため、Enigmaは「自分自身には変換されない（AはAにならない）」という特性を持ちます。
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-black/40 text-enigma-accent uppercase text-[10px] tracking-wider border-b border-[var(--enigma-accent)]/20">
                                        <th className="p-2 border border-gray-700">Model</th>
                                        <th className="p-2 border border-gray-700">Wiring (Input A-Z maps to...)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(reflectorsData).map(([key, data]) => (
                                        <tr key={key} className="hover:bg-gray-800/50">
                                            <td className="p-3 border-r border-[var(--enigma-accent)]/10 font-bold text-enigma-accent">{key}</td>
                                            <td className="p-3 font-mono text-gray-300 tracking-[0.15em] text-[10px]">{data}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Stepping Logic */}
                    <section>
                        <h3 className="text-sm font-bold text-enigma-accent mb-3 border-b border-[var(--enigma-accent)]/30 pb-1 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--enigma-accent)] rounded-full inline-block"></span>
                            回転ロジック (Stepping Logic)
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p className="text-gray-200">
                                <span className="font-bold text-enigma-accent">1. 基本回転:</span> 右端のローター（Slot 3）は、キーが押されるたびに必ず1目盛り回転します。
                            </p>
                            <p className="text-gray-200">
                                <span className="font-bold text-enigma-accent">2. キャリーオーバー:</span> ローターが「ノッチ」の位置を超えて回転する時、左隣のローターを1目盛り押し進めます。
                                <br />
                                <span className="text-xs text-gray-300 ml-4">例: Rotor III (Notch V) が V から W に動く時、左隣の Rotor II も同時に動きます。</span>
                            </p>
                            <p className="text-gray-200">
                                <span className="font-bold text-enigma-accent">3. ダブルステッピング (Double Stepping):</span> 中央のローター（Slot 2）は、特異な機械的構造により「自分のノッチ位置に来た時」にも回転します。これにより、中央ローターが連続して2回回転する現象（ダブルステップ）が発生します。本シミュレータはこの挙動も再現しています。
                            </p>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-[var(--enigma-accent)]/20 text-center bg-black/20">
                    <button
                        onClick={onClose}
                        className="enigma-btn px-10 py-3 text-lg tracking-[0.2em] hover:scale-105 transform transition-all duration-300"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div >
    );
};
