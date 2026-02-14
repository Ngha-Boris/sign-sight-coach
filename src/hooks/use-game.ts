import { useState, useEffect, useRef, useCallback } from 'react';
import { evaluateGesture, type Landmark, type GestureStatus } from '@/lib/gesture-engine';
import { GESTURE_LIBRARY } from '@/lib/gesture-data';
import { WORD_LIBRARY } from '@/lib/word-data';

export type GameMode = 'learn' | 'practice' | 'words';

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

  // Word mode state
  const [currentWord, setCurrentWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0); // index into current word
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [wordActive, setWordActive] = useState(false);

  const cooldownRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // When in word mode, currentLetter follows the current word's letter
  useEffect(() => {
    if (mode === 'words' && currentWord && wordActive) {
      setCurrentLetter(currentWord[wordIndex] || currentWord[0]);
    }
  }, [mode, currentWord, wordIndex, wordActive]);

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

      if (mode === 'words' && wordActive) {
        // Advance to next letter in word
        cooldownTimerRef.current = setTimeout(() => {
          setWordIndex((prev) => {
            const next = prev + 1;
            if (next >= currentWord.length) {
              // Word complete!
              setWordsCompleted((c) => c + 1);
              setPracticeCorrect((c) => c + 1);
              // Pick a new word after brief delay
              setTimeout(() => {
                const newWord = WORD_LIBRARY[Math.floor(Math.random() * WORD_LIBRARY.length)].word;
                setCurrentWord(newWord);
                setWordIndex(0);
              }, 500);
              return 0;
            }
            return next;
          });
          cooldownRef.current = false;
        }, 1200);
      } else if (mode === 'practice') {
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
  }, [landmarks, currentLetter, mode, streak, wordActive, currentWord]);

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
    if (wordsCompleted >= 1 && !achievements.includes('firstWord')) newAch.push('firstWord');
    if (wordsCompleted >= 5 && !achievements.includes('words5')) newAch.push('words5');
    if (newAch.length) setAchievements((a) => [...a, ...newAch]);
  }, [streak, completedLetters.size, score, achievements, wordsCompleted]);

  // Practice timer (for practice and words mode)
  useEffect(() => {
    if (mode === 'learn') return;
    const isActive = mode === 'practice' ? practiceActive : wordActive;
    if (!isActive || practiceTimer <= 0) return;
    const t = setTimeout(() => setPracticeTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, practiceActive, wordActive, practiceTimer]);

  const startPractice = useCallback(() => {
    setPracticeActive(true);
    setPracticeTimer(60);
    setPracticeCorrect(0);
    setScore(0);
    setStreak(0);
    const letters = GESTURE_LIBRARY.map((g) => g.letter);
    setCurrentLetter(letters[Math.floor(Math.random() * letters.length)]);
  }, []);

  const startWordPractice = useCallback((word?: string) => {
    const selectedWord = word || WORD_LIBRARY[Math.floor(Math.random() * WORD_LIBRARY.length)].word;
    setCurrentWord(selectedWord);
    setWordIndex(0);
    setWordActive(true);
    setWordsCompleted(0);
    setPracticeTimer(120);
    setPracticeCorrect(0);
    setScore(0);
    setStreak(0);
    setCurrentLetter(selectedWord[0]);
  }, []);

  const resetGame = useCallback(() => {
    clearTimeout(cooldownTimerRef.current);
    cooldownRef.current = false;
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCompletedLetters(new Set());
    setPracticeActive(false);
    setWordActive(false);
    setPracticeTimer(60);
    setPracticeCorrect(0);
    setCurrentLetter('A');
    setCurrentWord('');
    setWordIndex(0);
    setWordsCompleted(0);
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
    startWordPractice,
    resetGame,
    // Word mode
    currentWord,
    wordIndex,
    wordsCompleted,
    wordActive,
  };
}
