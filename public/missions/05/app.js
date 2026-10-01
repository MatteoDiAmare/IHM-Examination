// Namnrymden håller favoritövningen skild från provsvaren. / Separate storage from exam answers.
const key = "backstage-favourite";
const select = document.querySelector("#favourite");
const saved = localStorage.getItem(key);
if (saved) select.value = saved;
document.querySelector("#save").addEventListener("click", () => {
  // TODO: Spara select.value här / Save select.value here.
  document.querySelector("#status").textContent = "✓";
});
