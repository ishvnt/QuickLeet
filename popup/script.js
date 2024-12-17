document.getElementById('generate').addEventListener('click', ()=> {
    browser.runtime.sendMessage({
      command: 'generate'
    });
  });