import { motion } from 'framer-motion';
import type { GestureStatus } from '@/lib/gesture-engine';

interface ConfidenceMeterProps {
  confidence: number;
  status: GestureStatus;
}

export function ConfidenceMeter({ confidence, status }: ConfidenceMeterProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  const color =
    status === 'correct'
      ? 'hsl(152, 60%, 48%)'
      : status === 'close'
      ? 'hsl(38, 92%, 55%)'
      : status === 'incorrect'
      ? 'hsl(0, 72%, 55%)'
      : 'hsl(215, 15%, 50%)';

  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-background/70 backdrop-blur-sm">
      <svg width="64" height="64" className="absolute">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="hsl(220, 15%, 16%)"
          strokeWidth="3"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span className="text-xs font-bold text-foreground">{confidence}%</span>
    </div>
  );
}
