export interface GestureTemplate {
  letter: string;
  description: string;
  instructions: string[];
  emoji: string;
}

export const GESTURE_LIBRARY: GestureTemplate[] = [
  {
    letter: 'A',
    description: 'Make a fist with your thumb resting alongside',
    instructions: ['Curl all four fingers into your palm', 'Rest thumb against the side of your fist'],
    emoji: '✊',
  },
  {
    letter: 'B',
    description: 'Hold hand flat with fingers together pointing up',
    instructions: ['Extend all four fingers straight up', 'Keep fingers together', 'Tuck thumb across your palm'],
    emoji: '🖐',
  },
  {
    letter: 'C',
    description: 'Curve your hand into a C shape',
    instructions: ['Curve all fingers and thumb', 'Like holding a small ball'],
    emoji: '🤏',
  },
  {
    letter: 'D',
    description: 'Point index finger up, touch others to thumb',
    instructions: ['Extend index finger straight up', 'Curl other fingers to touch thumb tip'],
    emoji: '☝️',
  },
  {
    letter: 'E',
    description: 'Curl all fingers down with thumb tucked',
    instructions: ['Curl all four fingers toward your palm', 'Tuck thumb underneath curled fingers'],
    emoji: '✊',
  },
  {
    letter: 'F',
    description: 'Touch index to thumb, extend other fingers',
    instructions: ['Touch index fingertip to thumb tip', 'Extend middle, ring, and pinky fingers up'],
    emoji: '👌',
  },
];
