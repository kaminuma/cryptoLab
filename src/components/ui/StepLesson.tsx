import { useState, useCallback, useEffect, type ReactNode } from 'react'

export type QuizOption = {
  label: string
  correct?: boolean
}

export type LessonStep = {
  title: string
  content: ReactNode
  quiz?: {
    question: string
    options: QuizOption[]
    explanation: string
  }
}

type StepLessonProps = {
  title: string
  steps: LessonStep[]
  onComplete?: () => void
}

type PerStepState = {
  quizState: 'unanswered' | 'correct' | 'wrong'
  selectedOption: number | null
}

export default function StepLesson({ title, steps, onComplete }: StepLessonProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)

  // Per-step quiz state is preserved across navigation
  const [stepStates, setStepStates] = useState<Map<number, PerStepState>>(new Map())

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0
  const hasQuiz = !!step.quiz

  const currentState = stepStates.get(currentStep) ?? { quizState: 'unanswered' as const, selectedOption: null }

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentStep])

  const updateStepState = useCallback((stepIndex: number, update: Partial<PerStepState>) => {
    setStepStates(prev => {
      const next = new Map(prev)
      const current = next.get(stepIndex) ?? { quizState: 'unanswered' as const, selectedOption: null }
      next.set(stepIndex, { ...current, ...update })
      return next
    })
  }, [])

  const handleNext = useCallback(() => {
    setCompletedSteps(prev => new Set(prev).add(currentStep))
    if (isLastStep) {
      setIsCompleted(true)
      onComplete?.()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, isLastStep, onComplete])

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }, [isFirstStep])

  const handleQuizAnswer = useCallback((index: number) => {
    if (currentState.quizState === 'correct') return
    const isCorrect = step.quiz?.options[index]?.correct ?? false
    updateStepState(currentStep, {
      selectedOption: index,
      quizState: isCorrect ? 'correct' : 'wrong',
    })
  }, [currentState.quizState, currentStep, step.quiz, updateStepState])

  const handleStepClick = useCallback((index: number) => {
    // Can navigate to: any completed step, current step, or next uncompleted step
    const maxReachable = completedSteps.size > 0
      ? Math.max(...Array.from(completedSteps)) + 1
      : 0
    const canReach = Math.max(maxReachable, currentStep)
    if (index <= canReach) {
      setCurrentStep(index)
    }
  }, [completedSteps, currentStep])

  const handleRestart = useCallback(() => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setStepStates(new Map())
    setIsCompleted(false)
  }, [])

  const progress = ((completedSteps.size) / steps.length) * 100

  // Completion screen
  if (isCompleted) {
    const quizCount = steps.filter(s => s.quiz).length
    return (
      <div className="step-lesson">
        <div className="step-lesson__complete">
          <div className="step-lesson__complete-icon">&#10003;</div>
          <h2 className="step-lesson__complete-title">レッスン完了!</h2>
          <p className="step-lesson__complete-stats">
            {steps.length} ステップ完了 / {quizCount} 問のクイズに回答
          </p>
          <button
            className="step-lesson__nav-btn step-lesson__nav-btn--next"
            onClick={handleRestart}
          >
            もう一度学ぶ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="step-lesson">
      {/* Top bar: title + progress */}
      <div className="step-lesson__header">
        <span className="step-lesson__title">{title}</span>
        <span className="step-lesson__counter">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="step-lesson__progress-track"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="レッスン進捗"
      >
        <div
          className="step-lesson__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="step-lesson__dots">
        {steps.map((stepItem, i) => (
          <button
            key={i}
            className={`step-lesson__dot${
              i === currentStep ? ' step-lesson__dot--active' : ''
            }${completedSteps.has(i) ? ' step-lesson__dot--completed' : ''}`}
            onClick={() => handleStepClick(i)}
            title={stepItem.title}
            aria-label={`ステップ ${i + 1}: ${stepItem.title}`}
            aria-current={i === currentStep ? 'step' : undefined}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="step-lesson__body" key={currentStep}>
        <h2 className="step-lesson__step-title">{step.title}</h2>
        <div className="step-lesson__content">
          {step.content}
        </div>

        {/* Quiz */}
        {hasQuiz && (
          <div className="step-lesson__quiz">
            <p className="step-lesson__quiz-question">{step.quiz!.question}</p>
            <div className="step-lesson__quiz-options" role="radiogroup" aria-label={step.quiz!.question}>
              {step.quiz!.options.map((opt, i) => {
                let optionClass = 'step-lesson__quiz-option'
                if (currentState.selectedOption === i) {
                  optionClass += currentState.quizState === 'correct'
                    ? ' step-lesson__quiz-option--correct'
                    : ' step-lesson__quiz-option--wrong'
                } else if (currentState.quizState === 'correct' && opt.correct) {
                  optionClass += ' step-lesson__quiz-option--correct'
                }
                return (
                  <button
                    key={i}
                    className={optionClass}
                    onClick={() => handleQuizAnswer(i)}
                    disabled={currentState.quizState === 'correct'}
                    role="radio"
                    aria-checked={currentState.selectedOption === i}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {currentState.quizState !== 'unanswered' && (
              <div
                className={`step-lesson__quiz-feedback ${
                  currentState.quizState === 'correct' ? 'step-lesson__quiz-feedback--correct' : 'step-lesson__quiz-feedback--wrong'
                }`}
                aria-live="polite"
              >
                {currentState.quizState === 'correct' ? step.quiz!.explanation : 'もう一度考えてみましょう。'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="step-lesson__nav">
        <button
          className="step-lesson__nav-btn step-lesson__nav-btn--prev"
          onClick={handlePrev}
          disabled={isFirstStep}
        >
          &#8592; 戻る
        </button>
        <button
          className="step-lesson__nav-btn step-lesson__nav-btn--next"
          onClick={handleNext}
        >
          {isLastStep ? '完了' : '次へ \u2192'}
        </button>
      </div>
    </div>
  )
}
