import React, { useEffect } from 'react';
import { EnigmaSimulator } from '../enigma/ui/EnigmaSimulator';
import { Link } from 'react-router-dom';

const EnigmaPage: React.FC = () => {
    useEffect(() => {
        document.title = 'Enigma Simulator - CryptoLab';
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.setAttribute('data-theme', 'classic');
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, []);

    return (
        <div className="page enigma-page" style={{ position: 'relative', minHeight: '100vh' }}>
            <Link
                to="/labs"
                className="btn btn-secondary"
                style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, padding: '8px 16px' }}
            >
                ← Back to Labs
            </Link>
            <EnigmaSimulator />
        </div>
    );
};

export default EnigmaPage;
