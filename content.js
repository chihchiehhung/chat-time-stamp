/**
 * @fileoverview Appends the user's local time to the message typed into
 * claude.ai before it is sent.
 *
 * Content scripts cannot use static ES module imports, so everything lives
 * in one IIFE to keep the page's global scope clean.
 */

(() => {
  // Selectors are kept together because claude.ai may change its DOM.
  const EDITOR_SELECTOR = 'div.ProseMirror[contenteditable="true"]';
  // data-testid is used because aria-label changes with the UI language.
  const SEND_BUTTON_SELECTOR = 'button[data-testid="chat-input-send"]';

  const STAMP_PREFIX = '[Current local time:';

  let isEnabled = true;

  /** True while we re-trigger the send ourselves, so we don't intercept it. */
  let isInternalSend = false;

  /**
   * Formats the offset from UTC, e.g. "UTC+8" or "UTC-5:30".
   * @param {!Date} date
   * @return {string}
   */
  function formatUtcOffset(date) {
    const totalMinutes = -date.getTimezoneOffset();
    const sign = totalMinutes < 0 ? '-' : '+';
    const hours = Math.floor(Math.abs(totalMinutes) / 60);
    const minutes = Math.abs(totalMinutes) % 60;
    const minutePart = minutes ? `:${String(minutes).padStart(2, '0')}` : '';
    return `UTC${sign}${hours}${minutePart}`;
  }

  /**
   * Builds the English time stamp, e.g.
   * "[Current local time: 2026-10-24 Sat 14:32 (Asia/Taipei, UTC+8)]".
   * The locale is fixed to en-US so the text stays English regardless of the
   * browser language.
   * @return {string}
   */
  function buildStamp() {
    const now = new Date();
    const parts = {};
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    for (const {type, value} of formatter.formatToParts(now)) {
      parts[type] = value;
    }
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    const time = `${parts.hour}:${parts.minute}`;
    const zone = `${timeZone}, ${formatUtcOffset(now)}`;
    return `${STAMP_PREFIX} ${date} ${parts.weekday} ${time} (${zone})]`;
  }

  /**
   * Inserts the stamp as a new paragraph at the end of the editor. Uses
   * execCommand because it produces native input events that ProseMirror
   * understands; editing the DOM directly would be reverted. execCommand is
   * deprecated but still the most reliable way to edit a ProseMirror field.
   * @param {!Element} editor
   * @param {string} stamp
   */
  function appendToEditor(editor, stamp) {
    editor.focus();
    const selection = window.getSelection();
    selection.selectAllChildren(editor);
    selection.collapseToEnd();
    document.execCommand('insertParagraph');
    document.execCommand('insertText', false, stamp);
  }

  /**
   * Stamps the pending message, then sends it again on the next frame so
   * ProseMirror has time to absorb the inserted text.
   * @param {!Event} event The original send event, which gets cancelled.
   * @param {!Element} editor
   */
  function stampAndResend(event, editor) {
    if (!isEnabled || isInternalSend) {
      return;
    }
    const text = editor.innerText.trim();
    if (!text || text.includes(STAMP_PREFIX)) {
      return;
    }
    const sendButton = document.querySelector(SEND_BUTTON_SELECTOR);
    if (!sendButton) {
      console.warn('[Claude Time Stamp] Send button not found.');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    appendToEditor(editor, buildStamp());

    requestAnimationFrame(() => {
      // The button may have been re-rendered; look it up again.
      const button = document.querySelector(SEND_BUTTON_SELECTOR) || sendButton;
      isInternalSend = true;
      button.click();
      isInternalSend = false;
    });
  }

  /** @param {!KeyboardEvent} event */
  function onKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }
    // Enter pressed to confirm an IME candidate must not send the message.
    if (event.isComposing) {
      return;
    }
    const editor = event.target.closest?.(EDITOR_SELECTOR);
    if (editor) {
      stampAndResend(event, editor);
    }
  }

  /** @param {!MouseEvent} event */
  function onClick(event) {
    if (!event.target.closest?.(SEND_BUTTON_SELECTOR)) {
      return;
    }
    const editor = document.querySelector(EDITOR_SELECTOR);
    if (editor) {
      stampAndResend(event, editor);
    }
  }

  chrome.storage.sync.get({enabled: true}).then((items) => {
    isEnabled = items.enabled;
  });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.enabled) {
      isEnabled = changes.enabled.newValue;
    }
  });

  // Capture phase so we run before claude.ai's own handlers.
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('click', onClick, true);
})();
