import { type ComponentType, useEffect, useMemo, useState } from 'react'
import ClassicalPage from '@/pages/Classical'
import SymmetricPage from '@/pages/Symmetric'
import PublicKeyPage from '@/pages/PublicKey'

type TabId = 'classical' | 'symmetric' | 'public'

const tabs: Array<{ id: TabId; label: string; description: string; component: ComponentType }> = [
  { id: 'classical', label: '古典', description: 'シーザー / ヴィジュネル', component: ClassicalPage },
  { id: 'symmetric', label: '共通鍵', description: 'AES-GCM デモ', component: SymmetricPage },
  { id: 'public', label: '公開鍵', description: 'ECDH→HKDF→AES', component: PublicKeyPage },
]

export default function Labs() {
  const [activeTab, setActiveTab] = useState<TabId>('classical')

  useEffect(() => {
    document.title = 'ラボ - CryptoLab'
  }, [])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ActiveComponent = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.component ?? ClassicalPage,
    [activeTab],
  )

  return (
    <div>
      <section className="page-header">
        <p className="eyebrow">Hands-on Labs</p>
        <h1>古典・共通鍵・公開鍵を切り替えながら学ぶ。</h1>
        <p className="lede">タブを移動するだけでシーザー／AES-GCM／ECDH のフローを比較でき、実装メモと注意点も同じ画面で確認できます。</p>
      </section>

      <nav className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab${tab.id === activeTab ? ' active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-desc">{tab.description}</span>
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        <ActiveComponent />
      </div>
    </div>
  )
}
