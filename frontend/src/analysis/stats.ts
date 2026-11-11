// Trend statistics for a yearly series: Theil-Sen slope with its confidence interval,
// the Mann-Kendall test, ordinary least squares with a t-test, and the Weatherhead et al.
// (1998) estimate of how many years a trend needs before it can be detected.

export type Point = { x: number; y: number };

export type TrendStats = {
  n: number;
  /** Theil-Sen slope, units per year. */
  sen: number;
  senIntercept: number;
  /** 95% confidence interval of the Theil-Sen slope (Gilbert 1987), units per year. */
  senLow: number;
  senHigh: number;
  /** Mann-Kendall S, its z-score and two-sided p-value (tie-corrected variance). */
  mkS: number;
  mkZ: number;
  mkP: number;
  /** Least-squares slope (units per year), its t statistic and two-sided p-value. */
  olsSlope: number;
  olsIntercept: number;
  olsT: number;
  olsP: number;
  r2: number;
  /** Lag-1 autocorrelation of the least-squares residuals. */
  phi: number;
  /** Standard deviation of the residuals. */
  residualSd: number;
  /** Mean of the years and their sum of squared deviations, for prediction intervals. */
  xMean: number;
  sxx: number;
  /** Total years needed to detect the trend (Weatherhead 1998), or null if no trend. */
  yearsNeeded: number | null;
};

export type Verdict = 'significant' | 'weak' | 'insufficient';

export const ALPHA = 0.05;
export const MIN_YEARS = 10;

const Z975 = 1.959963984540054;

export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  // Abramowitz and Stegun 7.1.26, error below 1.5e-7.
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return sign * y;
}

function logGamma(x: number): number {
  // Lanczos approximation.
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Regularised incomplete beta I_x(a, b) by continued fraction (Numerical Recipes 6.4). */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x > (a + 1) / (a + b + 2)) return 1 - incompleteBeta(1 - x, b, a);
  let f = 1;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  f = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    f *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-12) break;
  }
  return (front * f) / a;
}

/** Two-sided p-value of Student's t with `df` degrees of freedom. */
export function studentTwoSided(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return NaN;
  return incompleteBeta(df / (df + t * t), df / 2, 0.5);
}

function median(sorted: number[]): number {
  const n = sorted.length;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

export function trendStats(points: Point[]): TrendStats | null {
  const pts = points.filter((p) => Number.isFinite(p.y));
  const n = pts.length;
  if (n < 3) return null;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);

  // Mann-Kendall and pairwise slopes
  let s = 0;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = ys[j] - ys[i];
      s += d > 0 ? 1 : d < 0 ? -1 : 0;
      slopes.push(d / (xs[j] - xs[i]));
    }
  }
  const counts = new Map<number, number>();
  ys.forEach((y) => counts.set(y, (counts.get(y) ?? 0) + 1));
  let ties = 0;
  counts.forEach((t) => {
    if (t > 1) ties += t * (t - 1) * (2 * t + 5);
  });
  const varS = (n * (n - 1) * (2 * n + 5) - ties) / 18;
  const mkZ = s > 0 ? (s - 1) / Math.sqrt(varS) : s < 0 ? (s + 1) / Math.sqrt(varS) : 0;
  const mkP = 2 * (1 - normalCdf(Math.abs(mkZ)));

  slopes.sort((a, b) => a - b);
  const sen = median(slopes);
  const senIntercept = median(xs.map((x, i) => ys[i] - sen * x).sort((a, b) => a - b));
  // Gilbert (1987): ranks of the slope CI from the MK variance.
  const nSlopes = slopes.length;
  const cAlpha = Z975 * Math.sqrt(varS);
  const m1 = Math.round((nSlopes - cAlpha) / 2);
  const m2 = Math.round((nSlopes + cAlpha) / 2) + 1;
  const senLow = slopes[Math.min(nSlopes - 1, Math.max(0, m1 - 1))];
  const senHigh = slopes[Math.min(nSlopes - 1, Math.max(0, m2 - 1))];

  // Least squares and t-test
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
    syy += (ys[i] - my) ** 2;
  }
  const olsSlope = sxy / sxx;
  const olsIntercept = my - olsSlope * mx;
  const residuals = ys.map((y, i) => y - (olsIntercept + olsSlope * xs[i]));
  const sse = residuals.reduce((a, r) => a + r * r, 0);
  const df = n - 2;
  const se = Math.sqrt(sse / df / sxx);
  const olsT = olsSlope / se;
  const olsP = studentTwoSided(olsT, df);
  const r2 = syy > 0 ? 1 - sse / syy : 0;

  // Residual noise and lag-1 autocorrelation
  const residualSd = Math.sqrt(sse / df);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    den += residuals[i] ** 2;
    if (i > 0) num += residuals[i] * residuals[i - 1];
  }
  const phi = den > 0 ? Math.max(-0.95, Math.min(0.95, num / den)) : 0;

  // Weatherhead et al. (1998): n* = [3.3 sigma / |omega| * sqrt((1 + phi) / (1 - phi))]^(2/3)
  const yearsNeeded =
    Math.abs(sen) > 0 ? Math.pow(((3.3 * residualSd) / Math.abs(sen)) * Math.sqrt((1 + phi) / (1 - phi)), 2 / 3) : null;

  return {
    n,
    sen,
    senIntercept,
    senLow,
    senHigh,
    mkS: s,
    mkZ,
    mkP,
    olsSlope,
    olsIntercept,
    olsT,
    olsP,
    r2,
    phi,
    residualSd,
    xMean: mx,
    sxx,
    yearsNeeded: yearsNeeded !== null && Number.isFinite(yearsNeeded) ? yearsNeeded : null,
  };
}

export function verdict(stats: TrendStats | null): Verdict {
  if (!stats || stats.n < MIN_YEARS) return 'insufficient';
  return stats.mkP < ALPHA ? 'significant' : 'weak';
}

/** Years still missing before the trend is likely detectable, if it carries on as it is. */
export function yearsStillNeeded(stats: TrendStats | null): number | null {
  if (!stats) return null;
  const forTest = Math.max(0, MIN_YEARS - stats.n);
  if (stats.yearsNeeded === null) return forTest || null;
  return Math.max(forTest, Math.ceil(stats.yearsNeeded - stats.n));
}

/** Student t quantile: the t with two-sided p-value `p` (bisection on the exact distribution). */
export function studentQuantile(p: number, df: number): number {
  let lo = 0;
  let hi = 200;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (studentTwoSided(mid, df) > p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type Band = { x: number; mid: number; low: number; high: number };

/**
 * Where a single year is likely to fall if the trend goes on: the Theil-Sen line, with the 95%
 * least-squares prediction interval around it, t * s * sqrt(1 + 1/n + (x - mean)^2 / Sxx).
 * Not a weather forecast: it only continues the measured trend.
 */
export function trendBand(stats: TrendStats, x: number): Band {
  const mid = stats.senIntercept + stats.sen * x;
  const t = studentQuantile(ALPHA, stats.n - 2);
  const half = t * stats.residualSd * Math.sqrt(1 + 1 / stats.n + (x - stats.xMean) ** 2 / stats.sxx);
  return { x, mid, low: mid - half, high: mid + half };
}

/** The same for one value of a series: its trend over the points, carried on to `x`. */
export function forecastAt(points: Point[], x: number): Band | null {
  const stats = trendStats(points);
  return stats && stats.n >= MIN_YEARS ? trendBand(stats, x) : null;
}
