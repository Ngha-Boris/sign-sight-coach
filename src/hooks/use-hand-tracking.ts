import { useRef, useState, useCallback, useEffect } from 'react';
import type { Landmark } from '@/lib/gesture-engine';

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);

  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const drawLandmarks = useCallback((lm: Landmark[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = 'rgba(0, 210, 180, 0.5)';
    ctx.lineWidth = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
      ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
      ctx.stroke();
    }

    // Draw joints
    for (const point of lm) {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(172, 66%, 50%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(172, 80%, 70%)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, []);

  const startTracking = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.tflite',
          delegate: 'GPU',
        },
        numHands: 1,
        runningMode: 'VIDEO',
      });

      handLandmarkerRef.current = handLandmarker;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsTracking(true);
      setIsLoading(false);

      // Detection loop
      const runLoop = () => {
        const video = videoRef.current;
        const hl = handLandmarkerRef.current;
        if (!video || !hl || video.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(runLoop);
          return;
        }

        try {
          const results = hl.detectForVideo(video, performance.now());
          if (results.landmarks && results.landmarks.length > 0) {
            const lm = results.landmarks[0] as Landmark[];
            drawLandmarks(lm);
            // Throttle state updates for performance
            frameCountRef.current++;
            if (frameCountRef.current % 3 === 0) {
              setLandmarks(lm);
            }
          } else {
            setLandmarks(null);
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        } catch {
          // Skip frame
        }

        animFrameRef.current = requestAnimationFrame(runLoop);
      };

      animFrameRef.current = requestAnimationFrame(runLoop);
    } catch (e: any) {
      console.error('Failed to start tracking:', e);
      setError(e.message || 'Could not access camera');
      setIsLoading(false);
    }
  }, [drawLandmarks]);

  const stopTracking = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    handLandmarkerRef.current = null;
    setIsTracking(false);
    setLandmarks(null);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, canvasRef, isTracking, isLoading, landmarks, error, startTracking, stopTracking };
}
