import { useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'
import { EnigmaSimulator } from '../enigma/ui/EnigmaSimulator'

function EnigmaHistory() {
  return (
    <>
      <p>
        エニグマ暗号機は、第二次世界大戦中にナチス・ドイツ軍が使用した電気機械式暗号機です。
        その解読は戦争の行方を大きく左右しました。
      </p>
      <ul>
        <li>
          <strong>1918年:</strong> ドイツの発明家アルトゥール・シェルビウスがエニグマを特許出願。
          当初は商用目的で販売された。
        </li>
        <li>
          <strong>1926年:</strong> ドイツ海軍がエニグマを採用。その後、陸軍・空軍にも拡大。
        </li>
        <li>
          <strong>1932年:</strong> ポーランドの数学者マリアン・レイェフスキが初めてエニグマの解読に成功。
          「ボンバ」と呼ばれる解読機を開発。
        </li>
        <li>
          <strong>1939年:</strong> ポーランドがイギリス・フランスにエニグマ解読の成果を共有。
        </li>
        <li>
          <strong>1940年代:</strong> アラン・チューリングらがブレッチリー・パークで改良型「Bombe」を開発し、
          大規模なエニグマ解読を実現。
        </li>
      </ul>
      <div className="step-lesson__callout">
        エニグマの解読は戦争を約2年短縮し、1400万人以上の命を救ったと推定されています。
        この成果は1970年代まで機密とされていました。
      </div>
    </>
  )
}

function HowEnigmaWorks() {
  return (
    <>
      <p>
        エニグマは<strong>多表式換字暗号</strong>の電気機械的実装です。
        キーを押すたびに内部状態が変化し、同じ文字でも異なる暗号文字に変換されます。
      </p>

      <h3>主要コンポーネント</h3>
      <ul>
        <li>
          <strong>キーボード:</strong> 26文字のアルファベットキー。入力用。
        </li>
        <li>
          <strong>ローター（回転円盤）:</strong> 通常3つ（海軍型は4つ）。各ローターは26個の電気接点を持ち、
          文字の置換を行う。キーを押すたびに右のローターが1ステップ回転し、
          一定回数で次のローターも回転する（走行距離計と同じ原理）。
        </li>
        <li>
          <strong>リフレクター:</strong> 信号を折り返す。これにより暗号化と復号化が同じ操作になるが、
          同時に「ある文字が自分自身に暗号化されない」という弱点を生む。
        </li>
        <li>
          <strong>プラグボード:</strong> 文字のペアを入れ替える追加の換字層。
          最大13組（26文字）の接続が可能で、鍵空間を大幅に拡大。
        </li>
        <li>
          <strong>ランプボード:</strong> 暗号化された文字を光で表示。
        </li>
      </ul>

      <h3>暗号化の流れ</h3>
      <ol>
        <li>キーを押す → ローターが1ステップ回転</li>
        <li>電気信号がプラグボード → ローター（右→中→左）→ リフレクター</li>
        <li>リフレクターで折り返し → ローター（左→中→右）→ プラグボード</li>
        <li>ランプボードで暗号文字が点灯</li>
      </ol>

      <div className="step-lesson__callout">
        エニグマの鍵空間は約 158,962,555,217,826,360,000 通り（約1.6 x 10^20）。
        しかし、運用上の弱点（定型文、文字が自分自身にならない性質など）が解読の突破口となりました。
      </div>
    </>
  )
}

function EnigmaDemo() {
  return (
    <>
      <p>
        下のシミュレーターで実際にエニグマを操作してみましょう。
        ローターの初期位置やプラグボードの設定を変えると、同じ入力でも異なる暗号文が生成されることを確認できます。
      </p>
      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <EnigmaSimulator />
      </div>
      <div className="step-lesson__callout">
        <strong>試してみよう:</strong> 同じ文字を繰り返し入力してみてください。
        ローターが回転するため、毎回異なる暗号文字に変換されます。
        また、暗号文を同じ設定で再入力すると、元の平文に戻ることも確認できます。
      </div>
    </>
  )
}

export default function EnigmaPage() {
  usePageMeta({ title: 'Enigma Simulator', description: 'エニグマ暗号機の高忠実度シミュレータで暗号化を体験する' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.documentElement.setAttribute('data-theme', 'classic')
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'エニグマの歴史',
      content: <EnigmaHistory />,
      quiz: {
        question: 'エニグマ暗号機を最初に解読したのはどの国の数学者か？',
        options: [
          { label: 'イギリス（アラン・チューリング）' },
          { label: 'アメリカ（クロード・シャノン）' },
          { label: 'ポーランド（マリアン・レイェフスキ）', correct: true },
          { label: 'フランス（ブレーズ・ド・ヴィジュネル）' },
        ],
        explanation: '正解！1932年にポーランドの数学者マリアン・レイェフスキがエニグマの解読に初めて成功しました。その成果は後にイギリスのブレッチリー・パークに引き継がれ、アラン・チューリングらがさらに発展させました。',
      },
    },
    {
      title: 'エニグマの仕組み',
      content: <HowEnigmaWorks />,
    },
    {
      title: 'エニグマシミュレーター',
      content: <EnigmaDemo />,
    },
  ]

  return (
    <main className="page enigma-page">
      <StepLesson
        title="Enigma 暗号機"
        steps={steps}
      />
    </main>
  )
}
