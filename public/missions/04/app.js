// Hämta och visa låtar från servern. / Fetch and render tracks from the server.
document.querySelector('#load').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/trakcs');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const tracks = await response.json();
    document.querySelector('#tracks').replaceChildren(...tracks.map(track => {
      const item = document.createElement('li');
      item.textContent = track.title;
      return item;
    }));
    document.querySelector('#status').textContent = 'OK';
  } catch (error) {
    document.querySelector('#status').textContent = error.message;
  }
});
