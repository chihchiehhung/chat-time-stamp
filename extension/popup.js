/**
 * @fileoverview Popup logic: shows and saves the on/off switch.
 */

const toggle = document.getElementById('enabled-toggle');
const statusText = document.getElementById('status-text');

/** @param {boolean} isEnabled */
function render(isEnabled) {
  toggle.checked = isEnabled;
  statusText.textContent = isEnabled ?
      'On: time is added when you send' :
      'Off: messages are sent as typed';
  statusText.classList.toggle('status-on', isEnabled);
}

chrome.storage.sync.get({enabled: true}).then((items) => {
  render(items.enabled);
});

toggle.addEventListener('change', () => {
  chrome.storage.sync.set({enabled: toggle.checked});
  render(toggle.checked);
});
