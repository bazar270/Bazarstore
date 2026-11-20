(() => {
  let offer;
  let installed = false;
  const standalone = matchMedia('(display-mode: standalone)');
  async function recordUsage(){
    if(document.hidden)return;
    try {
      let id=localStorage.getItem('bazar.usageId');
      if(!id){id=crypto.randomUUID();localStorage.setItem('bazar.usageId',id)}
      const send=kind=>fetch('/api/usage?kind='+kind+'&id='+encodeURIComponent(id),{method:'POST'});
      if(installed||standalone.matches||navigator.standalone===true)localStorage.setItem('bazar.detectedInstall','1');
      await Promise.all([send('active'),(async()=>{
        if(localStorage.getItem('bazar.detectedInstall')==='1'&&localStorage.getItem('bazar.countedInstall')!==id){
          if((await send('install')).ok)localStorage.setItem('bazar.countedInstall',id);
        }
      })()]);
    }catch{}
  }
  recordUsage();
  document.addEventListener('visibilitychange',recordUsage);
  window.addEventListener('online',recordUsage);
  setInterval(recordUsage,60000);
  const labels = {ckb: 'بازاڕ دابمەزرێنە', ar: 'ثبّت بازار', en: 'Install Bazar'};

  const unavailable = {ckb: 'دامەزراندن بەردەست نییە', ar: 'التثبيت غير متاح', en: 'Install unavailable'};
  let busy = false;
  function render() {
    const account = document.getElementById('installBazar');
    if (!account) return;
    const ready = Boolean(offer) || typeof navigator.install === 'function';
    const copy = ready || busy ? labels : unavailable;
    const label = copy[document.documentElement.lang] || copy.ar;
    account.disabled = busy || !ready;
    account.textContent = label;
    account.hidden = !ready || installed || standalone.matches || navigator.standalone === true;

  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    offer = event;
    render();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    recordUsage();
    offer = undefined;
    render();
  });

  async function install() {
    if (busy) return;
    const current = offer;
    offer = undefined;
    busy = true;
    try {
      if (current) {
        await current.prompt();
        await current.userChoice;
      } else if (typeof navigator.install === 'function') {
        await navigator.install();
      }
    } catch {
      // The browser can cancel the native install dialog.
    } finally {
      busy = false;
      render();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('installBazar').addEventListener('click', install);
    standalone.addEventListener('change', render);
    new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
    render();
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
