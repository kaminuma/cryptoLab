import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

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
  { to: '/tools/xor', label: 'XOR' },
]

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    if (isMenuOpen) {
      setIsToolsOpen(false)
    }
  }
  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsToolsOpen(false)
  }

  const toggleTools = (e: { preventDefault: () => void }) => {
    // モバイルのみクリックでトグル
    if (window.innerWidth <= 768) {
      e.preventDefault()
      setIsToolsOpen(!isToolsOpen)
    }
  }

  // 画面リサイズ時にモバイルメニューを閉じる
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false)
        setIsToolsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ページ遷移時にテーマをリセット（Enigmaページ以外は通常テーマ）
  useEffect(() => {
    if (!location.pathname.startsWith('/enigma')) {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.removeAttribute('data-subtheme')
    }
  }, [location.pathname])

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

          <div className={`nav-dropdown${isToolsOpen ? ' open' : ''}`}>
            <span
              className="nav-link nav-dropdown-trigger"
              onClick={toggleTools}
              onKeyDown={(e) => e.key === 'Enter' && toggleTools(e)}
              role="button"
              tabIndex={0}
            >
              Tools <span style={{ fontSize: '0.8em' }}>{isToolsOpen ? '▲' : '▼'}</span>
            </span>
            <div className="nav-dropdown-menu">
              {toolsLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-dropdown-item${isActive ? ' active' : ''}`}
                  onClick={closeMenu}
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
