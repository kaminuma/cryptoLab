import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/labs', label: 'Lab' },
  { to: '/learn', label: 'Learn' },
  { to: '/rsa', label: 'RSA' },
  { to: '/pqc', label: 'PQC' },
  { to: '/tools', label: 'Tools' },
]

export default function NavBar() {
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
