import { useEffect } from 'react'

const BASE_URL = 'https://cryptolab-8xw.pages.dev'

type PageMeta = {
  title: string
  description?: string
  path?: string
}

export function usePageMeta({ title, description, path }: PageMeta) {
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

    // Update canonical URL
    const canonicalUrl = `${BASE_URL}${path ?? window.location.pathname}`
    const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (link) {
      link.href = canonicalUrl
    }
  }, [title, description, path])
}
