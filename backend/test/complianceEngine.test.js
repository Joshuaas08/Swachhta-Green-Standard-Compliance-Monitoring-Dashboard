const assert = require('assert');
const { calculateComplianceScore, classifyScore } = require('../utils/complianceEngine');

console.log('🧪 Testing Compliance Engine & Dynamic Scoring Logic...');

// Test 1: All PASS items
const itemsAllPass = [
  { weight: 5, status: 'PASS' },
  { weight: 4, status: 'PASS' },
  { weight: 3, status: 'PASS' },
];
// Total weight = 12, earned = 5*1 + 4*1 + 3*1 = 12 -> 100% EXCELLENT
const res1 = calculateComplianceScore(itemsAllPass);
assert.strictEqual(res1.totalScore, 100);
assert.strictEqual(res1.rating.key, 'EXCELLENT');
console.log('  ✅ Test 1 Passed: 100% score classified as EXCELLENT');

// Test 2: Weighted mix with PASS, PARTIAL, FAIL
// Item 1: weight 5, PASS -> 5 * 1.0 = 5.0
// Item 2: weight 4, PARTIAL -> 4 * 0.5 = 2.0
// Item 3: weight 5, FAIL -> 5 * 0.0 = 0.0
// Item 4: weight 2, PASS -> 2 * 1.0 = 2.0
// Total weight = 5 + 4 + 5 + 2 = 16
// Earned points = 5 + 2 + 0 + 2 = 9.0
// Score % = (9.0 / 16) * 100 = 56.25% -> rounded to 56.3% -> POOR
const itemsMix = [
  { weight: 5, status: 'PASS', category: 'Cleanliness' },
  { weight: 4, status: 'PARTIAL', category: 'Waste Segregation' },
  { weight: 5, status: 'FAIL', category: 'Water Conservation' },
  { weight: 2, status: 'PASS', category: 'Energy Efficiency' },
];
const res2 = calculateComplianceScore(itemsMix);
assert.strictEqual(res2.totalWeight, 16);
assert.strictEqual(res2.earnedPoints, 9);
assert.strictEqual(res2.totalScore, 56.3);
assert.strictEqual(res2.rating.key, 'POOR');
assert.strictEqual(res2.itemCounts.pass, 2);
assert.strictEqual(res2.itemCounts.partial, 1);
assert.strictEqual(res2.itemCounts.fail, 1);
console.log('  ✅ Test 2 Passed: Weighted formula and POOR classification verified');

// Test 3: 80% score -> GOOD
// Total weight: 10, points: 8 -> 80%
const itemsGood = [
  { weight: 5, status: 'PASS' },
  { weight: 3, status: 'PASS' },
  { weight: 2, status: 'FAIL' },
];
// Points: 8, weight: 10 -> 80.0%
const res3 = calculateComplianceScore(itemsGood);
assert.strictEqual(res3.totalScore, 80);
assert.strictEqual(res3.rating.key, 'GOOD');
console.log('  ✅ Test 3 Passed: 80% score classified as GOOD');

// Test 4: 70% score -> NEEDS IMPROVEMENT
const itemsNeedsImp = [
  { weight: 5, status: 'PASS' },
  { weight: 4, status: 'PARTIAL' },
  { weight: 1, status: 'FAIL' },
];
// Points: 5*1 + 4*0.5 + 0 = 7.0, weight: 10 -> 70.0%
const res4 = calculateComplianceScore(itemsNeedsImp);
assert.strictEqual(res4.totalScore, 70);
assert.strictEqual(res4.rating.key, 'NEEDS_IMPROVEMENT');
console.log('  ✅ Test 4 Passed: 70% score classified as NEEDS_IMPROVEMENT');

// Test 5: Category breakdowns
assert.strictEqual(res2.categoryBreakdown['Cleanliness'].score, 100);
assert.strictEqual(res2.categoryBreakdown['Waste Segregation'].score, 50);
assert.strictEqual(res2.categoryBreakdown['Water Conservation'].score, 0);
assert.strictEqual(res2.categoryBreakdown['Energy Efficiency'].score, 100);
console.log('  ✅ Test 5 Passed: Category breakdowns accurate');

console.log('🎉 All Compliance Engine tests passed with 100% precision!');
