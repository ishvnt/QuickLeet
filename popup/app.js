// sends message to background script when generate button is clicked
document.getElementById('generate').addEventListener('click', ()=> {
    browser.runtime.sendMessage({
      command: 'generate'
    });
  });