// Koppla in encore-API:t och hantera fel. / Connect the encore API and handle errors.
document.querySelector("#load").addEventListener("click", async () => {
  try {
    // TODO: fetch('/api/encore'), kontrollera response.ok, läs JSON / check response.ok, read JSON.
    const track = { title: "TODO" };
    document.querySelector("#encore").textContent = track.title;
  } catch (error) {
    document.querySelector("#status").textContent = error.message;
  }
});
