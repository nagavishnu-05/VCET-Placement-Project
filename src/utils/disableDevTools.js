export const disableDevTools = () => {
  if (typeof window === 'undefined') return; // Skip during SSR
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    if (
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67))
    ) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  });

  const detectDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      document.body.innerHTML = 'Developer tools are not allowed on this site.';
    }
  };

  setInterval(detectDevTools, 1000);

  const disableConsole = () => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };

    console.log = console.warn = console.error = console.info = console.debug = () => {
      return false;
    };
    console.clear = () => {
      originalConsole.warn('Console clearing is disabled');
      return false;
    };
  };
  setInterval(() => {
    debugger;
  }, 100);
};