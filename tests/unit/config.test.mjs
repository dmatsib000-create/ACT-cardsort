// The feedback link only accepts Google Forms addresses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedbackUrl, FEEDBACK_FORM_URL } from '../../assets/js/config.js';

test('accepts Google Forms links', () => {
  assert.equal(feedbackUrl('https://forms.gle/AbC123'), 'https://forms.gle/AbC123');
  assert.equal(feedbackUrl('  https://docs.google.com/forms/d/e/xyz/viewform  '), 'https://docs.google.com/forms/d/e/xyz/viewform');
});

test('rejects anything else', () => {
  for (const bad of ['', 'forms.gle/AbC123', 'http://forms.gle/AbC123', 'https://docs.google.com/document/d/1',
    'https://forms.gle.example.com/x', 'javascript:alert(1)', 'https://example.com/forms/']) {
    assert.equal(feedbackUrl(bad), '', bad);
  }
});

test('the shipped setting is empty or valid', () => {
  assert.ok(FEEDBACK_FORM_URL === '' || feedbackUrl(FEEDBACK_FORM_URL) !== '', 'FEEDBACK_FORM_URL is not a Google Forms link');
});
