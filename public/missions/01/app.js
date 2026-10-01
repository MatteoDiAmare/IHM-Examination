// Startlampan ska tändas när detta skript körs. / Turn on the ready light.
function boot() {
  document.querySelector('#status').textContent = 'READY';
  document.querySelector('#status').dataset.ready = 'true';
// Något saknas här / Something is missing here
boot();
