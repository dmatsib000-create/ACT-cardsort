# Values map: how the deck relates, and what to change

This summarizes a second research round (November 2026) into how semantics, pragmatics, axiology and the psychological science of wellbeing bear on Lodestar's deck. The interactive map is [`values-map.html`](values-map.html). The full, cited briefs are in [`research/`](research/):

- [`research/act-values.md`](research/act-values.md): ACT's definition of values, card sorts and the evidence base (first round)
- [`research/language-and-axiology.md`](research/language-and-axiology.md): philosophy of value, semantics, pragmatics, and card-level wording issues
- [`research/values-and-wellbeing.md`](research/values-and-wellbeing.md): Schwartz's 19 values, wellbeing frameworks, character strengths, moral psychology, a crosswalk and coverage analysis

**Status: adopted (deck version 3).** The deck below is now `assets/js/values.js`, and the sort changes are in the app. Version 3 split Mastery into Craft and Resourcefulness (see "Deck version 3" below). Saved progress from earlier decks is migrated automatically (see Implementation notes).

The interactive map now opens with a before-and-after count of the original and current decks, calculated from the map's own data. In short: conservation values went from 11 cards to 15 and self-enhancement from 4 to 6, the crowded caring region shrank from 13 to 11, and the Schwartz values with no card fell from 4 to 1 (Face, left out on purpose).

## What the review found in the original deck

1. **The deck leans to one half of the circle.** On Schwartz's refined theory of 19 basic values (Schwartz et al., 2012; replicated in 49 cultural groups), 31 cards are self-transcendence, 15 openness to change, 11 conservation and only 4 self-enhancement. Four have no home on the circle (Courage, Gratitude, Mindfulness, Self-compassion). People whose priorities are achievement, duty, security or tradition find few cards that describe them honestly.
2. **One region is overcrowded.** 13 cards sit in benevolence: caring. Caring, Kindness, Compassion, Empathy, Love and Nurturing share one core idea, which splits people's choices among near-synonyms.
3. **Whole regions are empty.** Power (dominance and resources), face and societal security have no cards; conformity to rules has one. Leaving out power, wealth and image is a sound ACT decision, because they are outcomes rather than qualities of action, but each has an action form people genuinely hold.
4. **Strong wellbeing strengths are missing.** Of the five character strengths most linked to life satisfaction (hope, zest, gratitude, love and curiosity; Park, Peterson & Seligman, 2004), the deck has no card for hope or zest.
5. **Every card is a compliment.** All names are praise words, so "not important to me" reads as disowning. This pushes ratings to the top (a ceiling effect) and makes the sort less informative.
6. **The deck mixes kinds of things:** virtues, goods, a state, life areas and practices. ACT's own tools treat life areas separately from the qualities a person brings to them.
7. **About 20 descriptions are double-barreled** (two acts or two targets). Several are directionally ambiguous (Trust, Respect) and several use circular words such as "what matters".

## Changes to the deck

Five merges, two splits, two renames, eight additions and reworded descriptions gave **71 cards** (from 65) in version 2. Version 3 split Mastery in two, for **72 cards**.

- **Merges:** Caring into Kindness; Encouragement into Nurturing; Connection and Mindfulness into Presence; Persistence into Self-discipline; the "being trustworthy" half of Trust into Reliability.
- **Splits:** Nature into Nature and Stewardship; Spirituality into Spirituality and Faith. Trust becomes Trusting others.
- **Renames:** Diligence becomes Excellence, which fills the thin achievement region and the work domain. Peace becomes Harmony.
- **Additions:** Hope, Vitality, Influence, Providing, Duty, Courtesy, Prudence, Citizenship.
- **Deliberately not added:** Wealth, Power, Status, Fame and Image (outcomes, not qualities of action, and linked to lower wellbeing). Purpose is also left out, because the exercise itself is a search for purpose and the card would be circular.

| Card | Proposed wording | Change | Schwartz region |
|---|---|---|---|
| **Acceptance** | Making room for feelings and situations I can’t change, instead of fighting them. | Reworded | Universalism: tolerance |
| **Adventure** | Seeking out new experiences and exploring the unfamiliar. | Unchanged | Stimulation |
| **Assertiveness** | Saying clearly what I need, while staying respectful. | Reworded | Self-direction: action |
| **Authenticity** | Acting in ways that fit who I really am. | Reworded | Self-direction: action |
| **Beauty** | Noticing and savoring what is lovely in art, nature and everyday life. | Reworded | Universalism: nature |
| **Challenge** | Taking on hard things that stretch me. | Reworded | Stimulation |
| **Citizenship** | Doing my part as a member of my community and society. | New | Security: societal |
| **Community** | Taking an active part in the groups I belong to. | Reworded | Benevolence: caring |
| **Compassion** | Responding to other people’s pain with care and support. | Reworded | Universalism: concern |
| **Contribution** | Giving my effort to people and causes beyond myself. | Reworded | Universalism: concern |
| **Cooperation** | Working well with others toward shared aims. | Unchanged | Benevolence: dependability |
| **Courage** | Doing hard or frightening things when they are worth doing to me. | Reworded | No single home |
| **Courtesy** | Showing good manners and consideration in everyday dealings with people. | New | Conformity: interpersonal |
| **Craft** | Refining my skills through steady practice. | New (split from Mastery) | Achievement |
| **Creativity** | Imagining, making and expressing things in my own way. | Unchanged | Self-direction: thought |
| **Curiosity** | Asking questions, exploring and staying open to discovery. | Unchanged | Self-direction: thought |
| **Duty** | Honoring the commitments that come with my roles and relationships. | New | Conformity: rules |
| **Empathy** | Trying to understand how things are for other people. | Reworded | Universalism: tolerance |
| **Excellence** | Putting care and skill into the work I do. | Renamed from Diligence | Achievement |
| **Fairness** | Treating people even-handedly, without favoritism. | Reworded | Universalism: concern |
| **Faith** | Practicing my religion and letting it guide how I live. | New (split from Spirituality) | Tradition |
| **Family** | Caring for the people I count as family. | Reworded | Benevolence: caring |
| **Flexibility** | Adapting with grace when plans or circumstances change. | Unchanged | Self-direction: action |
| **Forgiveness** | Letting go of resentment toward people who hurt me, without excusing the harm. | Reworded | Benevolence: caring |
| **Freedom** | Making my own choices about how I live. | Reworded | Self-direction: action |
| **Friendship** | Showing up for friends: staying in touch, listening, being there. | Unchanged | Benevolence: caring |
| **Fun** | Making space for play, lightness and enjoyment. | Unchanged | Hedonism |
| **Generosity** | Sharing my time, attention and resources freely. | Unchanged | Benevolence: caring |
| **Gratitude** | Expressing thanks for the good things and people in my life. | Reworded | No single home |
| **Growth** | Working on becoming more the person I want to be. | Reworded | Self-direction: thought |
| **Harmony** | Acting to ease conflict between the people around me. | Renamed from Peace | Universalism: concern |
| **Health** | Looking after my body through movement, rest and food. | Reworded | Security: personal |
| **Honesty** | Telling the truth and not misleading people. | Reworded | Benevolence: dependability |
| **Hope** | Keeping a better future in view and working toward it. | New | No single home |
| **Hospitality** | Welcoming people and helping them feel at home. | Unchanged | Benevolence: caring |
| **Humility** | Letting my actions speak, without needing credit. | Reworded | Humility |
| **Humor** | Seeing and sharing the funny side of life. | Unchanged | Hedonism |
| **Independence** | Taking care of things myself rather than relying on others. | Reworded | Self-direction: action |
| **Influence** | Speaking up and getting involved in decisions that affect me and others. | New | Power: dominance |
| **Integrity** | Acting in line with my principles, in private as well as in public. | Reworded | Benevolence: dependability |
| **Intimacy** | Opening up and sharing closeness with someone I trust. | Reworded | Benevolence: caring |
| **Justice** | Standing up for people who are treated unfairly. | Reworded | Universalism: concern |
| **Kindness** | Treating people with warmth and consideration. | Merges Caring + Kindness | Benevolence: caring |
| **Leadership** | Helping a group find and move toward shared aims. | Reworded | Achievement |
| **Learning** | Building my knowledge, skills and understanding. | Unchanged | Self-direction: thought |
| **Love** | Showing affection and devotion to the people closest to me. | Reworded | Benevolence: caring |
| **Loyalty** | Standing by the people I am committed to. | Reworded | Benevolence: dependability |
| **Nature** | Spending time in the natural world. | Split | Universalism: nature |
| **Nurturing** | Helping others grow and flourish by teaching, guiding and encouraging them. | Merges Encouragement + Nurturing | Benevolence: caring |
| **Open-mindedness** | Considering other viewpoints and staying open to being wrong. | Reworded | Universalism: tolerance |
| **Order** | Creating structure and organization in my life and spaces. | Unchanged | Security: personal |
| **Patience** | Giving things and people the time they need. | Reworded | Conformity: interpersonal |
| **Pleasure** | Savoring the good things my senses and body can enjoy. | Unchanged | Hedonism |
| **Presence** | Giving my full attention to what I’m doing and who I’m with. | Merges Connection + Mindfulness | Benevolence: caring |
| **Providing** | Working to provide for the people who depend on me. | New | Power: resources |
| **Prudence** | Thinking ahead and making careful, considered choices. | New | Security: personal |
| **Reliability** | Keeping my word to people. | Reworded | Benevolence: dependability |
| **Resourcefulness** | Looking for practical ways to deal with problems as they come. | New (split from Mastery) | Self-direction: action |
| **Respect** | Treating others with consideration and dignity. | Unchanged | Conformity: interpersonal |
| **Responsibility** | Owning my choices and their consequences. | Unchanged | Benevolence: dependability |
| **Safety** | Protecting the people in my care from harm. | Reworded | Security: personal |
| **Self-awareness** | Getting to know my own thoughts, feelings and patterns. | Unchanged | Self-direction: thought |
| **Self-care** | Making time for rest and the things that restore me. | Reworded | Security: personal |
| **Self-compassion** | Treating myself with the warmth I would offer a good friend. | Unchanged | No single home |
| **Self-discipline** | Following through on my intentions, even when it is hard or slow. | Merges Persistence + Self-discipline | Achievement |
| **Simplicity** | Living with less clutter and fewer distractions. | Reworded | Humility |
| **Spirituality** | Connecting with something larger than myself. | Split | Tradition |
| **Stewardship** | Protecting the natural world for the people who come after me. | New (split from Nature) | Universalism: nature |
| **Tradition** | Honoring the customs and heritage that shaped me. | Unchanged | Tradition |
| **Trusting others** | Giving people the benefit of the doubt and letting them in. | Renamed from Trust | Benevolence: dependability |
| **Vitality** | Throwing myself fully into what I do. | New | Stimulation |
| **Wisdom** | Acting with good judgment, especially when things are complicated. | Reworded | Universalism: tolerance |

## Deck version 3: Mastery split in two

**Why.** Feedback flagged *Mastery* as a word some people hear through "master" and its history in slavery. Other fields have been retiring "master" in technical terms for the same reason, for example in software. The word's skill sense is old and still standard in psychology (mastery goals, Pearlin's Mastery Scale, and the "mastery criteria" of behavioral treatments such as Parent-Child Interaction Therapy). Feedback also mentioned that PCIT has moved away from the term; the PCIT training materials we could find still use "mastery criteria", so we have not relied on that. The decision rests on two simpler points. A values deck asks people to describe themselves with its words, so a word that lands badly for some people has a cost, and a plainer word has none. And the card held two different ideas, which breaks the "one act, one target" rule.

**The two ideas.**

- **Skill built through practice.** Achievement-goal research calls the aim of developing competence, rather than outperforming others, a *mastery goal* (Ames, 1992). This becomes **Craft**: "Refining my skills through steady practice." It keeps Mastery's wording and its place in Achievement, so self-enhancement still has 6 cards.
- **An active, practical stance toward life's problems.** Pearlin and Schooler (1978) define mastery as how far people see their life chances as under their own control, and Ryff's (1989) *environmental mastery* is managing the demands of everyday life. A sense of control is a belief, not an action, so the card names what a person does: **Resourcefulness**, "Looking for practical ways to deal with problems as they come." It sits in Self-direction: action, and pairs with Acceptance: acting on what I can change, and making room for what I can't.

**Overlaps checked.** Craft deepens a skill a person has chosen, where Learning takes in new knowledge, Excellence is care in one's work, and Self-discipline is following through. Resourcefulness can include asking for help, unlike Independence, and works on the problem, where Flexibility adapts the person to it.

**Names considered.** For the skill half, *Skill* and *Competence* name something a person has rather than a way of acting, *Practice* is ambiguous (medical or religious practice) and *Craftsmanship* is gendered. For the other half, *Self-efficacy* is a belief, *Agency* is abstract, and *Problem-solving* reads as a technique.

## Changes to the sort

- Rename "Not important to me" to "Less important to me".
- When the "very important" pile passes about a third of the deck, offer a most/least step: pick the three that matter most and the three that matter least (McCarty & Shrum, 2000).
- Allow ties ("on a par") when ranking (Chang, 2002).
- In Reflect, ask "Do I value this for its own sake, or for something it gives me?" (Korsgaard, 1983).
- For custom cards such as Wealth or Success, ask what having it would let the person do or be, rather than rejecting it.
- Life areas (family, work, health, community and so on) are a separate, optional exercise rather than cards. See "Life areas" below.
- Use the wellbeing findings for coverage only. Never steer people toward "healthy" values: the effects are small and depend on culture, and steering invites choosing values to please others.

## Every card fits ACT's definition of a value

In ACT, a value is a freely chosen, desired quality of ongoing action (Wilson & DuFrene, 2009; Harris, 2019). Every card was checked against that definition:

1. **A quality of action:** it describes how the person acts, not something they have or are.
2. **Never completed:** it is a direction, not a goal or outcome that can be reached or ticked off.
3. **Within the person's control:** it does not depend on how others respond (being respected, accepted, admired) or on results.
4. **Not a feeling:** feelings come and go and cannot be chosen; the card names what the person does.
5. **Not a rule:** it is held as a chosen direction, not as an obligation or an absolute standard.
6. **One action at a time:** each card describes one quality, so people know what they are choosing.

A final pass revised 14 cards that slipped:
- **Outcome or result:** Contribution ("making a positive difference"), Excellence ("to a high standard"), Mastery ("really well"), Providing ("secure the future"), Citizenship ("keep society working well").
- **Dependent on others:** Influence ("having a say").
- **Rule or absolute:** Duty ("obligations"), Integrity ("even when no one is watching"), Faith ("living by its teachings").
- **Feeling:** Vitality ("energy"), Compassion ("a wish to help").
- **Two actions or a precondition:** Reliability (two promises), Intimacy (assumed a partner).
- **Circular:** Beauty (defined with its own name).

`scripts/check-deck.mjs` turns these criteria into automatic checks: identity framing, outcome words, dependence on others' responses, feelings, rules and absolutes, circular words, self-definition and length. It runs on every change to the deck through `.github/workflows/check-deck.yml`, and can be run locally with `node scripts/check-deck.mjs`. Some judgments, like whether a card bundles two actions, still need a human read.

## Wording rules

1. One act, one target.
2. Start with a verb, not "Being...". Identity framing is fragile after lapses (Foster-Hanson et al., 2020).
3. Make the person the giver. Never write a value that depends on how others treat you.
4. No circular words ("what matters", "what is right").
5. No absolutes ("always", "never", "even when no one is watching").
6. No feelings as values (calm, happy, confident).
7. Plain, translatable words.
8. Show the description wherever the name appears.

## Coding of the current 65 cards

These codings are judgment calls based on the frameworks, not published mappings.

| Card | Schwartz value | Character strength | Basic need | Life domain | Recommendation |
|---|---|---|---|---|---|
| Acceptance | Universalism: tolerance | None (an ACT process) | Autonomy | Any | Reword |
| Adventure | Stimulation | Bravery, zest | Autonomy | Recreation | Keep |
| Assertiveness | Self-direction: action | Bravery, honesty | Autonomy | Couples, family, work | Reword |
| Authenticity | Self-direction: action | Honesty | Autonomy | Any | Reword |
| Beauty | Universalism: nature | Appreciation of beauty | None | Recreation, spirituality | Reword |
| Caring | Benevolence: caring | Kindness | Relatedness | Family, parenting, friends | Merge: Into Kindness |
| Challenge | Stimulation | Perseverance | Competence | Work, education | Reword |
| Community | Benevolence: caring | Teamwork | Relatedness | Citizenship | Reword |
| Compassion | Universalism: concern | Kindness | Relatedness, beneficence | Any | Reword |
| Connection | Benevolence: caring | Love, social intelligence | Relatedness | Family, couples, friends | Merge: With Mindfulness, into Presence |
| Contribution | Universalism: concern | Kindness, teamwork | Beneficence | Citizenship, work | Reword |
| Cooperation | Benevolence: dependability | Teamwork | Relatedness | Work, citizenship | Keep |
| Courage | No single home | Bravery | Autonomy | Any | Reword |
| Creativity | Self-direction: thought | Creativity | Autonomy, competence | Recreation, work | Keep |
| Curiosity | Self-direction: thought | Curiosity | Autonomy | Education | Keep |
| Diligence | Achievement | Perseverance | Competence | Work, education | Reword: Renamed Excellence |
| Empathy | Universalism: tolerance | Social intelligence | Relatedness | Any | Reword |
| Encouragement | Benevolence: caring | Kindness | Relatedness, beneficence | Parenting, friends, work | Merge: Into Nurturing |
| Fairness | Universalism: concern | Fairness | Relatedness | Citizenship, work | Reword |
| Family | Benevolence: caring | Love | Relatedness | Family, parenting, couples | Reword |
| Flexibility | Self-direction: action | Judgment | Autonomy | Any | Keep |
| Forgiveness | Benevolence: caring | Forgiveness | Relatedness | Family, couples, friends | Reword |
| Freedom | Self-direction: action | None | Autonomy | Any | Reword |
| Friendship | Benevolence: caring | Love | Relatedness | Friends | Keep |
| Fun | Hedonism | Humor, zest | Autonomy | Recreation | Keep |
| Generosity | Benevolence: caring | Kindness | Beneficence | Any | Keep |
| Gratitude | No single home | Gratitude | None | Spirituality | Reword |
| Growth | Self-direction: thought | Love of learning | Competence, autonomy | Education | Reword |
| Health | Security: personal | Self-regulation, prudence | Competence | Physical self-care | Reword |
| Honesty | Benevolence: dependability | Honesty | Relatedness | Any | Reword |
| Hospitality | Benevolence: caring | Kindness | Relatedness | Family, friends, citizenship | Keep |
| Humility | Humility | Humility | None | Any | Reword |
| Humor | Hedonism | Humor | Relatedness | Recreation, friends | Keep |
| Independence | Self-direction: action | None | Autonomy | Work | Reword |
| Integrity | Benevolence: dependability | Honesty | Autonomy | Any | Reword |
| Intimacy | Benevolence: caring | Love | Relatedness | Couples | Reword |
| Justice | Universalism: concern | Fairness, bravery | Beneficence | Citizenship | Reword |
| Kindness | Benevolence: caring | Kindness | Relatedness | Any | Reword: Absorbs Caring |
| Leadership | Achievement | Leadership | Competence, relatedness | Work, citizenship | Reword |
| Learning | Self-direction: thought | Love of learning | Competence | Education | Keep |
| Love | Benevolence: caring | Love | Relatedness | Family, couples, parenting, friends | Reword |
| Loyalty | Benevolence: dependability | Teamwork | Relatedness | Family, friends, citizenship | Reword |
| Mastery | Achievement | Perseverance | Competence | Work, education, recreation | Reword; later split: Into Craft and Resourcefulness (version 3) |
| Mindfulness | No single home | None (an ACT process) | Autonomy | Spirituality | Merge: With Connection, into Presence |
| Nature | Universalism: nature | Appreciation of beauty | None | Recreation, citizenship | Split: Into Nature and Stewardship |
| Nurturing | Benevolence: caring | Kindness, love | Relatedness, beneficence | Parenting, work | Reword: Absorbs Encouragement |
| Open-mindedness | Universalism: tolerance | Judgment | Autonomy | Education, citizenship | Reword: Absorbs intellectual humility |
| Order | Security: personal | Prudence | Competence | Work, family | Keep |
| Patience | Conformity: interpersonal | Self-regulation | None | Parenting, family | Reword |
| Peace | Universalism: concern | None | None | Spirituality, citizenship | Reword: Renamed Harmony |
| Persistence | Achievement | Perseverance | Competence | Work, education | Merge: Into Self-discipline |
| Pleasure | Hedonism | None | None | Recreation, couples | Keep |
| Reliability | Benevolence: dependability | Teamwork, honesty | Relatedness | Work, family, friends | Reword: Absorbs being trustworthy |
| Respect | Conformity: interpersonal | Fairness, kindness | Relatedness | Any | Keep |
| Responsibility | Benevolence: dependability | Prudence | Autonomy | Work, parenting | Keep |
| Safety | Security: personal | Prudence | None | Family, parenting, citizenship | Reword |
| Self-awareness | Self-direction: thought | Perspective | Autonomy | Any | Keep |
| Self-care | Security: personal | Self-regulation | Autonomy | Physical self-care | Reword |
| Self-compassion | No single home | None | None | Any | Keep |
| Self-discipline | Conformity: rules | Self-regulation | Competence | Any | Reword: Absorbs Persistence |
| Simplicity | Humility | Prudence | None | Any | Reword |
| Spirituality | Tradition | Spirituality | None | Spirituality | Split: Into Spirituality and Faith |
| Tradition | Tradition | None | Relatedness | Family, spirituality, citizenship | Keep |
| Trust | Benevolence: dependability | Love, honesty | Relatedness | Any | Split: Trustworthiness into Reliability; card becomes Trusting others |
| Wisdom | Universalism: tolerance | Perspective | Competence | Any | Reword |

## Implementation notes

Ids changed for merged and renamed cards, and `store.normalize` migrates saved data from schema 1: caring to kindness, encouragement to nurturing, connection and mindfulness to presence, persistence to self-discipline, diligence to excellence, peace to harmony, and trust to trusting-others. When two old cards merge, the stronger pile wins and both reflections are kept. New cards are queued for sorting after the ones already placed.

Deck version 3 moves saved data to schema 3 with the same step. Everything saved for Mastery (its pile, place in the core list, tie, narrowing score, reflection, life-area links, actions and decision ratings) moves to Craft, which keeps Mastery's wording. Resourcefulness is queued for sorting, and people who had started see the "deck updated" notice again. `RENAMED` in `values.js` lists every old id with its current card.

## Life areas

ACT treats life areas as the places where values are lived, not as values. A third research round (`research/life-areas.md`) and a design critique shaped how Lodestar handles them:

- **The deck stays qualities only.** The Family card keeps its id but now reads "Caring for the people I count as family", so people who hold family as a core value keep a card for it.
- **An optional area tag in the action step** ("Where in your life?"). This adds context at almost no cost. The existing "When and where?" field already supplies the specific cue that the implementation-intention research credits with improving follow-through.
- **An optional "Map your values to your life" exercise**, offered from My values *after* the action plan exists, so it never stands between someone and their plan.
  - People pick only the areas that fit their life, can rename or add their own, and see one area per screen.
  - Each area offers three neutral statuses: "This matters to me", "Matters to me, but it's hard right now" (with a gentle note and a link to support) and "Not part of my life right now".
  - Importance and "living it lately" are separate, labelled 5-point choices. The second is optional, and a low answer is framed as information, not failure.
  - Each area links to up to three of the person's own core values.
  - No combined, product or gap score is ever shown. An area that matters a lot but has had little room lately is offered only as a suggestion for where to plan a step.
- **Not done:** a separate areas-first mode, or rating all ten areas, which the engagement research flags as the riskiest pattern late in a session.
