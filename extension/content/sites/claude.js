/**
 * @fileoverview Site adapter for claude.ai. Selectors live here because the
 * site may change its DOM; this is the only file to touch when that happens.
 */

globalThis.chatTimeStampAdapter = {
  editorSelector: 'div.ProseMirror[contenteditable="true"]',
  // data-testid is used because aria-label changes with the UI language.
  sendButtonSelector: 'button[data-testid="chat-input-send"]',
};
