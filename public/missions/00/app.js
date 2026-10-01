// Övning utan betyg: aktivera knappen och prova hela arbetsflödet.
// Ungraded practice: enable the button and try the whole workflow.
const demoButton = document.querySelector("#demo-play");
const demoStatus = document.querySelector("#demo-status");

// Ändra true till false och spara filen. / Change true to false and save.
demoButton.disabled = true;

// Körs när besökaren klickar. / Runs when the visitor clicks.
demoButton.addEventListener("click", () => {
  demoStatus.dataset.ready = "true";
  demoStatus.textContent =
    new URLSearchParams(location.search).get("lang") === "en"
      ? "✓ The button works. You are ready for the missions!"
      : "✓ Knappen fungerar. Du är redo för uppdragen!";
});
