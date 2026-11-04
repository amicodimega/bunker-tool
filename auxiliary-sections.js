(() => {
  const button = document.getElementById('toggleExistingBunkers');
  const section = document.getElementById('existingBunkersSection');
  button.addEventListener('click', () => {
    const open = section.hidden;
    section.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if(open) window.refreshVillageMap?.();
  });
})();
