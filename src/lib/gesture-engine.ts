export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type GestureStatus = 'correct' | 'close' | 'incorrect' | 'no-hand';

export interface GestureResult {
  confidence: number;
  feedback: string[];
  status: GestureStatus;
}

function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function isExtended(lm: Landmark[], tip: number, pip: number): boolean {
  return lm[tip].y < lm[pip].y;
}

function areTouching(lm: Landmark[], a: number, b: number, threshold = 0.07): boolean {
  return dist(lm[a], lm[b]) < threshold;
}

interface Check {
  passed: boolean;
  feedback: string;
  weight: number;
}

function check(passed: boolean, feedback: string, weight = 20): Check {
  return { passed, feedback, weight };
}

function scoreChecks(checks: Check[]): GestureResult {
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter(c => c.passed).reduce((s, c) => s + c.weight, 0);
  const confidence = Math.round((earned / totalWeight) * 100);
  const feedback = checks.filter(c => !c.passed).map(c => c.feedback);

  let status: GestureStatus;
  if (confidence >= 80) status = 'correct';
  else if (confidence >= 50) status = 'close';
  else status = 'incorrect';

  if (status === 'correct') feedback.unshift('Perfect! 🎉');
  else if (status === 'close') feedback.unshift('Almost there! Keep adjusting 👋');

  return { confidence, feedback, status };
}

function evalA(lm: Landmark[]): GestureResult {
  return scoreChecks([
    check(!isExtended(lm, 8, 6), 'Curl your index finger'),
    check(!isExtended(lm, 12, 10), 'Curl your middle finger'),
    check(!isExtended(lm, 16, 14), 'Curl your ring finger'),
    check(!isExtended(lm, 20, 18), 'Curl your pinky finger'),
    check(Math.abs(lm[4].x - lm[3].x) > 0.015, 'Place thumb alongside your fist'),
  ]);
}

function evalB(lm: Landmark[]): GestureResult {
  return scoreChecks([
    check(isExtended(lm, 8, 6), 'Extend your index finger up'),
    check(isExtended(lm, 12, 10), 'Extend your middle finger up'),
    check(isExtended(lm, 16, 14), 'Extend your ring finger up'),
    check(isExtended(lm, 20, 18), 'Extend your pinky finger up'),
    check(lm[4].y > lm[3].y, 'Tuck your thumb across your palm'),
  ]);
}

function evalC(lm: Landmark[]): GestureResult {
  const thumbIndexDist = dist(lm[4], lm[8]);
  return scoreChecks([
    check(thumbIndexDist > 0.04 && thumbIndexDist < 0.2, 'Curve hand into a C shape'),
    check(!isExtended(lm, 8, 6) || lm[8].y > lm[5].y - 0.12, 'Curve your index finger more'),
    check(!isExtended(lm, 12, 10) || lm[12].y > lm[9].y - 0.12, 'Curve your middle finger'),
    check(dist(lm[4], lm[20]) > 0.05, 'Open your hand slightly'),
    check(lm[4].y < lm[8].y || Math.abs(lm[4].y - lm[8].y) < 0.1, 'Align thumb with fingers'),
  ]);
}

function evalD(lm: Landmark[]): GestureResult {
  return scoreChecks([
    check(isExtended(lm, 8, 6), 'Point your index finger up'),
    check(!isExtended(lm, 12, 10), 'Curl your middle finger down'),
    check(!isExtended(lm, 16, 14), 'Curl your ring finger down'),
    check(!isExtended(lm, 20, 18), 'Curl your pinky finger down'),
    check(areTouching(lm, 4, 12, 0.09), 'Touch middle finger to thumb'),
  ]);
}

function evalE(lm: Landmark[]): GestureResult {
  return scoreChecks([
    check(!isExtended(lm, 8, 6), 'Curl your index finger down'),
    check(!isExtended(lm, 12, 10), 'Curl your middle finger down'),
    check(!isExtended(lm, 16, 14), 'Curl your ring finger down'),
    check(!isExtended(lm, 20, 18), 'Curl your pinky finger down'),
    check(lm[4].y > lm[3].y, 'Tuck thumb under your fingers'),
  ]);
}

function evalF(lm: Landmark[]): GestureResult {
  return scoreChecks([
    check(areTouching(lm, 8, 4, 0.08), 'Touch index fingertip to thumb tip'),
    check(isExtended(lm, 12, 10), 'Extend your middle finger up'),
    check(isExtended(lm, 16, 14), 'Extend your ring finger up'),
    check(isExtended(lm, 20, 18), 'Extend your pinky finger up'),
  ]);
}

const evaluators: Record<string, (lm: Landmark[]) => GestureResult> = {
  A: evalA, B: evalB, C: evalC, D: evalD, E: evalE, F: evalF,
};

export function evaluateGesture(landmarks: Landmark[] | null, targetLetter: string): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { confidence: 0, feedback: ['Show your hand to the camera'], status: 'no-hand' };
  }
  const evaluator = evaluators[targetLetter];
  if (!evaluator) return { confidence: 0, feedback: ['Select a letter to practice'], status: 'no-hand' };
  return evaluator(landmarks);
}
