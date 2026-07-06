import { useEffect, useState } from 'react'
import { Flame, Lightbulb, Play, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { INTERVIEW_QUESTIONS, type InterviewQuestion } from '@/data/interviewQuestions'
import { localDayKey } from '@/lib/dates'
import {
  HINT_PENALTY,
  QUESTION_SECONDS,
  dailyQuestionIndices,
  playedDays,
  scoreQuestion,
  topResults,
} from '@/lib/game/game'
import { useAppStore } from '@/lib/storage/store'
import { currentStreak } from '@/lib/streak/streak'
import type { GameResult } from '@/lib/storage/schema'

function todaysQuestions(todayKey: string): InterviewQuestion[] {
  return dailyQuestionIndices(todayKey, INTERVIEW_QUESTIONS.length).map(
    (i) => INTERVIEW_QUESTIONS[i],
  )
}

function Leaderboard({ results, todayKey }: { results: GameResult[]; todayKey: string }) {
  const top = topResults(results)
  if (top.length === 0) return null
  return (
    <Card className="mt-4">
      <h2 className="px-4 pb-1 pt-4 text-sm font-semibold text-text-2">Leaderboard</h2>
      <div className="divide-y divide-border-subtle">
        {top.map((r, i) => (
          <div key={r.dayKey} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="w-6 font-mono text-xs text-text-3">#{i + 1}</span>
            <span className={`flex-1 ${r.dayKey === todayKey ? 'font-medium text-accent' : ''}`}>
              {new Date(`${r.dayKey}T00:00:00`).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
              {r.dayKey === todayKey && ' (today)'}
            </span>
            <span className="text-xs text-text-3">
              {r.correct}/{r.total} correct
            </span>
            <span className="font-mono font-semibold tabular-nums">{r.score}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function GameRun({
  todayKey,
  onDone,
}: {
  todayKey: string
  onDone: (r: Omit<GameResult, 'completedAt'>) => void
}) {
  const questions = todaysQuestions(todayKey)
  const [qIndex, setQIndex] = useState(0)
  const [remaining, setRemaining] = useState(QUESTION_SECONDS)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [usedHint, setUsedHint] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const q = questions[qIndex]

  useEffect(() => {
    if (revealed) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          setRevealed(true)
          setSelected(null)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [qIndex, revealed])

  function answer(i: number) {
    if (revealed) return
    const gained = scoreQuestion({
      correct: i === q.answer,
      remainingSec: remaining,
      usedHint,
    })
    setSelected(i)
    setRevealed(true)
    setScore((s) => s + gained)
    if (i === q.answer) setCorrectCount((c) => c + 1)
  }

  function next() {
    if (qIndex + 1 >= questions.length) {
      onDone({
        dayKey: todayKey,
        score,
        correct: correctCount,
        total: questions.length,
      })
      return
    }
    setQIndex(qIndex + 1)
    setRemaining(QUESTION_SECONDS)
    setSelected(null)
    setRevealed(false)
    setUsedHint(false)
    setShowHint(false)
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="accent">{q.category}</Badge>
        <span className="text-xs text-text-3">
          Question {qIndex + 1} of {questions.length}
        </span>
        <span className="ml-auto font-mono text-sm tabular-nums text-text-2">{score} pts</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={remaining} max={QUESTION_SECONDS} className="flex-1" />
        <span
          className={`w-8 text-right font-mono text-sm tabular-nums ${remaining <= 5 && !revealed ? 'text-danger' : 'text-text-3'}`}
        >
          {remaining}s
        </span>
      </div>

      <p className="mt-4 font-medium">{q.prompt}</p>

      <div className="mt-3 space-y-1.5">
        {q.options.map((opt, i) => {
          let cls = 'border-border-subtle hover:bg-surface-2/40'
          if (revealed) {
            if (i === q.answer) cls = 'border-success/50 bg-success/10'
            else if (i === selected) cls = 'border-danger/50 bg-danger/10'
            else cls = 'border-border-subtle opacity-60'
          }
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => answer(i)}
              className={`block w-full rounded-md border px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {revealed ? (
        <div className="mt-4">
          <p className={`text-sm font-medium ${selected === q.answer ? 'text-success' : 'text-danger'}`}>
            {selected === q.answer
              ? 'Correct.'
              : selected === null
                ? 'Time expired.'
                : 'Not quite.'}
          </p>
          <p className="mt-1 text-sm text-text-2">{q.explanation}</p>
          <Button className="mt-4" onClick={next}>
            {qIndex + 1 >= questions.length ? 'Finish' : 'Next question'}
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          {showHint ? (
            <p className="text-sm text-warning/90">{q.hint}</p>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setShowHint(true)
                setUsedHint(true)
              }}
            >
              <span className="flex items-center gap-1.5">
                <Lightbulb className="size-4" aria-hidden />
                Hint (−{HINT_PENALTY} pts)
              </span>
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export function InterviewPage() {
  const gameResults = useAppStore((s) => s.gameResults)
  const recordGameResult = useAppStore((s) => s.recordGameResult)
  const [started, setStarted] = useState(false)

  const todayKey = localDayKey(new Date())
  const todayResult = gameResults.find((r) => r.dayKey === todayKey)
  const streak = currentStreak(playedDays(gameResults), new Date())
  const best = topResults(gameResults, 1)[0]
  const categories = [...new Set(todaysQuestions(todayKey).map((q) => q.category))]

  return (
    <>
      <PageHeader
        title="Interview Prep"
        description="One timed round a day — five questions, hints cost points."
      />

      {todayResult ? (
        <>
          <Card className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Trophy className="size-8 text-warning" aria-hidden />
            <p className="font-mono text-4xl font-semibold tabular-nums">{todayResult.score}</p>
            <p className="text-sm text-text-2">
              {todayResult.correct}/{todayResult.total} correct today
              {best && todayResult.score >= best.score && ' — personal best'}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-text-3">
              <Flame className="size-4 text-streak" aria-hidden />
              {streak}-day play streak · next round tomorrow
            </p>
          </Card>
          <Leaderboard results={gameResults} todayKey={todayKey} />
        </>
      ) : started ? (
        <GameRun
          todayKey={todayKey}
          onDone={(r) => {
            recordGameResult(r)
            setStarted(false)
          }}
        />
      ) : (
        <>
          <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="font-medium">Today's round is ready</p>
            <div className="flex max-w-md flex-wrap items-center justify-center gap-1.5">
              {categories.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
            <p className="max-w-md text-sm text-text-2">
              Five questions, {QUESTION_SECONDS}s each. 100 points per correct answer, up
              to +50 for speed, −{HINT_PENALTY} if you take the hint. One round per day.
            </p>
            {streak > 0 && (
              <p className="flex items-center gap-1.5 text-sm text-text-3">
                <Flame className="size-4 text-streak" aria-hidden />
                {streak}-day play streak on the line
              </p>
            )}
            <Button onClick={() => setStarted(true)}>
              <span className="flex items-center gap-1.5">
                <Play className="size-4" aria-hidden />
                Start today's round
              </span>
            </Button>
          </Card>
          <Leaderboard results={gameResults} todayKey={todayKey} />
        </>
      )}
    </>
  )
}
