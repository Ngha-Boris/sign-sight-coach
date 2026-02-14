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
        <div className="flex flex-wrap gap-1.5">
          {GESTURE_LIBRARY.map((g) => {
            const isActive = g.letter === currentLetter;
            const isDone = completedLetters.has(g.letter);
            return (
              <button
                key={g.letter}
                onClick={() => onSelectLetter(g.letter)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-md font-heading text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : isDone
                    ? 'bg-success/15 text-success border border-success/30'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                {g.letter}
                {isDone && !isActive && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-success text-[7px] text-success-foreground">
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
          className={`glass-card border ${statusBorder} p-5 transition-all duration-300`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <span className="font-heading text-3xl font-bold text-gradient-primary">
                {gesture.letter}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Letter {gesture.letter}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{gesture.description}</p>
              </div>

              <div className="space-y-1">
                {gesture.instructions.map((inst, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-secondary-foreground">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {inst}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-1.5 text-xs text-accent-foreground">
            <span className="text-base">{gesture.emoji}</span>
            <span>Visual Reference — mimic this hand shape</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
