// Checks every card in the deck against ACT's definition of a value:
// a freely chosen, desired quality of ongoing action that is never completed,
// stays within the person's control, and is not a feeling, an outcome or a rule
// (Wilson & DuFrene, 2009; Harris, 2019). See docs/VALUES-MAP.md.
//
// Run with:  node scripts/check-deck.mjs
// Exits with code 1 and lists problems if any card breaks a rule.

import { VALUES } from '../assets/js/values.js';

const RULES = [
  {
    name: 'Starts with an action, not an identity ("Being honest")',
    test: (v) => /^(being|to be|be)\b/i.test(v.desc),
  },
  {
    name: 'Describes an outcome or result rather than a quality of action',
    test: (v) => /\b(achiev\w*|success\w*|win|winning|ensur\w*|guarantee\w*|make sure|secure the|high standard|really well|perfect\w*|positive difference|get (?:it|things) right)\b/i.test(v.desc),
  },
  {
    name: 'Depends on how others respond (respected, accepted, liked, admired)',
    test: (v) => /\b(be|being|get|getting|feel|feeling) (respected|accepted|liked|loved|admired|approved|recognized|recognised|appreciated|valued)\b/i.test(v.desc)
      || /\b(recognition|approval|admiration|popularity|status|fame|reputation)\b/i.test(v.desc),
  },
  {
    name: 'Names a feeling or state as the value',
    test: (v) => /\b(happy|happiness|calm|calmly|confident|confidence|content|contentment|relaxed|peaceful|energy|energetic|stress-free|at ease)\b/i.test(v.desc),
  },
  {
    name: 'Reads as a rule, obligation or absolute standard',
    test: (v) => /\b(should|must|have to|has to|ought|obligation\w*|always|never|no one is watching|at all times|every time)\b/i.test(v.desc),
  },
  {
    name: 'Uses a circular word that assumes what is being sorted',
    test: (v) => /\b(what matters|what truly matters|what is right|what's right|worthwhile|my values)\b/i.test(v.desc),
  },
  {
    name: 'Defines the value with its own name',
    // Family is used as scope ("people I consider family"), not as a definition.
    test: (v) => !['family'].includes(v.id) && new RegExp(`\\b${v.name.toLowerCase().replace(/[-\s]+/g, '[-\\s]')}\\b`, 'i').test(v.desc),
  },
  {
    name: 'Is too long to read at a glance (over 90 characters)',
    test: (v) => v.desc.length > 90,
  },
];

const problems = [];
const ids = new Set();
for (const v of VALUES) {
  if (ids.has(v.id)) problems.push(`${v.name}: duplicate id "${v.id}"`);
  ids.add(v.id);
  if (!/[.]$/.test(v.desc)) problems.push(`${v.name}: description should be one sentence ending in a full stop`);
  for (const r of RULES) if (r.test(v)) problems.push(`${v.name}: ${r.name}\n    "${v.desc}"`);
}

if (problems.length) {
  console.error(`Deck check failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Deck check passed: all ${VALUES.length} cards describe a chosen quality of ongoing action.`);
