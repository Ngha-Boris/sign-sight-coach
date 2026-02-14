import { motion } from 'framer-motion';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { ConfidenceMeter } from './ConfidenceMeter';
import type { GestureStatus } from '@/lib/gesture-engine';

interface WebcamFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isTracking: boolean;
  isLoading: boolean;
  confidence: number;
  status: GestureStatus;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export function WebcamFeed({
  videoRef,
  canvasRef,
  isTracking,
  isLoading,
  confidence,
  status,
  error,
  onStart,
  onStop,
}: WebcamFeedProps) {
  const borderColor =
    status === 'correct'
      ? 'border-success/50'
      : status === 'close'
      ? 'border-warning/40'
      : status === 'incorrect'
      ? 'border-destructive/30'
      : 'border-border/50';

  return (
    <div className="space-y-4">
      <div
        className={`glass-card border ${borderColor} relative aspect-[4/3] overflow-hidden transition-colors duration-300`}
      >
        {/* Always render video & canvas so refs are stable */}
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover -scale-x-100 ${
            isTracking ? 'block' : 'hidden'
          }`}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full -scale-x-100 ${
            isTracking ? 'block' : 'hidden'
          }`}
        />

        {isTracking && (
          <>
            {/* Confidence overlay */}
            <div className="absolute bottom-3 right-3">
              <ConfidenceMeter confidence={confidence} status={status} />
            </div>
            {/* Stop button */}
            <button
              onClick={onStop}
              className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <CameraOff className="h-4 w-4" />
            </button>
          </>
        )}

        {!isTracking && (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              {isLoading ? (
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              ) : (
                <Camera className="h-7 w-7 text-primary" />
              )}
            </div>
            <div className="text-center">
              <p className="font-heading text-sm font-semibold text-foreground">
                {isLoading ? 'Loading AI model...' : 'Camera Preview'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isLoading
                  ? 'Preparing hand tracking engine'
                  : 'Enable your camera to start practicing'}
              </p>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            {!isLoading && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStart}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground glow-primary transition-shadow hover:shadow-lg"
              >
                Start Camera
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
