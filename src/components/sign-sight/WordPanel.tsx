import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Keyboard } from 'lucide-react';
import { WORD_LIBRARY } from '@/lib/word-data';

interface WordPanelProps {
  currentWord: string;
  wordIndex: number;
  wordsCompleted: number;
  wordActive: boolean;
  practiceTimer: number;
  practiceCorrect: number;
  score: number;
  onStartWord: (word?: string) => void;
}

export function WordPanel({
  currentWord,
  wordIndex,
  wordsCompleted,
  wordActive,
  practiceTimer,
  practiceCorrect,
  score,
  onStartWord,
}: WordPanelProps) {
  const [customWord, setCustomWord] = useState('');

  const handleCustomStart = () => {
    const cleaned = customWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (cleaned.length > 0) {
      onStartWord(cleaned);
      setCustomWord('');
    }
  };

  if (!wordActive) {
    return (
      <div className="space-y-3">
        {/* Custom word input */}
        <div className="glass-card border border-border/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Type a word or sentence to practice
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder="e.g. HELLO"
              className="flex-1 rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomStart()}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCustomStart}
              disabled={!customWord.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <Keyboard className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Quick-start words */}
        <div className="glass-card border border-border/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Or choose a word
          </p>
          <div className="flex flex-wrap gap-2">
            {WORD_LIBRARY.slice(0, 10).map((w) => (
              <button
                key={w.word}
                onClick={() => onStartWord(w.word)}
                className="rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                title={w.hint}
              >
                {w.word}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStartWord()}
            className="mt-3 w-full rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground glow-primary"
          >
            Random Word
          </motion.button>
        </div>
      </div>
    );
  }

  // Active word practice
  const wordHint = WORD_LIBRARY.find((w) => w.word === currentWord)?.hint;

  return (
    <div className="space-y-3">
      <div className="glass-card border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Spelling: {currentWord}
          </p>
        </div>

        {wordHint && (
          <p className="text-xs text-muted-foreground mb-3 italic">"{wordHint}"</p>
        )}

        {/* Letter progress */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          <AnimatePresence>
            {currentWord.split('').map((letter, i) => {
              const isDone = i < wordIndex;
              const isCurrent = i === wordIndex;
              return (
                <motion.div
                  key={`${letter}-${i}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-heading text-lg font-bold transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground glow-primary ring-2 ring-primary/50'
                      : isDone
                      ? 'bg-success/15 text-success border border-success/30'
                      : 'bg-secondary text-muted-foreground border border-border/50'
                  }`}
                >
                  {letter}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Timer & stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{wordsCompleted} words completed</span>
          <span
            className={`font-heading text-lg font-bold ${
              practiceTimer <= 10 ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {practiceTimer}s
          </span>
        </div>

        {practiceTimer <= 0 && (
          <div className="mt-3 text-center space-y-2">
            <p className="text-sm font-semibold text-success">Time's up! 🎉</p>
            <p className="text-xs text-muted-foreground">
              Words: {wordsCompleted} | Score: {score}
            </p>
            <button
              onClick={() => onStartWord()}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
