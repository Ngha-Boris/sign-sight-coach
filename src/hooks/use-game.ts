import { useState, useEffect, useRef, useCallback } from 'react';
import { evaluateGesture, type Landmark, type GestureStatus } from '@/lib/gesture-engine';
import { GESTURE_LIBRARY } from '@/lib/gesture-data';

export type GameMode = 'learn' | 'practice';

export function useGame(landmarks: Landmark[] | null, mode: GameMode) {
  const [currentLetter, setCurrentLetter] = useState('A');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [feedback, setFeedback] = useState<string[]>(['Select a letter and show your hand']);
  const [status, setStatus] = useState<GestureStatus>('no-hand');
  const [completedLetters, setCompletedLetters] = useState<Set<string>>(new Set());
  const [practiceTimer, setPracticeTimer] = useState(60);
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  const cooldownRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Evaluate gesture
  useEffect(() => {
    const result = evaluateGesture(landmarks, currentLetter);
    setConfidence(result.confidence);
    setFeedback(result.feedback);
    setStatus(result.status);

    if (result.status === 'correct' && result.confidence >= 80 && !cooldownRef.current) {
      cooldownRef.current = true;

      setScore((s) => s + 10 + streak * 2);
      setStreak((s) => {
        const ns = s + 1;
        setMaxStreak((m) => Math.max(m, ns));
        return ns;
      });
      setCompletedLetters((s) => new Set([...s, currentLetter]));

      if (mode === 'practice') {
        setPracticeCorrect((c) => c + 1);
        cooldownTimerRef.current = setTimeout(() => {
          const letters = GESTURE_LIBRARY.map((g) => g.letter);
          setCurrentLetter(letters[Math.floor(Math.random() * letters.length)]);
          cooldownRef.current = false;
        }, 1500);
      } else {
        cooldownTimerRef.current = setTimeout(() => {
          cooldownRef.current = false;
        }, 2000);
      }
    } else if (result.status === 'incorrect' && !cooldownRef.current) {
      setStreak(0);
    }
  }, [landmarks, currentLetter, mode, streak]);

  // Check achievements
  useEffect(() => {
    const newAch: string[] = [];
    if (streak >= 3 && !achievements.includes('streak3')) newAch.push('streak3');
    if (streak >= 5 && !achievements.includes('streak5')) newAch.push('streak5');
    if (streak >= 10 && !achievements.includes('streak10')) newAch.push('streak10');
    if (completedLetters.size >= 10 && !achievements.includes('letters10')) newAch.push('letters10');
    if (completedLetters.size >= 26 && !achievements.includes('allLetters')) newAch.push('allLetters');
    if (score >= 100 && !achievements.includes('score100')) newAch.push('score100');
    if (score >= 500 && !achievements.includes('score500')) newAch.push('score500');
    if (newAch.length) setAchievements((a) => [...a, ...newAch]);
  }, [streak, completedLetters.size, score, achievements]);

  // Practice timer
  useEffect(() => {
    if (mode !== 'practice' || !practiceActive || practiceTimer <= 0) return;
    const t = setTimeout(() => setPracticeTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, practiceActive, practiceTimer]);

  const startPractice = useCallback(() => {
    setPracticeActive(true);
    setPracticeTimer(60);
    setPracticeCorrect(0);
    setScore(0);
    setStreak(0);
    const letters = GESTURE_LIBRARY.map((g) => g.letter);
    setCurrentLetter(letters[Math.floor(Math.random() * letters.length)]);
  }, []);

  const resetGame = useCallback(() => {
    clearTimeout(cooldownTimerRef.current);
    cooldownRef.current = false;
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCompletedLetters(new Set());
    setPracticeActive(false);
    setPracticeTimer(60);
    setPracticeCorrect(0);
    setCurrentLetter('A');
    setAchievements([]);
  }, []);

  return {
    currentLetter,
    setCurrentLetter,
    score,
    streak,
    maxStreak,
    confidence,
    feedback,
    status,
    completedLetters,
    achievements,
    practiceTimer,
    practiceActive,
    practiceCorrect,
    startPractice,
    resetGame,
  };
}
