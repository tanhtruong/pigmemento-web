export type Stat = {
  id: number;
  label: string;
  value: string;
  /**
   * Optional numeric target for NumberTicker. When set, the card animates the
   * value via the ticker; the displayed text is produced by `formatValue` (or
   * `String(tickerValue)` if no formatter). Independent of `percent`.
   */
  tickerValue?: number;
  formatValue?: (n: number) => string;
  /**
   * Optional 0–100 percentage that drives a `SoftCircleReveal` ring-fill next
   * to the value. Echoes the dashboard Accuracy ring; only set on stats that
   * are semantically percentage-shaped.
   */
  percent?: number;
};
