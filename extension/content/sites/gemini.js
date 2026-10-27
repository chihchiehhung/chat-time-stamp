/**
 * @fileoverview Site adapter for gemini.google.com. Selectors live here
 * because the site may change its DOM; this is the only file to touch when
 * that happens.
 */

globalThis.chatTimeStampAdapter = {
  // Quill editor. rich-textarea also holds a hidden .ql-clipboard element
  // that is contenteditable too, so target .ql-editor specifically.
  editorSelector: 'rich-textarea div.ql-editor[contenteditable="true"]',
  // data-test-id is used because aria-label changes with the UI language.
  sendButtonSelector:
      '[data-test-id="send-button-container"] gem-icon-button.send-button ' +
      'button',
};
