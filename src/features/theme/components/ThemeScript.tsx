const themeBootstrapScript = `
(function () {
  var key = 'vero-theme';
  var preference = 'system';
  try {
    var stored = window.localStorage.getItem(key);
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      preference = stored;
    }
  } catch (error) {}

  var resolved = preference;
  if (preference === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />;
}
