import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/learn', label: 'Learn' },
  { to: '/labs', label: 'Lab' },
  { to: '/hash', label: 'Hash' },
  { to: '/rsa', label: 'RSA' },
  { to: '/aes', label: 'AES' },
  { to: '/pqc', label: 'PQC' },
]

const toolsLinks = [
  { to: '/tools/convert', label: 'Convert' },
  { to: '/tools/hash-cracker', label: 'Hash Cracker' },
]

export default function NavBar() {
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)

  return (
    <header className="navbar">
      <div className="nav-brand">
        <span className="logo-dot" />
        <span className="brand-title">CryptoLab</span>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {link.label}
          </NavLink>
        ))}

        {/* Tools Dropdown */}
        <div
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => setShowToolsDropdown(true)}
          onMouseLeave={() => setShowToolsDropdown(false)}
        >
          <span className="nav-link" style={{ cursor: 'pointer' }}>
            Tools ▾
          </span>
          {showToolsDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '150px',
              zIndex: 1000
            }}>
              {toolsLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    color: '#0f172a',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <a
          className="nav-link external"
          href="https://github.com/kaminuma/quantum-rsa-lab"
          target="_blank"
          rel="noreferrer"
        >
          Quantum RSA Lab
        </a>
      </nav>
    </header>
  )
}
