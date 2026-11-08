// Apply a saved theme before first paint to avoid a flash of the wrong theme.
try {
  var t = localStorage.getItem('lodestar:theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) { /* storage unavailable */ }
