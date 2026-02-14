import { useState } from 'react';
import { Header } from '@/components/sign-sight/Header';
import { GestureDisplay } from '@/components/sign-sight/GestureDisplay';
import { WebcamFeed } from '@/components/sign-sight/WebcamFeed';
import { FeedbackBar } from '@/components/sign-sight/FeedbackBar';
import { ScorePanel } from '@/components/sign-sight/ScorePanel';
import { VoiceCoach } from '@/components/sign-sight/VoiceCoach';
import { WordPanel } from '@/components/sign-sight/WordPanel';
import { useHandTracking } from '@/hooks/use-hand-tracking';
import { useGame, type GameMode } from '@/hooks/use-game';

const Index = () => {
  const [mode, setMode] = useState<GameMode>('learn');
  const { videoRef, canvasRef, isTracking, isLoading, landmarks, error, startTracking, stopTracking } =
    useHandTracking();
  const game = useGame(landmarks, mode);

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    game.resetGame();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode={mode} onModeChange={handleModeChange} score={game.score} streak={game.streak} />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel */}
          <div className="lg:col-span-2 space-y-4">
            {mode === 'words' ? (
              <WordPanel
                currentWord={game.currentWord}
                wordIndex={game.wordIndex}
                wordsCompleted={game.wordsCompleted}
                wordActive={game.wordActive}
                practiceTimer={game.practiceTimer}
                practiceCorrect={game.practiceCorrect}
                score={game.score}
                onStartWord={game.startWordPractice}
              />
            ) : (
              <GestureDisplay
                currentLetter={game.currentLetter}
                onSelectLetter={game.setCurrentLetter}
                completedLetters={game.completedLetters}
                mode={mode}
                status={game.status}
              />
            )}

            {/* Always show the current letter reference in word mode */}
            {mode === 'words' && game.wordActive && (
              <GestureDisplay
                currentLetter={game.currentLetter}
                onSelectLetter={() => {}}
                completedLetters={game.completedLetters}
                mode="practice"
                status={game.status}
              />
            )}

            <ScorePanel
              score={game.score}
              streak={game.streak}
              maxStreak={game.maxStreak}
              completedLetters={game.completedLetters}
              achievements={game.achievements}
              practiceActive={game.practiceActive}
              practiceTimer={game.practiceTimer}
              practiceCorrect={game.practiceCorrect}
              onStartPractice={game.startPractice}
              mode={mode}
            />
          </div>

          {/* Right panel — Camera & Feedback */}
          <div className="lg:col-span-3 space-y-4">
            <WebcamFeed
              videoRef={videoRef}
              canvasRef={canvasRef}
              isTracking={isTracking}
              isLoading={isLoading}
              confidence={game.confidence}
              status={game.status}
              error={error}
              onStart={startTracking}
              onStop={stopTracking}
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <FeedbackBar feedback={game.feedback} status={game.status} />
              </div>
              <VoiceCoach feedback={game.feedback} currentLetter={game.currentLetter} status={game.status} isTracking={isTracking} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
