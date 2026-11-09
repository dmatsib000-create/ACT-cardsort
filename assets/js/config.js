// Settings for whoever runs this copy of Lodestar.

// Link to a Google Form where people can leave comments and report problems
// without a GitHub account. Paste the form's share link between the quotes,
// for example 'https://forms.gle/AbC123' or
// 'https://docs.google.com/forms/d/e/.../viewform'.
// While this is empty, the feedback links are hidden.
// After changing it, bump VERSION in sw.js so returning visitors get the update.
export const FEEDBACK_FORM_URL = 'https://forms.gle/rrVtZw1mJEuewH6n7';

// Returns the form link if it is a Google Forms address, otherwise ''.
// Anything else is ignored so a typo can't send people somewhere unexpected.
export function feedbackUrl(raw = FEEDBACK_FORM_URL) {
  try {
    const u = new URL(String(raw).trim());
    const ok = u.protocol === 'https:'
      && (u.hostname === 'forms.gle' || (u.hostname === 'docs.google.com' && u.pathname.startsWith('/forms/')));
    return ok ? u.href : '';
  } catch {
    return '';
  }
}
