import { motion } from 'framer-motion';
import { Hand, Trophy } from 'lucide-react';
import type { GameMode } from '@/hooks/use-game';

interface HeaderProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  score: number;
  streak: number;
}

export function Header({ mode, onModeChange, score, streak }: HeaderProps) {
  return (
    <header className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 glow-primary">
            <Hand className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight text-foreground">
              Sign<span className="text-gradient-primary">Sight</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI Sign Coach
            </p>
          </div>
        </div>

        <div className="flex rounded-lg bg-secondary/60 p-0.5">
          {(['learn', 'practice', 'words'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`relative rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
                mode === m ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === m && (
                <motion.div
                  layoutId="mode-tab"
                  className="absolute inset-0 rounded-md bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{m}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 rounded-full bg-warning/15 px-3 py-1 text-sm font-bold text-warning"
            >
              🔥 {streak}
            </motion.div>
          )}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Trophy className="h-4 w-4 text-primary" />
            {score}
          </div>
        </div>
      </div>
    </header>
  );
}
