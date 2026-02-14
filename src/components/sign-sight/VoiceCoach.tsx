import { useState, useCallback, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import type { GestureStatus } from '@/lib/gesture-engine';

interface VoiceCoachProps {
  feedback: string[];
  currentLetter: string;
  status: GestureStatus;
  isTracking: boolean;
}

export function VoiceCoach({ feedback, currentLetter, status, isTracking }: VoiceCoachProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenRef = useRef('');
  const speakQueueRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const prevStatusRef = useRef<GestureStatus>('no-hand');
  const prevLetterRef = useRef(currentLetter);
  const hasGreetedRef = useRef(false);

  const speak = useCallback(async (text: string, force = false) => {
    if (muted || !text) return;
    if (!force && text === lastSpokenRef.current) return;
    
    // If already speaking, queue it
    if (isSpeaking) {
      speakQueueRef.current = text;
      return;
    }

    lastSpokenRef.current = text;
    setIsSpeaking(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        // Play queued message
        if (speakQueueRef.current) {
          const queued = speakQueueRef.current;
          speakQueueRef.current = null;
          setTimeout(() => speak(queued, true), 300);
        }
      };
      await audio.play();
    } catch (e) {
      console.error('Voice coach error:', e);
      setIsSpeaking(false);
    }
  }, [muted, isSpeaking]);

  // Auto-speak when camera starts
  useEffect(() => {
    if (isTracking && !hasGreetedRef.current && !muted) {
      hasGreetedRef.current = true;
      speak(`Welcome! Show your hand to the camera. Let's practice the letter ${currentLetter}.`, true);
    }
    if (!isTracking) {
      hasGreetedRef.current = false;
    }
  }, [isTracking, muted, currentLetter, speak]);

  // Auto-speak on status changes (debounced)
  useEffect(() => {
    if (!isTracking || muted) return;

    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    // Clear any pending debounce
    clearTimeout(debounceRef.current);

    // No-hand detected
    if (status === 'no-hand' && prev !== 'no-hand') {
      debounceRef.current = setTimeout(() => {
        speak('I can\'t see your hand. Please show your hand to the camera.', true);
      }, 2500);
      return;
    }

    // Correct!
    if (status === 'correct' && prev !== 'correct') {
      speak('Perfect! Great job!', true);
      return;
    }

    // Close — give tips after a moment
    if (status === 'close' && prev !== 'close') {
      debounceRef.current = setTimeout(() => {
        const tips = feedback.filter(f => !f.includes('Almost') && !f.includes('Perfect'));
        if (tips.length > 0) {
          speak(`Almost there! Try to ${tips[0].toLowerCase()}`, true);
        }
      }, 2000);
      return;
    }

    // Incorrect — give corrective feedback after a delay
    if (status === 'incorrect' && prev === 'incorrect') {
      // Only speak if feedback changed substantially
      debounceRef.current = setTimeout(() => {
        const tips = feedback.filter(f => !f.includes('Almost') && !f.includes('Perfect'));
        if (tips.length > 0) {
          const tip = tips[Math.floor(Math.random() * Math.min(tips.length, 2))];
          speak(tip, true);
        }
      }, 4000);
    }
  }, [status, feedback, isTracking, muted, speak]);

  // Auto-speak when letter changes
  useEffect(() => {
    if (!isTracking || muted) return;
    if (currentLetter !== prevLetterRef.current) {
      prevLetterRef.current = currentLetter;
      debounceRef.current = setTimeout(() => {
        speak(`Now show me the letter ${currentLetter}.`, true);
      }, 800);
    }
  }, [currentLetter, isTracking, muted, speak]);

  // Cleanup debounce
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          const text = feedback.length > 0
            ? feedback.slice(0, 3).join('. ')
            : `Show the sign for letter ${currentLetter}`;
          speak(text, true);
        }}
        disabled={isSpeaking}
        className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        {isSpeaking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
        {isSpeaking ? 'Speaking...' : 'Voice Coach'}
      </button>
      <button
        onClick={() => setMuted(!muted)}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          muted ? 'bg-destructive/15 text-destructive' : 'bg-secondary text-muted-foreground hover:text-foreground'
        }`}
        title={muted ? 'Unmute voice coach' : 'Mute voice coach'}
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
