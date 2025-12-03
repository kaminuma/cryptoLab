import React, { useEffect } from 'react';
import { EnigmaSimulator } from '../enigma/ui/EnigmaSimulator';
import { Link } from 'react-router-dom';

const EnigmaPage: React.FC = () => {
    useEffect(() => {
        document.title = 'Enigma Simulator - CryptoLab';
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a1a] relative">
            <Link
                to="/labs"
                className="absolute top-4 left-4 text-gray-500 hover:text-[#d4af37] transition-colors z-50 flex items-center gap-2 no-underline"
                style={{ textDecoration: 'none' }}
            >
                ← Back to Labs
            </Link>
            <EnigmaSimulator />
        </div>
    );
};

export default EnigmaPage;
