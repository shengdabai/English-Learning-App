import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getReadingMaterials, generateComprehensionQuestions, scoreComprehensionQuiz,
} from '../src/services/readingService.js';
import {
  startLearningSession, endLearningSession,
} from '../src/services/userService.js';

for (const level of ['beginner', 'intermediate']) {
  for (const material of getReadingMaterials(level)) {
    test(`${material.id}: answerable questions match the supplied passage`, () => {
      const questions = generateComprehensionQuestions(material.content);
      assert.equal(questions.length, material.questions.length);
      questions.forEach((question, index) => {
        assert.equal(question.question, material.questions[index].question);
        assert.equal(question.options[question.correctAnswer], material.questions[index].answer);
        assert.equal(new Set(question.options).size, question.options.length);
        assert.ok(question.options.length >= 2);
      });
    });
  }
}

test('correct, incorrect, unanswered and partial answers use the actual answer key', () => {
  const questions = generateComprehensionQuestions(getReadingMaterials()[0].content);
  const answers = Object.fromEntries(questions.map((q, i) => [i, q.correctAnswer]));
  assert.deepEqual(scoreComprehensionQuiz(questions, answers), {
    score: 100, correctAnswers: 3, totalQuestions: 3,
  });
  assert.equal(scoreComprehensionQuiz(questions, { 0: questions[0].correctAnswer }).score, 33);
  const incorrect = Object.fromEntries(questions.map((q, i) => [i, (q.correctAnswer + 1) % q.options.length]));
  assert.equal(scoreComprehensionQuiz(questions, incorrect).score, 0);
  assert.equal(scoreComprehensionQuiz(questions, {}).score, 0);
  assert.equal(scoreComprehensionQuiz([], {}).score, 0);
});

test('unknown content has no invented quiz or awarded score', () => {
  assert.deepEqual(generateComprehensionQuestions(
    'This unknown passage has a long opening sentence. Another unfamiliar sentence provides enough detail. A third sentence gives the old generator enough material.'
  ), []);
});

test('a directly opened reading activity can persist its score exactly once', () => {
  const storage = new Map();
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  try {
    localStorage.setItem('english_learning_user_profile', JSON.stringify({
      totalMinutes: 0, sessions: [], achievements: [], streak: 0,
    }));
    startLearningSession('reading');
    const profile = endLearningSession(67);
    assert.equal(profile.sessions.length, 1);
    assert.equal(profile.sessions[0].score, 67);
    assert.equal(profile.sessions[0].type, 'reading');
    assert.equal(endLearningSession(67), null);
    assert.equal(JSON.parse(localStorage.getItem('english_learning_user_profile')).sessions.length, 1);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});


test('shuffled choices preserve the answer key without changing passage data', () => {
  const material = getReadingMaterials()[0];
  const before = JSON.stringify(material);
  const originalRandom = Math.random;
  try {
    Math.random = () => 0;
    const questions = generateComprehensionQuestions(material.content);
    assert.ok(questions.some((question, index) => question.correctAnswer !== index));
    questions.forEach((question, index) => {
      assert.equal(question.options[question.correctAnswer], material.questions[index].answer);
    });
    assert.equal(scoreComprehensionQuiz(questions, { 0: 0, 1: 1, 2: 2 }).score, 0);
    assert.equal(scoreComprehensionQuiz(questions,
      Object.fromEntries(questions.map((question, index) => [index, question.correctAnswer]))).score, 100);
    assert.equal(JSON.stringify(material), before);
  } finally {
    Math.random = originalRandom;
  }
});
