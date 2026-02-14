import { motion, AnimatePresence } from 'framer-motion';
import { GESTURE_LIBRARY } from '@/lib/gesture-data';
import type { GestureStatus } from '@/lib/gesture-engine';
import type { GameMode } from '@/hooks/use-game';

interface GestureDisplayProps {
  currentLetter: string;
  onSelectLetter: (letter: string) => void;
  completedLetters: Set<string>;
  mode: GameMode;
  status: GestureStatus;
}

export function GestureDisplay({
  currentLetter,
  onSelectLetter,
  completedLetters,
  mode,
  status,
}: GestureDisplayProps) {
  const gesture = GESTURE_LIBRARY.find((g) => g.letter === currentLetter);
  if (!gesture) return null;

  const statusBorder =
    status === 'correct'
      ? 'border-success/40 glow-success'
      : status === 'close'
      ? 'border-warning/30'
      : 'border-border/50';

  return (
    <div className="space-y-4">
      {/* Letter Selector (Learn mode) */}
      {mode === 'learn' && (
        <div className="flex gap-2">
          {GESTURE_LIBRARY.map((g) => {
            const isActive = g.letter === currentLetter;
            const isDone = completedLetters.has(g.letter);
            return (
              <button
                key={g.letter}
                onClick={() => onSelectLetter(g.letter)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg font-heading text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : isDone
                    ? 'bg-success/15 text-success border border-success/30'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                {g.letter}
                {isDone && !isActive && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-success text-[8px] text-success-foreground">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Reference Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLetter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`glass-card border ${statusBorder} p-6 transition-all duration-300`}
        >
          <div className="flex items-start gap-5">
            {/* Large Letter */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <span className="font-heading text-5xl font-bold text-gradient-primary">
                {gesture.letter}
              </span>
            </div>

            {/* Instructions */}
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Letter {gesture.letter}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{gesture.description}</p>
              </div>

              <div className="space-y-1.5">
                {gesture.instructions.map((inst, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {inst}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual hint */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-2 text-xs text-accent-foreground">
            <span className="text-lg">{gesture.emoji}</span>
            <span>Visual Reference — mimic this hand shape</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
