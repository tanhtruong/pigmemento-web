export type Stats = {
  totalAttempts: number;
  uniqueCasesAttempted: number;
  accuracy: number | null;
  sensitivity: number | null;
  specificity: number | null;
  firstAttemptAt?: string | null;
  lastAttemptAt?: string | null;
};
