import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Keyboard, Mic, MicOff, Loader2 } from 'lucide-react';
import { WORD_LIBRARY } from '@/lib/word-data';

interface WordPanelProps {
  currentWord: string;
  wordIndex: number;
  wordsCompleted: number;
  wordActive: boolean;
  practiceTimer: number;
  practiceCorrect: number;
  score: number;
  onStartWord: (word?: string) => void;
}

export function WordPanel({
  currentWord,
  wordIndex,
  wordsCompleted,
  wordActive,
  practiceTimer,
  practiceCorrect,
  score,
  onStartWord,
}: WordPanelProps) {
  const [customWord, setCustomWord] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const handleCustomStart = (word?: string) => {
    const input = word || customWord;
    const cleaned = input.toUpperCase().replace(/[^A-Z]/g, '');
    if (cleaned.length > 0) {
      onStartWord(cleaned);
      setCustomWord('');
      setVoiceTranscript('');
    }
  };

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('');
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceTranscript(transcript);

      // If final result, use it
      if (event.results[0].isFinal) {
        const cleaned = transcript.toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, '');
        if (cleaned.length > 0) {
          setTimeout(() => {
            handleCustomStart(cleaned);
            setIsListening(false);
          }, 500);
        }
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);

    // If we have a transcript, use it
    if (voiceTranscript) {
      handleCustomStart(voiceTranscript);
    }
  }, [voiceTranscript]);

  if (!wordActive) {
    return (
      <div className="space-y-3">
        {/* Input section */}
        <div className="glass-card border border-border/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Type or say a word to practice
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder={isListening ? (voiceTranscript || 'Listening...') : 'e.g. HELLO'}
              className="flex-1 rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomStart()}
              disabled={isListening}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCustomStart()}
              disabled={!customWord.trim() || isListening}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <Keyboard className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isListening
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : 'bg-accent border border-primary/20 text-accent-foreground hover:bg-accent/80'
              }`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </motion.button>
          </div>
          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-xs text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{voiceTranscript ? `Heard: "${voiceTranscript}"` : 'Listening... say a word'}</span>
            </div>
          )}
        </div>

        {/* Quick-start words */}
        <div className="glass-card border border-border/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Or choose a word
          </p>
          <div className="flex flex-wrap gap-2">
            {WORD_LIBRARY.slice(0, 10).map((w) => (
              <button
                key={w.word}
                onClick={() => onStartWord(w.word)}
                className="rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                title={w.hint}
              >
                {w.word}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStartWord()}
            className="mt-3 w-full rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground glow-primary"
          >
            Random Word
          </motion.button>
        </div>
      </div>
    );
  }

  // Active word practice
  const wordHint = WORD_LIBRARY.find((w) => w.word === currentWord)?.hint;

  return (
    <div className="space-y-3">
      <div className="glass-card border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Spelling: {currentWord}
          </p>
        </div>

        {wordHint && (
          <p className="text-xs text-muted-foreground mb-3 italic">"{wordHint}"</p>
        )}

        {/* Letter progress */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          <AnimatePresence>
            {currentWord.split('').map((letter, i) => {
              const isDone = i < wordIndex;
              const isCurrent = i === wordIndex;
              return (
                <motion.div
                  key={`${letter}-${i}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-heading text-lg font-bold transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground glow-primary ring-2 ring-primary/50'
                      : isDone
                      ? 'bg-success/15 text-success border border-success/30'
                      : 'bg-secondary text-muted-foreground border border-border/50'
                  }`}
                >
                  {letter}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Timer & stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{wordsCompleted} words completed</span>
          <span
            className={`font-heading text-lg font-bold ${
              practiceTimer <= 10 ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {practiceTimer}s
          </span>
        </div>

        {practiceTimer <= 0 && (
          <div className="mt-3 text-center space-y-2">
            <p className="text-sm font-semibold text-success">Time's up! 🎉</p>
            <p className="text-xs text-muted-foreground">
              Words: {wordsCompleted} | Score: {score}
            </p>
            <button
              onClick={() => onStartWord()}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
