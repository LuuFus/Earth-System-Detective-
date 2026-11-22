"""Reference values for the trend statistics in src/analysis/stats.ts, computed independently.

Mann-Kendall S, its tie-corrected variance, z (continuity correction) and the two-sided p-value are
written out here from the textbook formulas; the Theil-Sen slope and least squares come from SciPy.
The seasonal test (Hirsch, Slack and Smith 1982) sums S and Var(S) over the months.

Run from the frontend folder:  python tests/reference/make_stats_reference.py
"""

import json
import math
from pathlib import Path

import numpy as np
from scipy import stats

OUT = Path(__file__).with_name("stats-reference.json")


def mann_kendall(y):
    y = list(y)
    n = len(y)
    s = sum(np.sign(y[j] - y[i]) for i in range(n - 1) for j in range(i + 1, n))
    _, counts = np.unique(y, return_counts=True)
    ties = sum(t * (t - 1) * (2 * t + 5) for t in counts if t > 1)
    var_s = (n * (n - 1) * (2 * n + 5) - ties) / 18
    return int(s), float(var_s)


def mk_test(s, var_s):
    sd = math.sqrt(var_s)
    z = (s - 1) / sd if s > 0 else (s + 1) / sd if s < 0 else 0.0
    return z, 2 * (1 - stats.norm.cdf(abs(z)))


def yearly(name, x, y):
    s, var_s = mann_kendall(y)
    z, p = mk_test(s, var_s)
    sen = stats.theilslopes(y, x)
    ols = stats.linregress(x, y)
    return {
        "name": name,
        "kind": "yearly",
        "x": [float(v) for v in x],
        "y": [float(v) for v in y],
        "mkS": s,
        "varS": var_s,
        "mkZ": z,
        "mkP": p,
        "sen": float(sen.slope),
        "olsSlope": float(ols.slope),
        "olsIntercept": float(ols.intercept),
        "olsP": float(ols.pvalue),
        "r2": float(ols.rvalue**2),
    }


def seasonal(name, x, y, season):
    s_total, var_total, slopes = 0, 0.0, []
    for m in sorted(set(season)):
        idx = [i for i, k in enumerate(season) if k == m]
        xs = [x[i] for i in idx]
        ys = [y[i] for i in idx]
        s, v = mann_kendall(ys)
        s_total += s
        var_total += v
        slopes += [(ys[j] - ys[i]) / (xs[j] - xs[i]) for i in range(len(ys) - 1) for j in range(i + 1, len(ys))]
    z, p = mk_test(s_total, var_total)
    return {
        "name": name,
        "kind": "seasonal",
        "x": [float(v) for v in x],
        "y": [float(v) for v in y],
        "season": season,
        "mkS": s_total,
        "varS": var_total,
        "mkZ": z,
        "mkP": p,
        "sen": float(np.median(slopes)),
    }


rng = np.random.default_rng(20261122)
cases = []

years = np.arange(1981, 2026)
# A warming series like a country's mean temperature: 0.04 °C a year and noise.
cases.append(yearly("warming", years, np.round(9 + 0.04 * (years - 1981) + rng.normal(0, 0.45, len(years)), 2)))
# No trend at all: noise only.
cases.append(yearly("noise", years, np.round(rng.normal(600, 60, len(years)), 1)))
# A falling series with many ties (values rounded to whole numbers, like days of frost).
cases.append(yearly("falling-ties", years, np.round(40 - 0.25 * (years - 1981) + rng.normal(0, 3, len(years)))))
# Short and strictly rising: S is the number of pairs.
short = np.arange(2010, 2020)
cases.append(yearly("rising-10", short, (short - 2010) * 1.5 + 3))

# Monthly values with a seasonal cycle and a small trend, for the seasonal test.
months = [(year, m) for year in range(1995, 2025) for m in range(12)]
xm = [year + (m + 0.5) / 12 for year, m in months]
ym = [round(10 - 12 * math.cos(2 * math.pi * m / 12) + 0.03 * (year - 1995) + float(rng.normal(0, 1.2)), 2) for year, m in months]
cases.append(seasonal("monthly-seasonal", xm, ym, [m for _, m in months]))

OUT.write_text(json.dumps({"generator": "tests/reference/make_stats_reference.py", "cases": cases}, indent=1), encoding="utf-8")
print(f"wrote {len(cases)} cases to {OUT}")
