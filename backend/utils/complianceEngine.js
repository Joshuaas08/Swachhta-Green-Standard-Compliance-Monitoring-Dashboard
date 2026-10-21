/**
 * Compliance Engine & Dynamic Score Calculation Utility
 *
 * Formula:
 * Compliance Score % = (Sum of (Item Weight * Status Multiplier) / Total Weight) * 100
 * Multipliers:
 *  PASS: 1.0
 *  PARTIAL: 0.5
 *  FAIL: 0.0
 *
 * Classifications:
 *  90 - 100%: Excellent (🟢)
 *  75 - 89% : Good (🟢)
 *  60 - 74% : Needs Improvement (🟡)
 *  0  - 59% : Poor (🔴)
 */

const STATUS_MULTIPLIERS = {
  PASS: 1.0,
  PARTIAL: 0.5,
  FAIL: 0.0,
};

const CLASSIFICATIONS = {
  EXCELLENT: {
    label: 'Excellent',
    color: 'green',
    icon: '🟢',
    min: 90,
    max: 100,
  },
  GOOD: {
    label: 'Good',
    color: 'emerald',
    icon: '🟢',
    min: 75,
    max: 89.99,
  },
  NEEDS_IMPROVEMENT: {
    label: 'Needs Improvement',
    color: 'amber',
    icon: '🟡',
    min: 60,
    max: 74.99,
  },
  POOR: {
    label: 'Poor',
    color: 'red',
    icon: '🔴',
    min: 0,
    max: 59.99,
  },
};

/**
 * Classify a percentage score into rating tiers
 * @param {number} score 
 * @returns {object} { key, label, color, icon }
 */
const classifyScore = (score) => {
  const rounded = Math.round(score * 10) / 10;
  if (rounded >= 90) return { key: 'EXCELLENT', ...CLASSIFICATIONS.EXCELLENT };
  if (rounded >= 75) return { key: 'GOOD', ...CLASSIFICATIONS.GOOD };
  if (rounded >= 60) return { key: 'NEEDS_IMPROVEMENT', ...CLASSIFICATIONS.NEEDS_IMPROVEMENT };
  return { key: 'POOR', ...CLASSIFICATIONS.POOR };
};

/**
 * Calculate dynamic compliance score from evaluated checklist items
 * @param {Array<{ weight: number, status: 'PASS'|'PARTIAL'|'FAIL', category?: string }>} items
 * @returns {{
 *   totalScore: number,
 *   rating: object,
 *   totalWeight: number,
 *   earnedPoints: number,
 *   itemCounts: { pass: number, partial: number, fail: number, total: number },
 *   categoryBreakdown: Record<string, { totalWeight: number, earnedPoints: number, score: number, rating: object }>
 * }}
 */
const calculateComplianceScore = (items = []) => {
  if (!items || items.length === 0) {
    return {
      totalScore: 0,
      rating: classifyScore(0),
      totalWeight: 0,
      earnedPoints: 0,
      itemCounts: { pass: 0, partial: 0, fail: 0, total: 0 },
      categoryBreakdown: {},
    };
  }

  let totalWeight = 0;
  let earnedPoints = 0;
  const itemCounts = { pass: 0, partial: 0, fail: 0, total: items.length };
  const categories = {};

  items.forEach((item) => {
    const weight = Number(item.weight) || 1;
    const status = (item.status || 'FAIL').toUpperCase();
    const multiplier = STATUS_MULTIPLIERS.hasOwnProperty(status) ? STATUS_MULTIPLIERS[status] : 0.0;
    const points = weight * multiplier;

    totalWeight += weight;
    earnedPoints += points;

    if (status === 'PASS') itemCounts.pass++;
    else if (status === 'PARTIAL') itemCounts.partial++;
    else itemCounts.fail++;

    const cat = item.category || 'General';
    if (!categories[cat]) {
      categories[cat] = { totalWeight: 0, earnedPoints: 0, passCount: 0, failCount: 0, partialCount: 0 };
    }
    categories[cat].totalWeight += weight;
    categories[cat].earnedPoints += points;
    if (status === 'PASS') categories[cat].passCount++;
    else if (status === 'PARTIAL') categories[cat].partialCount++;
    else categories[cat].failCount++;
  });

  const totalScore = totalWeight > 0 ? Math.round((earnedPoints / totalWeight) * 100 * 10) / 10 : 0;
  const rating = classifyScore(totalScore);

  const categoryBreakdown = {};
  for (const [catName, data] of Object.entries(categories)) {
    const catScore = data.totalWeight > 0 ? Math.round((data.earnedPoints / data.totalWeight) * 100 * 10) / 10 : 0;
    categoryBreakdown[catName] = {
      totalWeight: data.totalWeight,
      earnedPoints: data.earnedPoints,
      score: catScore,
      rating: classifyScore(catScore),
      passCount: data.passCount,
      partialCount: data.partialCount,
      failCount: data.failCount,
    };
  }

  return {
    totalScore,
    rating,
    totalWeight,
    earnedPoints,
    itemCounts,
    categoryBreakdown,
  };
};

module.exports = {
  STATUS_MULTIPLIERS,
  CLASSIFICATIONS,
  classifyScore,
  calculateComplianceScore,
};
