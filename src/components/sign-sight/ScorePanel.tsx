import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Target, Star, Medal, Crown, Flame, Award } from 'lucide-react';
import { GESTURE_LIBRARY } from '@/lib/gesture-data';

interface ScorePanelProps {
  score: number;
  streak: number;
  maxStreak: number;
  completedLetters: Set<string>;
  achievements: string[];
  practiceActive: boolean;
  practiceTimer: number;
  practiceCorrect: number;
  onStartPractice: () => void;
  mode: 'learn' | 'practice';
}

const ACHIEVEMENT_DATA: Record<string, { icon: typeof Star; label: string; color: string }> = {
  streak3: { icon: Zap, label: '3x Streak', color: 'text-warning' },
  streak5: { icon: Crown, label: '5x Streak', color: 'text-warning' },
  streak10: { icon: Flame, label: '10x Streak', color: 'text-destructive' },
  letters10: { icon: Medal, label: '10 Letters', color: 'text-success' },
  allLetters: { icon: Award, label: 'Full Alphabet', color: 'text-primary' },
  score100: { icon: Star, label: 'Century', color: 'text-primary' },
  score500: { icon: Trophy, label: 'Master', color: 'text-warning' },
};

const totalLetters = GESTURE_LIBRARY.length;

export function ScorePanel({
  score,
  streak,
  maxStreak,
  completedLetters,
  achievements,
  practiceActive,
  practiceTimer,
  practiceCorrect,
  onStartPractice,
  mode,
}: ScorePanelProps) {
  const progressPercent = Math.round((completedLetters.size / totalLetters) * 100);

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card border border-border/50 p-3 text-center">
          <Trophy className="mx-auto h-4 w-4 text-primary" />
          <motion.p
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="mt-1 font-heading text-xl font-bold text-foreground"
          >
            {score}
          </motion.p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</p>
        </div>
        <div className="glass-card border border-border/50 p-3 text-center">
          <Zap className="mx-auto h-4 w-4 text-warning" />
          <p className="mt-1 font-heading text-xl font-bold text-foreground">{maxStreak}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Best Streak</p>
        </div>
        <div className="glass-card border border-border/50 p-3 text-center">
          <Target className="mx-auto h-4 w-4 text-success" />
          <p className="mt-1 font-heading text-xl font-bold text-foreground">
            {completedLetters.size}/{totalLetters}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Letters</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass-card border border-border/50 p-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Alphabet Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Practice timer */}
      {mode === 'practice' && (
        <div className="glass-card border border-border/50 p-4">
          {practiceActive ? (
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Time Left</p>
              <p
                className={`font-heading text-3xl font-bold ${
                  practiceTimer <= 10 ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {practiceTimer}s
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {practiceCorrect} correct gestures
              </p>
              {practiceTimer <= 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-success">Round Complete! 🎉</p>
                  <p className="text-xs text-muted-foreground">Score: {score} | Correct: {practiceCorrect}</p>
                  <button
                    onClick={onStartPractice}
                    className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Random letters, 60 second rounds
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStartPractice}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground glow-primary"
              >
                Start Practice Round
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="glass-card border border-border/50 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Achievements ({achievements.length})
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {achievements.map((a) => {
                const data = ACHIEVEMENT_DATA[a];
                if (!data) return null;
                const Icon = data.icon;
                return (
                  <motion.div
                    key={a}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={`flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold ${data.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {data.label}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
