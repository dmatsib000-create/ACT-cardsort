// The Lodestar values deck.
//
// Version 2 (November 2026). The deck was revised after a review of how the
// cards relate to Schwartz's circle of basic values, the science of wellbeing,
// and the linguistics and philosophy of value words (see docs/VALUES-MAP.md).
// Value names draw on the common vocabulary of ACT values work and the
// public-domain Personal Values Card Sort (Miller, C'de Baca, Matthews &
// Wilbourne, 2001). Every description is original wording, phrased as a quality
// of ongoing action, and follows the wording rules in docs/VALUES-MAP.md:
// one act and one target, verbs rather than "being", the person as the giver,
// no circular words, no absolutes, and no feelings as values.
//
// Version 3 (November 2026) split Mastery into Craft and Resourcefulness: the
// word was flagged as one some people hear through "master", and the card held
// two different ideas (see "Deck version 3" in docs/VALUES-MAP.md).

export const VALUES = [
  { id: 'acceptance', name: 'Acceptance', desc: 'Making room for feelings and situations I can\u2019t change, instead of fighting them.' },
  { id: 'adventure', name: 'Adventure', desc: 'Seeking out new experiences and exploring the unfamiliar.' },
  { id: 'assertiveness', name: 'Assertiveness', desc: 'Saying clearly what I need, while staying respectful.' },
  { id: 'authenticity', name: 'Authenticity', desc: 'Acting in ways that fit who I really am.' },
  { id: 'beauty', name: 'Beauty', desc: 'Noticing and savoring what is lovely in art, nature and everyday life.' },
  { id: 'challenge', name: 'Challenge', desc: 'Taking on hard things that stretch me.' },
  { id: 'citizenship', name: 'Citizenship', desc: 'Doing my part as a member of my community and society.' },
  { id: 'community', name: 'Community', desc: 'Taking an active part in the groups I belong to.' },
  { id: 'compassion', name: 'Compassion', desc: 'Responding to other people\u2019s pain with care and support.' },
  { id: 'contribution', name: 'Contribution', desc: 'Giving my effort to people and causes beyond myself.' },
  { id: 'cooperation', name: 'Cooperation', desc: 'Working well with others toward shared aims.' },
  { id: 'courage', name: 'Courage', desc: 'Doing hard or frightening things when they are worth doing to me.' },
  { id: 'courtesy', name: 'Courtesy', desc: 'Showing good manners and consideration in everyday dealings with people.' },
  { id: 'craft', name: 'Craft', desc: 'Refining my skills through steady practice.' },
  { id: 'creativity', name: 'Creativity', desc: 'Imagining, making and expressing things in my own way.' },
  { id: 'curiosity', name: 'Curiosity', desc: 'Asking questions, exploring and staying open to discovery.' },
  { id: 'duty', name: 'Duty', desc: 'Honoring the commitments that come with my roles and relationships.' },
  { id: 'empathy', name: 'Empathy', desc: 'Trying to understand how things are for other people.' },
  { id: 'excellence', name: 'Excellence', desc: 'Putting care and skill into the work I do.' },
  { id: 'fairness', name: 'Fairness', desc: 'Treating people even-handedly, without favoritism.' },
  { id: 'faith', name: 'Faith', desc: 'Practicing my religion and letting it guide how I live.' },
  { id: 'family', name: 'Family', desc: 'Caring for the people I count as family.' },
  { id: 'flexibility', name: 'Flexibility', desc: 'Adapting with grace when plans or circumstances change.' },
  { id: 'forgiveness', name: 'Forgiveness', desc: 'Letting go of resentment toward people who hurt me, without excusing the harm.' },
  { id: 'freedom', name: 'Freedom', desc: 'Making my own choices about how I live.' },
  { id: 'friendship', name: 'Friendship', desc: 'Showing up for friends: staying in touch, listening, being there.' },
  { id: 'fun', name: 'Fun', desc: 'Making space for play, lightness and enjoyment.' },
  { id: 'generosity', name: 'Generosity', desc: 'Sharing my time, attention and resources freely.' },
  { id: 'gratitude', name: 'Gratitude', desc: 'Expressing thanks for the good things and people in my life.' },
  { id: 'growth', name: 'Growth', desc: 'Working on becoming more the person I want to be.' },
  { id: 'harmony', name: 'Harmony', desc: 'Acting to ease conflict between the people around me.' },
  { id: 'health', name: 'Health', desc: 'Looking after my body through movement, rest and food.' },
  { id: 'honesty', name: 'Honesty', desc: 'Telling the truth and not misleading people.' },
  { id: 'hope', name: 'Hope', desc: 'Keeping a better future in view and working toward it.' },
  { id: 'hospitality', name: 'Hospitality', desc: 'Welcoming people and helping them feel at home.' },
  { id: 'humility', name: 'Humility', desc: 'Letting my actions speak, without needing credit.' },
  { id: 'humor', name: 'Humor', desc: 'Seeing and sharing the funny side of life.' },
  { id: 'independence', name: 'Independence', desc: 'Taking care of things myself rather than relying on others.' },
  { id: 'influence', name: 'Influence', desc: 'Speaking up and getting involved in decisions that affect me and others.' },
  { id: 'integrity', name: 'Integrity', desc: 'Acting in line with my principles, in private as well as in public.' },
  { id: 'intimacy', name: 'Intimacy', desc: 'Opening up and sharing closeness with someone I trust.' },
  { id: 'justice', name: 'Justice', desc: 'Standing up for people who are treated unfairly.' },
  { id: 'kindness', name: 'Kindness', desc: 'Treating people with warmth and consideration.' },
  { id: 'leadership', name: 'Leadership', desc: 'Helping a group find and move toward shared aims.' },
  { id: 'learning', name: 'Learning', desc: 'Building my knowledge, skills and understanding.' },
  { id: 'love', name: 'Love', desc: 'Showing affection and devotion to the people closest to me.' },
  { id: 'loyalty', name: 'Loyalty', desc: 'Standing by the people I am committed to.' },
  { id: 'nature', name: 'Nature', desc: 'Spending time in the natural world.' },
  { id: 'nurturing', name: 'Nurturing', desc: 'Helping others grow and flourish by teaching, guiding and encouraging them.' },
  { id: 'open-mindedness', name: 'Open-mindedness', desc: 'Considering other viewpoints and staying open to being wrong.' },
  { id: 'order', name: 'Order', desc: 'Creating structure and organization in my life and spaces.' },
  { id: 'patience', name: 'Patience', desc: 'Giving things and people the time they need.' },
  { id: 'pleasure', name: 'Pleasure', desc: 'Savoring the good things my senses and body can enjoy.' },
  { id: 'presence', name: 'Presence', desc: 'Giving my full attention to what I\u2019m doing and who I\u2019m with.' },
  { id: 'providing', name: 'Providing', desc: 'Working to provide for the people who depend on me.' },
  { id: 'prudence', name: 'Prudence', desc: 'Thinking ahead and making careful, considered choices.' },
  { id: 'reliability', name: 'Reliability', desc: 'Keeping my word to people.' },
  { id: 'resourcefulness', name: 'Resourcefulness', desc: 'Looking for practical ways to deal with problems as they come.' },
  { id: 'respect', name: 'Respect', desc: 'Treating others with consideration and dignity.' },
  { id: 'responsibility', name: 'Responsibility', desc: 'Owning my choices and their consequences.' },
  { id: 'safety', name: 'Safety', desc: 'Protecting the people in my care from harm.' },
  { id: 'self-awareness', name: 'Self-awareness', desc: 'Getting to know my own thoughts, feelings and patterns.' },
  { id: 'self-care', name: 'Self-care', desc: 'Making time for rest and the things that restore me.' },
  { id: 'self-compassion', name: 'Self-compassion', desc: 'Treating myself with the warmth I would offer a good friend.' },
  { id: 'self-discipline', name: 'Self-discipline', desc: 'Following through on my intentions, even when it is hard or slow.' },
  { id: 'simplicity', name: 'Simplicity', desc: 'Living with less clutter and fewer distractions.' },
  { id: 'spirituality', name: 'Spirituality', desc: 'Connecting with something larger than myself.' },
  { id: 'stewardship', name: 'Stewardship', desc: 'Protecting the natural world for the people who come after me.' },
  { id: 'tradition', name: 'Tradition', desc: 'Honoring the customs and heritage that shaped me.' },
  { id: 'trusting-others', name: 'Trusting others', desc: 'Giving people the benefit of the doubt and letting them in.' },
  { id: 'vitality', name: 'Vitality', desc: 'Throwing myself fully into what I do.' },
  { id: 'wisdom', name: 'Wisdom', desc: 'Acting with good judgment, especially when things are complicated.' },
];

// Life areas: the places where values are lived (ACT's Valued Living
// Questionnaire and Bull's-Eye use similar areas). They are not values
// themselves, so they are never sorted as cards. Definitions are deliberately
// inclusive: family by choice, unpaid work, health "as it is", and so on.
// Area ids live in their own namespace: the "family" area and the "family"
// value card share an id on purpose, but are stored in separate places
// (state.areas vs state.piles/core) and must never be looked up in each other.
export const AREAS = [
  { id: 'family', name: 'Family', def: 'The people I count as family, by birth, choice or circumstance.' },
  { id: 'partner', name: 'Partner and intimacy', def: 'A romantic or intimate relationship, now or in the future.' },
  { id: 'caregiving', name: 'Parenting and caregiving', def: 'Raising, guiding or caring for children or others who depend on me.' },
  { id: 'friends', name: 'Friendships', def: 'The friends and companions in my life.' },
  { id: 'work', name: 'Work', def: 'Paid or unpaid work, including caring, volunteering and looking for work.' },
  { id: 'learning', name: 'Learning and growth', def: 'Study, training and developing myself.' },
  { id: 'health', name: 'Health and body', def: 'Looking after my body and mind, as they are right now.' },
  { id: 'play', name: 'Play and rest', def: 'Hobbies, fun, creativity and rest.' },
  { id: 'community', name: 'Community', def: 'Neighbors, groups, culture and the wider world I am part of.' },
  { id: 'spirit', name: 'Spirituality and faith', def: 'Faith, spiritual practice, or connection to something larger.' },
];


export const PILES = {
  very: { label: 'Very important', short: 'Very', key: '3' },
  some: { label: 'Somewhat important', short: 'Somewhat', key: '2' },
  not: { label: 'Less important to me', short: 'Less', key: '1' },
};

export const PILE_ORDER = ['very', 'some', 'not'];

// Every limit in one place, so the interface and storage can't drift apart.
// store.normalize enforces these when loading saved data or a backup file.
export const LIMITS = {
  core: 10,           // core values a person can choose
  suggestedCore: 5,   // values the narrowing round suggests (copy says "five")
  areaValues: 3,      // core values linked to one life area
  customAreas: 20,    // life areas a person can add themselves
};
export const MAX_CORE = LIMITS.core;
export const MAX_AREA_VALUES = LIMITS.areaValues;

// Cards that were merged, renamed or split since the original deck, so saved
// progress can be carried over. Old id -> current id. Every step of the saved
// data migration applies the whole list, so an id here must never be reused
// for a new card, and a value here must be a card in the current deck.
export const RENAMED = {
  'caring': 'kindness',
  'encouragement': 'nurturing',
  'connection': 'presence',
  'mindfulness': 'presence',
  'persistence': 'self-discipline',
  'diligence': 'excellence',
  'peace': 'harmony',
  'trust': 'trusting-others',
  // Deck version 3: Mastery's choices move to Craft, the half that keeps its
  // wording. Resourcefulness is new, so it is queued for sorting.
  'mastery': 'craft',
};
