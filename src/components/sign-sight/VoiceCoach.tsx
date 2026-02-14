import { useState, useCallback, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import type { GestureStatus } from '@/lib/gesture-engine';

interface VoiceCoachProps {
  feedback: string[];
  currentLetter: string;
  status: GestureStatus;
  isTracking: boolean;
}

// Varied phrases to keep the AI feeling alive
const CORRECT_PHRASES = [
  'Perfect! Great job!',
  'Excellent! You nailed it!',
  'That\'s right! Well done!',
  'Amazing! Keep it up!',
  'Wonderful! You\'re getting better!',
  'Spot on! Nice work!',
];

const NO_HAND_PHRASES = [
  'I can\'t see your hand. Please show it to the camera.',
  'Where did your hand go? Hold it up so I can see it.',
  'Please position your hand in front of the camera.',
];

const ENCOURAGE_PHRASES = [
  'You\'re doing great, keep trying!',
  'Don\'t give up, you\'re almost there!',
  'Keep at it, practice makes perfect!',
];

function pickRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
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
  const lastFeedbackKeyRef = useRef('');
  const speakingRef = useRef(false);
  const incorrectSinceRef = useRef<number>(0); // timestamp when incorrect started
  const lastEncourageRef = useRef<number>(0); // timestamp of last encouragement

  const speak = useCallback(async (text: string) => {
    if (muted || !text) return;

    // If already speaking, queue the latest
    if (speakingRef.current) {
      speakQueueRef.current = text;
      return;
    }

    lastSpokenRef.current = text;
    speakingRef.current = true;
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
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        speakingRef.current = false;
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        // Play queued message after a short pause
        if (speakQueueRef.current) {
          const queued = speakQueueRef.current;
          speakQueueRef.current = null;
          setTimeout(() => speak(queued), 400);
        }
      };
      audio.onerror = () => {
        speakingRef.current = false;
        setIsSpeaking(false);
      };
      await audio.play();
    } catch (e) {
      console.error('Voice coach error:', e);
      speakingRef.current = false;
      setIsSpeaking(false);
    }
  }, [muted]);

  // Greet when camera starts
  useEffect(() => {
    if (isTracking && !hasGreetedRef.current && !muted) {
      hasGreetedRef.current = true;
      speak(`Welcome to Sign Sight! Show your hand to the camera and let's practice the letter ${currentLetter}. I'll guide you through it.`);
    }
    if (!isTracking) {
      hasGreetedRef.current = false;
    }
  }, [isTracking, muted, currentLetter, speak]);

  // Reactive coaching on status/feedback changes
  useEffect(() => {
    if (!isTracking || muted) return;

    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    clearTimeout(debounceRef.current);

    const feedbackKey = feedback.join('|');
    const feedbackChanged = feedbackKey !== lastFeedbackKeyRef.current;
    lastFeedbackKeyRef.current = feedbackKey;

    // ---- NO HAND ----
    if (status === 'no-hand' && prev !== 'no-hand') {
      incorrectSinceRef.current = 0;
      debounceRef.current = setTimeout(() => {
        speak(pickRandom(NO_HAND_PHRASES));
      }, 2000);
      return;
    }

    // ---- CORRECT ----
    if (status === 'correct' && prev !== 'correct') {
      incorrectSinceRef.current = 0;
      speak(pickRandom(CORRECT_PHRASES));
      return;
    }

    // ---- CLOSE ----
    if (status === 'close') {
      if (prev !== 'close' || feedbackChanged) {
        debounceRef.current = setTimeout(() => {
          const tips = feedback.filter(f => !f.includes('Almost') && !f.includes('Perfect'));
          if (tips.length > 0) {
            speak(`Almost there! ${tips[0]}. Just a small adjustment.`);
          } else {
            speak('You\'re very close! Keep adjusting your hand.');
          }
        }, 1800);
      }
      return;
    }

    // ---- INCORRECT ----
    if (status === 'incorrect') {
      const now = Date.now();
      const tips = feedback.filter(f => !f.includes('Almost') && !f.includes('Perfect'));

      if (prev !== 'incorrect') {
        // Just transitioned to incorrect — give immediate specific feedback
        incorrectSinceRef.current = now;
        lastEncourageRef.current = now;
        debounceRef.current = setTimeout(() => {
          if (tips.length > 0) {
            speak(`Not quite right. ${tips[0]}. ${tips.length > 1 ? `Also, ${tips[1].toLowerCase()}.` : ''}`);
          } else {
            speak('That doesn\'t look right. Check the reference image and try again.');
          }
        }, 1200);
      } else if (feedbackChanged) {
        // Feedback changed while still incorrect — user is adjusting, give updated tips
        debounceRef.current = setTimeout(() => {
          if (tips.length > 0) {
            speak(`Try to ${tips[0].toLowerCase()}.`);
          }
        }, 2000);
      } else if (incorrectSinceRef.current > 0 && (now - lastEncourageRef.current) > 8000) {
        // User stuck for 8+ seconds — give encouragement
        lastEncourageRef.current = now;
        debounceRef.current = setTimeout(() => {
          if (tips.length > 0) {
            speak(`${pickRandom(ENCOURAGE_PHRASES)} Focus on this: ${tips[0].toLowerCase()}.`);
          }
        }, 500);
      }
      return;
    }
  }, [status, feedback, isTracking, muted, speak]);

  // Auto-announce letter changes
  useEffect(() => {
    if (!isTracking || muted) return;
    if (currentLetter !== prevLetterRef.current) {
      prevLetterRef.current = currentLetter;
      incorrectSinceRef.current = 0;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        speak(`Next up: the letter ${currentLetter}. Show me the sign!`);
      }, 600);
    }
  }, [currentLetter, isTracking, muted, speak]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          const text = feedback.length > 0
            ? feedback.slice(0, 3).join('. ')
            : `Show the sign for letter ${currentLetter}`;
          speak(text);
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
        onClick={() => {
          setMuted(!muted);
          if (audioRef.current && !muted) {
            audioRef.current.pause();
            audioRef.current = null;
            speakingRef.current = false;
            setIsSpeaking(false);
          }
        }}
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
