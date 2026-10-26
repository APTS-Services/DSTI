// Answers must be composed from published site content and cite source pages.
// Run with: npm test (node --test) in frontend/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ask, suggestions } from '../src/utils/assistant.js';

const seed = JSON.parse(readFileSync(fileURLToPath(new URL('../../backend/seed/content.json', import.meta.url)), 'utf8'));
const data = { collections: seed.collections, settings: seed.settings };
const documents = data.collections.documents;

test('RTI question is answered from the RTI page and names the PIO', () => {
  const a = ask(data, 'How do I file an RTI request?');
  assert.equal(a.matched, true);
  assert.equal(a.intent, 'rti');
  assert.equal(a.sources[0].path, '/ecitizen/rti');
  assert.match(a.lead, /Right to Information Act, 2005/i);
  assert.ok(a.bullets.some((b) => /pio-dsti@ap\.gov\.in/.test(b.value)), 'PIO contact is quoted from the officers list');
});

test('tender answers are built from live tender records, open first', () => {
  const open = data.collections.tenders.filter((t) => t.status === 'open');
  const a = ask(data, 'Show me the open tenders');
  assert.equal(a.intent, 'tenders');
  assert.match(a.lead, new RegExp(`\\b${open.length} open tenders?\\b`));
  assert.equal(a.bullets.length, Math.min(4, open.length));
  assert.ok(a.sources.some((s) => s.path.startsWith('/tenders')));
  const closed = ask(data, 'What about the closed ones?', 'en', { previousIntent: 'tenders' });
  assert.match(closed.lead, /closed tenders/);
});

test('a named district returns its published profile', () => {
  const a = ask(data, 'Which institutions are in Tirupati?');
  assert.equal(a.intent, 'districts');
  assert.match(a.lead, /Tirupati district/);
  assert.ok(a.bullets.some((b) => b.value === 'IIT Tirupati'));
  assert.equal(a.sources[0].path, '/districts?district=tirupati');
});

test('district questions are matched against institution and activity text', () => {
  const a = ask(data, 'Which districts have space-tech institutions?');
  assert.equal(a.matched, true);
  assert.equal(a.intent, 'districts');
  assert.ok(a.bullets.some((b) => /space/i.test(b.value)), 'the matching activity is quoted');
});

test('contact answer quotes the contact settings', () => {
  const a = ask(data, 'How can I contact the department?');
  assert.equal(a.intent, 'contact');
  assert.ok(a.bullets.some((b) => b.value.includes(data.settings.contact.phone)));
  assert.ok(a.bullets.some((b) => b.value.includes(data.settings.contact.email)));
  assert.deepEqual(a.sources.map((s) => s.path).slice(0, 1), ['/contact']);
});

test('content questions cite the page that holds the answer', () => {
  const a = ask(data, 'What is the Drone Policy?');
  assert.equal(a.matched, true);
  assert.equal(a.sources[0].path, '/policies/drone');
  assert.match(a.lead.toLowerCase(), /drone/);
});

test('policy documents return document-page sources', () => {
  const a = ask(data, 'Show the government orders');
  assert.equal(a.intent, 'documents');
  const go = documents.filter((d) => d.type === 'go');
  assert.match(a.lead, new RegExp(`\\b${go.length} government orders\\b`));
  assert.equal(a.sources[0].path, '/ecitizen/government-orders');
});

test('intent keywords match whole words, not fragments of them', () => {
  const a = ask(data, 'How can students participate in science fairs?');
  assert.notEqual(a.intent, 'rti', '"participate" is not an RTI question');
  assert.equal(a.matched, true);
  assert.ok(!a.sources.some((s) => s.path === '/ecitizen/rti'));
});

test('Telugu questions are answered in Telugu', () => {
  const a = ask(data, 'RTI దరఖాస్తు ఎలా చేయాలి?', 'te');
  assert.equal(a.matched, true);
  assert.equal(a.sources[0].path, '/ecitizen/rti');
  assert.match(a.lead, /[\u0c00-\u0c7f]/);
});

test('every cited source is a page on this website', () => {
  const questions = [
    'What does the department do?',
    'Tell me about the organisations',
    'How do I contact the department?',
    'Show the open tenders',
    'Which districts have science centres?',
    'What is the investment incentive?',
    'When is the next event?',
    'Show the latest news',
    'RTI', 'hello',
  ];
  for (const q of questions) {
    const a = ask(data, q);
    if (!a.matched) continue;
    assert.ok(a.sources.length > 0, `${q} has sources`);
    for (const s of a.sources) {
      assert.ok(s.path.startsWith('/') && !s.path.startsWith('//'), `${q}: ${s.path} is internal`);
      assert.ok(s.title.length > 0, `${q}: source has a title`);
    }
    assert.ok(a.lead.length > 0, `${q}: has an answer`);
  }
});

test('unknown questions are not invented', () => {
  const a = ask(data, 'xyzzy plugh');
  assert.equal(a.matched, false);
  assert.deepEqual(a.sources, []);

  for (const previousIntent of ['districts', 'rti', 'tenders', 'contact', 'capabilities']) {
    const afterConversation = ask(data, 'xyzzy plugh', 'en', {
      previous: 'Which institutions are in Tirupati?',
      previousIntent,
    });
    assert.equal(afterConversation.matched, false, `a ${previousIntent} thread does not make gibberish answerable`);
  }
});

test('opening suggestions come from published content', () => {
  const chips = suggestions(data, 'en');
  assert.ok(chips.length >= 2);
  const faqQuestions = data.collections.faqs.map((f) => f.q.en);
  assert.ok(chips.some((c) => faqQuestions.includes(c)));
});
