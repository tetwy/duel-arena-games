import test from 'node:test';
import assert from 'node:assert/strict';

test('Harfbaz scoring rules: unique answer gives 10 points, duplicate gives 5, veto gives 0', () => {
  const calculateCategoryScore = (answers, vetoPlayerIds) => {
    const answerCounts = {};
    for (const [playerId, ans] of Object.entries(answers)) {
      const clean = (ans || '').trim().toLowerCase();
      if (clean && !vetoPlayerIds.has(playerId)) {
        answerCounts[clean] = (answerCounts[clean] || 0) + 1;
      }
    }

    const scores = {};
    for (const [playerId, ans] of Object.entries(answers)) {
      const clean = (ans || '').trim().toLowerCase();
      if (!clean || vetoPlayerIds.has(playerId)) {
        scores[playerId] = 0;
      } else if (answerCounts[clean] === 1) {
        scores[playerId] = 10; // Unique
      } else {
        scores[playerId] = 5; // Duplicate
      }
    }
    return scores;
  };

  const answers = {
    p1: 'Elma',
    p2: 'Armut',
    p3: 'Elma',
    p4: 'Muz',
  };
  const vetoes = new Set(['p4']);

  const result = calculateCategoryScore(answers, vetoes);

  assert.equal(result.p1, 5, 'Duplicate answer should receive 5 points');
  assert.equal(result.p2, 10, 'Unique answer should receive 10 points');
  assert.equal(result.p3, 5, 'Duplicate answer should receive 5 points');
  assert.equal(result.p4, 0, 'Vetoed player should receive 0 points');
});

test('Veto score calculation: increments score and respects target score boundary', () => {
  const targetScore = 25;
  let teamAScore = 24;

  const scorePoint = (current) => current + 1;
  const isGameOver = (score, target) => score >= target;

  teamAScore = scorePoint(teamAScore);
  assert.equal(teamAScore, 25);
  assert.equal(isGameOver(teamAScore, targetScore), true, 'Team reaching target score triggers game over');
});
