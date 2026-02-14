import { useState, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

export function VoiceCoach({ feedback, currentLetter }: { feedback: string[]; currentLetter: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenRef = useRef('');

  const speak = useCallback(async (text: string) => {
    if (muted || !text || text === lastSpokenRef.current) return;
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
      audio.onended = () => setIsSpeaking(false);
      await audio.play();
    } catch (e) {
      console.error('Voice coach error:', e);
      setIsSpeaking(false);
    }
  }, [muted]);

  const speakFeedback = useCallback(() => {
    const text = feedback.length > 0 
      ? feedback.slice(0, 3).join('. ')
      : `Show the sign for letter ${currentLetter}`;
    speak(text);
  }, [feedback, currentLetter, speak]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={speakFeedback}
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
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
