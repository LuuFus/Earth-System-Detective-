/// <reference lib="webworker" />
// Per-cell trend over a year range: Theil-Sen slope (degC per decade) and the
// Mann-Kendall test with the tie correction (two-sided p-value, normal approximation).

type Request = {
  id: number;
  data: Int8Array;
  cells: number;
  startYear: number;
  from: number;
  to: number;
  scale: number;
  missing: number;
};

export type TrendResult = {
  id: number;
  slope: Float32Array;
  pValue: Float32Array;
};

/** Minimum share of years with data for a cell to get a trend. */
const MIN_COVERAGE = 0.7;

function erf(x: number): number {
  // Abramowitz and Stegun 7.1.26
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return sign * y;
}

function quickselect(arr: Float64Array, n: number, k: number): number {
  let left = 0;
  let right = n - 1;
  while (left < right) {
    const pivot = arr[(left + right) >> 1];
    let i = left;
    let j = right;
    while (i <= j) {
      while (arr[i] < pivot) i++;
      while (arr[j] > pivot) j--;
      if (i <= j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        i++;
        j--;
      }
    }
    if (k <= j) right = j;
    else if (k >= i) left = i;
    else return arr[k];
  }
  return arr[k];
}

function median(arr: Float64Array, n: number): number {
  if (n % 2) return quickselect(arr, n, n >> 1);
  const hi = quickselect(arr, n, n >> 1);
  let lo = -Infinity;
  for (let i = 0; i < n >> 1; i++) if (arr[i] > lo) lo = arr[i];
  return (lo + hi) / 2;
}

self.onmessage = (event: MessageEvent<Request>) => {
  const { id, data, cells, startYear, from, to, scale, missing } = event.data;
  const span = to - from + 1;
  const slope = new Float32Array(cells).fill(NaN);
  const pValue = new Float32Array(cells).fill(NaN);
  const xs = new Float64Array(span);
  const ys = new Float64Array(span);
  const slopes = new Float64Array((span * (span - 1)) / 2);
  const counts = new Map<number, number>();

  for (let c = 0; c < cells; c++) {
    let n = 0;
    for (let year = from; year <= to; year++) {
      const v = data[(year - startYear) * cells + c];
      if (v !== missing) {
        xs[n] = year;
        ys[n] = v * scale;
        n++;
      }
    }
    if (n < 10 || n < span * MIN_COVERAGE) continue;

    let s = 0;
    let k = 0;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = ys[j] - ys[i];
        s += d > 0 ? 1 : d < 0 ? -1 : 0;
        slopes[k++] = d / (xs[j] - xs[i]);
      }
    }

    counts.clear();
    for (let i = 0; i < n; i++) counts.set(ys[i], (counts.get(ys[i]) ?? 0) + 1);
    let ties = 0;
    counts.forEach((t) => {
      if (t > 1) ties += t * (t - 1) * (2 * t + 5);
    });
    const variance = (n * (n - 1) * (2 * n + 5) - ties) / 18;
    const z = s > 0 ? (s - 1) / Math.sqrt(variance) : s < 0 ? (s + 1) / Math.sqrt(variance) : 0;
    pValue[c] = 1 - erf(Math.abs(z) / Math.SQRT2);
    slope[c] = median(slopes, k) * 10;
  }

  const result: TrendResult = { id, slope, pValue };
  (self as unknown as Worker).postMessage(result, [slope.buffer, pValue.buffer]);
};
