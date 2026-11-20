(() => {
  const welcome = document.getElementById('launchWelcome');
  if (location.hash && location.hash !== '#home') return;
  if (typeof welcome.showModal !== 'function') return;
  welcome.showModal();
  let closing = false;
  function enterStore() {
    if (closing || !welcome.open) return;
    closing = true;
    welcome.classList.add('leaving');
    setTimeout(() => welcome.close(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300);
  }
  const timer = setTimeout(enterStore, 2700);
  welcome.addEventListener('close', () => clearTimeout(timer), {once:true});
})();
