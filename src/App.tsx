import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from '@/components/Footer'
import NavBar from '@/components/NavBar'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageTransition from '@/components/PageTransition'
import NotFound from '@/pages/NotFound'

const Home = lazy(() => import('./pages/Home'))
const Labs = lazy(() => import('./pages/Labs'))
const Learn = lazy(() => import('./pages/Learn'))
const PQC = lazy(() => import('./pages/PQC'))
const RSAPage = lazy(() => import('./pages/RSA'))
const Hash = lazy(() => import('./pages/Hash'))
const AESPage = lazy(() => import('./pages/AES'))
const ToolsConvert = lazy(() => import('./pages/ToolsConvert'))
const ToolsHashCracker = lazy(() => import('./pages/ToolsHashCracker'))
const ToolsXorConverter = lazy(() => import('./pages/ToolsXorConverter'))
const EnigmaPage = lazy(() => import('./pages/EnigmaPage'))
const HMACPage = lazy(() => import('./pages/HMAC'))

export default function App() {
  return (
    <div className="site-shell">
      <NavBar />
      <main className="site-main">
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/pqc" element={<PQC />} />
              <Route path="/rsa" element={<RSAPage />} />
              <Route path="/hash" element={<Hash />} />
              <Route path="/aes" element={<AESPage />} />
              <Route path="/tools/convert" element={<ToolsConvert />} />
              <Route path="/tools/hash-cracker" element={<ToolsHashCracker />} />
              <Route path="/tools/xor" element={<ToolsXorConverter />} />
              <Route path="/enigma" element={<EnigmaPage />} />
              <Route path="/hmac" element={<HMACPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
