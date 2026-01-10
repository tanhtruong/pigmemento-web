const difficulties = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
} as const;

export type Difficulty = (typeof difficulties)[keyof typeof difficulties];
