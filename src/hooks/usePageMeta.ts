import { useEffect } from 'react'

type PageMeta = {
  title: string
  description?: string
}

export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} - CryptoLab` : 'CryptoLab - 暗号技術のハンズオン学習'
    document.title = fullTitle

    const metaUpdates: [string, string][] = [
      ['meta[property="og:title"]', fullTitle],
      ['meta[name="twitter:title"]', fullTitle],
    ]

    if (description) {
      metaUpdates.push(
        ['meta[name="description"]', description],
        ['meta[property="og:description"]', description],
        ['meta[name="twitter:description"]', description],
      )
    }

    for (const [selector, content] of metaUpdates) {
      document.querySelector(selector)?.setAttribute('content', content)
    }
  }, [title, description])
}
