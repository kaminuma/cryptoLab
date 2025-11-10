import { Route, Routes } from 'react-router-dom'
import Footer from '@/components/Footer'
import NavBar from '@/components/NavBar'
import Home from '@/pages/Home'
import Labs from '@/pages/Labs'
import Learn from '@/pages/Learn'
import PQC from '@/pages/PQC'
import RSAPage from '@/pages/RSA'
import Hash from '@/pages/Hash'

export default function App() {
  return (
    <div className="site-shell">
      <NavBar />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/pqc" element={<PQC />} />
          <Route path="/rsa" element={<RSAPage />} />
          <Route path="/hash" element={<Hash />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
