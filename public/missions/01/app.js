// Startlampan ska tändas när detta skript körs.
// The ready light should turn on when this script runs.
function boot() {
  const status = document.querySelector('#status');
  const language = new URLSearchParams(location.search).get('lang');

  status.textContent = language === 'en'
    ? '● Ready light is ON'
    : '● Startlampan är tänd';
  status.dataset.ready = 'true';

// Något saknas här / Something is missing here.
boot();
