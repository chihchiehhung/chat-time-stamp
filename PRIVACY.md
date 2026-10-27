# Privacy Policy

Chat Time Stamp does not collect, store, or transmit any personal data.

## What the extension does

When you send a message on a supported site (currently Claude and Gemini),
the extension reads the clock and time zone of your own computer and adds a
line such as `[Current local time: 2026-10-24 Sat 14:32 (Asia/Taipei, UTC+8)]`
to the end of your message. The added text is visible in the input box and in
the conversation, so you can always see exactly what was added.

## Data handling

- **Message content:** The extension looks at the text in the input box only
  to check that it is not empty. It is never saved, logged, or sent anywhere
  by the extension.
- **Time stamp:** It is part of the message you send, so it goes to the site
  you are using, just like the rest of your message. The extension itself
  makes no network requests.
- **Settings:** The on/off switch is stored with `chrome.storage.sync`. If
  Chrome Sync is enabled, Chrome may sync this single setting across your
  devices. Nothing else is stored.
- **No analytics, no tracking, no ads, no remote code.**

## Permissions

- `storage`: remembers whether the switch is on or off.
- Access to `claude.ai` and `gemini.google.com`: required to add the time to
  messages on those sites. The extension does nothing on any other site.

## Contact

Questions or concerns: open an issue in this repository.
