import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/learn', label: 'Learn' },
  { to: '/labs', label: 'Lab' },
  { to: '/hash', label: 'Hash' },
  { to: '/aes', label: 'AES' },
  { to: '/rsa', label: 'RSA' },
  { to: '/pqc', label: 'PQC' },
]

const toolsLinks = [
  { to: '/tools/convert', label: 'Convert' },
  { to: '/tools/hash-cracker', label: 'Hash Cracker' },
]

export default function NavBar() {
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="nav-brand" onClick={closeMenu}>
          <span className="logo-dot" />
          <span className="brand-title">CryptoLab</span>
        </NavLink>

        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Tools Dropdown */}
          <div className="nav-dropdown">
            <span className="nav-link nav-dropdown-trigger">
              Tools <span style={{ fontSize: '0.8em' }}>▼</span>
            </span>
            <div className="nav-dropdown-menu">
              {toolsLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-dropdown-item${isActive ? ' active' : ''}`}
                  onClick={() => {
                    closeMenu()
                    setShowToolsDropdown(false)
                  }}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
