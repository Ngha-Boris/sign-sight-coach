import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import type { GestureStatus } from '@/lib/gesture-engine';

interface FeedbackBarProps {
  feedback: string[];
  status: GestureStatus;
}

const statusConfig = {
  correct: { icon: CheckCircle2, className: 'status-correct bg-success/10' },
  close: { icon: AlertCircle, className: 'status-close bg-warning/10' },
  incorrect: { icon: XCircle, className: 'status-incorrect bg-destructive/10' },
  'no-hand': { icon: Info, className: 'bg-secondary text-muted-foreground border-border/50' },
};

export function FeedbackBar({ feedback, status }: FeedbackBarProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const mainFeedback = feedback[0] || '';
  const additionalFeedback = feedback.slice(1);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mainFeedback}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl border px-4 py-3 ${config.className} transition-all`}
      >
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">{mainFeedback}</p>
            {additionalFeedback.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {additionalFeedback.map((f, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-background/40 px-2 py-0.5 text-xs font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
