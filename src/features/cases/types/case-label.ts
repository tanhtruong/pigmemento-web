const labels = {
  benign: 'benign',
  malignant: 'malignant',
  skipped: 'skipped',
} as const;

export type Label = (typeof labels)[keyof typeof labels];
