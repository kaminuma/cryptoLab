import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    document.title = 'ページが見つかりません - CryptoLab'
  }, [])

  return (
    <main className="page not-found">
      <h1>404</h1>
      <p>お探しのページは見つかりませんでした。</p>
      <Link to="/" className="not-found__link">ホームに戻る</Link>
    </main>
  )
}
