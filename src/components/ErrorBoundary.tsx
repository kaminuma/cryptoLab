import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>エラーが発生しました</h1>
          <p>予期しないエラーが発生しました。ページをリロードしてください。</p>
          {this.state.error && (
            <details>
              <summary>エラー詳細</summary>
              <pre>{this.state.error.message}</pre>
            </details>
          )}
          <div className="error-boundary__actions">
            <button onClick={() => window.location.reload()}>
              リロード
            </button>
            <button onClick={() => window.location.href = '/'}>
              ホームに戻る
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
