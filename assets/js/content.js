// Long-form content for the Learn and About pages.
// Sources are listed in full on the About page and in docs/research/.

export const learnHTML = (deckSize) => `
<article class="prose">
  <header class="page-head">
    <p class="eyebrow">A short guide</p>
    <h1>Values, goals and feelings</h1>
    <p class="lede">How Acceptance and Commitment Therapy thinks about values, and how to use this card sort well.</p>
  </header>

  <nav class="toc" aria-labelledby="toc-h">
    <h2 id="toc-h" class="toc__title">On this page</h2>
    <ol>
      <li><a href="#/learn#act">What is ACT?</a></li>
      <li><a href="#/learn#values">What are values?</a></li>
      <li><a href="#/learn#compass">Values are a compass, goals are destinations</a></li>
      <li><a href="#/learn#not">What values are not</a></li>
      <li><a href="#/learn#sort">How the card sort works</a></li>
      <li><a href="#/learn#living">Living your values day to day</a></li>
      <li><a href="#/learn#evidence">What the research says</a></li>
    </ol>
  </nav>

  <section id="act" aria-labelledby="act-h">
    <h2 id="act-h">What is ACT?</h2>
    <p>Acceptance and Commitment Therapy (ACT, said as the word “act”) is an evidence-based approach to psychological wellbeing developed by Steven Hayes, Kelly Wilson, Kirk Strosahl and colleagues. Its aim is <strong>psychological flexibility</strong>: the ability to be present with whatever you are feeling and still do what matters to you.</p>
    <p>ACT describes six processes that work together. Three of them help you hold difficult thoughts and feelings more lightly: <em>acceptance</em> (making room for feelings), <em>defusion</em> (seeing thoughts as thoughts, not orders) and <em>contact with the present moment</em>. A fourth, <em>self-as-context</em>, is the sense of a steady “you” that notices all of it. The last two give life its direction: <strong>values</strong> and <strong>committed action</strong>. This tool focuses on those two.</p>
  </section>

  <section id="values" aria-labelledby="values-h">
    <h2 id="values-h">What are values?</h2>
    <p>In ACT, values are <strong>freely chosen qualities of ongoing action</strong>: how you want to behave, what you want to stand for, and how you want to treat yourself, other people and the world. ACT trainer Russ Harris calls them “desired qualities of ongoing action.”</p>
    <p>That is why every card in this deck describes a way of acting, such as being honest, curious or caring, rather than something to own or achieve. A useful test is whether you could act on it today, in a small way, whatever your circumstances.</p>
    <blockquote class="pull">Values are not about what you want to <em>get</em>. They are about who you want to <em>be</em>, moment by moment.</blockquote>
  </section>

  <section id="compass" aria-labelledby="compass-h">
    <h2 id="compass-h">Values are a compass, goals are destinations</h2>
    <p>ACT often compares a value to a compass direction. If you value heading west, you can travel west all your life and never “arrive”. Goals are like the towns you pass through along the way: you can reach them and tick them off.</p>
    <div class="compare">
      <div class="compare__col">
        <h3>A value</h3>
        <ul>
          <li>Is never finished</li>
          <li>Is available right now, in small ways</li>
          <li>Guides you even when you fail at a goal</li>
          <li><em>Example:</em> being a loving parent</li>
        </ul>
      </div>
      <div class="compare__col">
        <h3>A goal</h3>
        <ul>
          <li>Can be achieved and crossed off</li>
          <li>Lives in the future</li>
          <li>Is one way of moving toward a value</li>
          <li><em>Example:</em> reading to my kids three nights a week</li>
        </ul>
      </div>
    </div>
    <p>That is why Lodestar lets you tick off <em>actions</em>, but never your values themselves.</p>
  </section>

  <section id="not" aria-labelledby="not-h">
    <h2 id="not-h">What values are not</h2>
    <dl class="defs">
      <dt>Feelings</dt>
      <dd>“Being happy” or “feeling confident” are not values, because feelings come and go on their own. You can act on a value while feeling anxious, tired or sad, and often that is when it matters most.</dd>
      <dt>Rules or “shoulds”</dt>
      <dd>If a value feels like a stick to beat yourself with (“I <em>must</em> always…”), it may have hardened into a rule. Values are held lightly and flexibly. Try asking: is this something I <em>want</em> to stand for, or something I feel I <em>have</em> to?</dd>
      <dt>Other people’s expectations</dt>
      <dd>It is easy to pick values that would please parents, partners, a culture or a therapist. ACT calls this <em>pliance</em>. A good check: if no one would ever know you had chosen this value, would you still choose it?</dd>
      <dt>Right or wrong</dt>
      <dd>There is no correct set of values, and no value is better than another. Yours are yours.</dd>
    </dl>
  </section>

  <section id="sort" aria-labelledby="sort-h">
    <h2 id="sort-h">How the card sort works</h2>
    <p>Card sorts are a common way to explore values in therapy and coaching. The best known, the <em>Personal Values Card Sort</em>, was created by William R. Miller and colleagues at the University of New Mexico for motivational interviewing, and its authors released it into the public domain. Lodestar follows the same basic procedure, adapted for ACT:</p>
    <ol>
      <li><strong>Sort</strong> all ${deckSize} cards into three piles by how important each is to the way you want to live. First reactions are usually best.</li>
      <li><strong>Narrow</strong> your “very important” pile to the values that feel most central, up to ten.</li>
      <li><strong>Rank</strong> them, which helps clarify what matters most when values pull in different directions.</li>
      <li><strong>Reflect</strong> on what each value means to you and how fully you are living it. The idea of rating importance and consistency comes from ACT tools such as the Valued Living Questionnaire and the Values Bull’s-Eye.</li>
      <li><strong>Act</strong>: choose one small, specific step and plan for the thoughts and feelings that might get in the way.</li>
    </ol>
    <p>Your answers may change over time, and that is normal. Many people find it useful to repeat the sort every few months or after a big life change.</p>
  </section>

  <section id="living" aria-labelledby="living-h">
    <h2 id="living-h">Living your values day to day</h2>
    <h3>Choice points</h3>
    <p>Many times a day, we reach a <em>choice point</em>: a moment when we can move toward what matters or away from it. “Away moves” are things like avoiding, snapping, scrolling or giving up, usually done to escape discomfort. They are human and normal. The aim is simply to notice the moment and, more often, choose a “toward move”. The <a href="#/decide">decision helper</a> is built on this idea.</p>
    <h3>Willingness</h3>
    <p>Doing what matters often brings discomfort along with it: nerves before a hard conversation, boredom in the middle of practice. ACT invites <em>willingness</em>: making room for those feelings rather than waiting for them to leave. You don’t have to feel ready to take a step.</p>
    <h3>Unhooking from thoughts</h3>
    <p>When your mind says “you’ll mess this up”, try adding “I’m having the thought that…” in front of it. The thought may still be there, but it has less grip, and you can choose what to do next.</p>
    <h3>Small steps</h3>
    <p>A value can be lived in thirty seconds: a kind text, one honest sentence, a short walk. Small, repeated actions build into a life that feels like yours.</p>
    <h3>Try this: the sweet spot</h3>
    <p>Take a minute to remember a specific moment when you felt that life was rich and meaningful. Where were you? Who was there? What were you doing? Linger on the details. Then ask: what does this moment tell me about what I care about?</p>
  </section>

  <section id="evidence" aria-labelledby="evidence-h">
    <h2 id="evidence-h">What the research says</h2>
    <ul>
      <li>A 2015 meta-analysis of 39 randomized trials found ACT more effective than waitlist, placebo and usual care, and about as effective as cognitive behavioral therapy (A-Tjak et al., 2015). A 2020 review of 20 meta-analyses, covering more than 12,000 participants, came to the same conclusion across anxiety, depression, chronic pain, substance use and more (Gloster et al., 2020).</li>
      <li>Laboratory studies show that values exercises on their own have measurable benefits, and that hands-on, experiential exercises work better than explanation alone (Levin et al., 2012).</li>
      <li>In one randomized study, online values training plus goal setting improved students’ grades the following semester, while goal setting alone did not (Chase et al., 2013). That is why Lodestar pairs values with concrete action.</li>
      <li>Self-guided ACT, such as books, websites and apps, shows small but real benefits, and tends to work better with some support from another person (French et al., 2017; Klimczak et al., 2023).</li>
    </ul>
    <p>Full references are on the <a href="#/about">About page</a>.</p>
  </section>

  <div class="nav-row">
    <a class="btn btn--ghost" href="#/">Home</a>
    <a class="btn btn--primary" href="#/sort"><span>Start the card sort</span><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  </div>
</article>`;

const REFS = [
  'A-Tjak, J. G. L., Davis, M. L., Morina, N., Powers, M. B., Smits, J. A. J., & Emmelkamp, P. M. G. (2015). A meta-analysis of the efficacy of acceptance and commitment therapy for clinically relevant mental and physical health problems. <em>Psychotherapy and Psychosomatics, 84</em>(1), 30–36. <a href="https://doi.org/10.1159/000365764">doi.org/10.1159/000365764</a>',
  'Chase, J. A., Houmanfar, R., Hayes, S. C., Ward, T. A., Vilardaga, J. P., & Follette, V. (2013). Values are not just goals: Online ACT-based values training adds to goal setting in improving undergraduate college student performance. <em>Journal of Contextual Behavioral Science, 2</em>, 79–84. <a href="https://doi.org/10.1016/j.jcbs.2013.08.002">doi.org/10.1016/j.jcbs.2013.08.002</a>',
  'Dahl, J., Plumb, J. C., Stewart, I., & Lundgren, T. (2009). <em>The art and science of valuing in psychotherapy.</em> New Harbinger.',
  'French, K., Golijani-Moghaddam, N., & Schröder, T. (2017). What is the evidence for the efficacy of self-help acceptance and commitment therapy? A systematic review and meta-analysis. <em>Journal of Contextual Behavioral Science, 6</em>(4), 360–374. <a href="https://doi.org/10.1016/j.jcbs.2017.08.002">doi.org/10.1016/j.jcbs.2017.08.002</a>',
  'Gloster, A. T., Walder, N., Levin, M. E., Twohig, M. P., & Karekla, M. (2020). The empirical status of acceptance and commitment therapy: A review of meta-analyses. <em>Journal of Contextual Behavioral Science, 18</em>, 181–192. <a href="https://doi.org/10.1016/j.jcbs.2020.09.009">doi.org/10.1016/j.jcbs.2020.09.009</a>',
  'Harris, R. (2019). <em>ACT made simple</em> (2nd ed.). New Harbinger.',
  'Hayes, S. C., Luoma, J. B., Bond, F. W., Masuda, A., & Lillis, J. (2006). Acceptance and commitment therapy: Model, processes and outcomes. <em>Behaviour Research and Therapy, 44</em>(1), 1–25. <a href="https://doi.org/10.1016/j.brat.2005.06.006">doi.org/10.1016/j.brat.2005.06.006</a>',
  'Hayes, S. C., Strosahl, K. D., & Wilson, K. G. (2012). <em>Acceptance and commitment therapy: The process and practice of mindful change</em> (2nd ed.). Guilford Press.',
  'Klimczak, K. S., San Miguel, G. G., Mukasa, M. N., Twohig, M. P., & Levin, M. E. (2023). A systematic review and meta-analysis of self-guided online acceptance and commitment therapy as a transdiagnostic self-help intervention. <em>Cognitive Behaviour Therapy, 52</em>(3), 269–294. <a href="https://doi.org/10.1080/16506073.2023.2178498">doi.org/10.1080/16506073.2023.2178498</a>',
  'Levin, M. E., Hildebrandt, M. J., Lillis, J., & Hayes, S. C. (2012). The impact of treatment components suggested by the psychological flexibility model: A meta-analysis of laboratory-based component studies. <em>Behavior Therapy, 43</em>(4), 741–756. <a href="https://doi.org/10.1016/j.beth.2012.05.003">doi.org/10.1016/j.beth.2012.05.003</a>',
  'Lundgren, T., Luoma, J. B., Dahl, J., Strosahl, K., & Melin, L. (2012). The Bull’s-Eye Values Survey: A psychometric evaluation. <em>Cognitive and Behavioral Practice, 19</em>(4), 518–526. <a href="https://doi.org/10.1016/j.cbpra.2012.01.004">doi.org/10.1016/j.cbpra.2012.01.004</a>',
  'Miller, W. R., C’de Baca, J., Matthews, D. B., & Wilbourne, P. L. (2001). <em>Personal values card sort.</em> University of New Mexico. Public domain.',
  'Wilson, K. G., & Murrell, A. R. (2004). Values work in acceptance and commitment therapy: Setting a course for behavioral treatment. In S. C. Hayes, V. M. Follette, & M. M. Linehan (Eds.), <em>Mindfulness and acceptance</em> (pp. 120–151). Guilford Press.',
  'Wilson, K. G., Sandoz, E. K., Kitchens, J., & Roberts, M. (2010). The Valued Living Questionnaire: Defining and measuring valued action within a behavioral framework. <em>The Psychological Record, 60</em>(2), 249–272. <a href="https://doi.org/10.1007/BF03395706">doi.org/10.1007/BF03395706</a>',
];

export const aboutHTML = () => `
<article class="prose">
  <header class="page-head">
    <p class="eyebrow">About Lodestar</p>
    <h1>About, privacy and support</h1>
    <p class="lede">A lodestar is a star used to guide the way, like the North Star. Lodestar is a free, open tool for discovering your values, the stars you steer by.</p>
  </header>

  <section id="support" class="care-note care-note--urgent" aria-labelledby="support-h">
    <h2 id="support-h">If you need help now</h2>
    <p>Lodestar is not a crisis service. If you are in danger or thinking about harming yourself, please reach out now:</p>
    <ul>
      <li><strong>Emergency:</strong> call your local emergency number (911 in the US and Canada, 999 in the UK, 112 in the EU, 000 in Australia).</li>
      <li><strong>United States:</strong> call or text <a href="tel:988">988</a>, or chat at <a href="https://988lifeline.org">988lifeline.org</a>, for the 988 Suicide &amp; Crisis Lifeline.</li>
      <li><strong>Anywhere else:</strong> <a href="https://findahelpline.com">findahelpline.com</a> lists free, confidential helplines in over 130 countries.</li>
    </ul>
  </section>

  <section aria-labelledby="not-therapy-h">
    <h2 id="not-therapy-h">This is not therapy</h2>
    <p>Lodestar is an educational, self-reflection tool based on published ACT methods. It does not diagnose, treat or replace care from a qualified professional. Research suggests self-guided ACT is most helpful with some support, so you may want to bring your results to a therapist, counselor or trusted person and talk them through.</p>
  </section>

  <section aria-labelledby="privacy-h">
    <h2 id="privacy-h">Your privacy</h2>
    <ul>
      <li><strong>Nothing leaves your device.</strong> Your cards, reflections, plans and decisions are saved only in this browser’s local storage. There are no accounts, no analytics, no cookies and no third-party scripts or fonts.</li>
      <li><strong>Shared devices:</strong> anyone using this browser on this device could open your results. Use <em>Start over</em> on the My values page to erase everything.</li>
      <li><strong>Backups:</strong> a downloaded backup file contains everything you wrote, in plain text. Store it somewhere private.</li>
      <li><strong>Clearing your browser data</strong> will also erase your results, so download a backup if you want to keep them.</li>
    </ul>
  </section>

  <section aria-labelledby="a11y-h">
    <h2 id="a11y-h">Accessibility</h2>
    <p>Lodestar aims to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It works with a keyboard alone and with screen readers; every action is a button (no dragging needed); it follows your device’s light or dark mode, reduced-motion and high-contrast settings; it reflows for zoom up to 400%; and it uses Atkinson Hyperlegible, a typeface designed by the Braille Institute for readers with low vision. If something doesn’t work for you, please open an issue on the project’s GitHub page.</p>
  </section>

  <section aria-labelledby="credits-h">
    <h2 id="credits-h">Credits</h2>
    <p>The value names draw on the common vocabulary of ACT values work and on the public-domain <em>Personal Values Card Sort</em> by Miller, C’de Baca, Matthews and Wilbourne (2001). All card descriptions, prompts and text in Lodestar are original. The reflection step is inspired by the structure of the Valued Living Questionnaire and the Values Bull’s-Eye; no items from those measures are reproduced. Fonts: Atkinson Hyperlegible (Braille Institute) and Fraunces (Undercase Type), both under the SIL Open Font License.</p>
  </section>

  <section aria-labelledby="refs-h">
    <h2 id="refs-h">References</h2>
    <ul class="refs">${REFS.map((r) => `<li>${r}</li>`).join('')}</ul>
  </section>
</article>`;
