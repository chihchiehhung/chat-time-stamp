# Chat Time Stamp

![Chat Time Stamp icon](docs/icon-preview.png)

AI chat assistants do not know what time it is. Chat Time Stamp is a Chrome
extension that adds your local time to the end of every message you send, so
you never have to tell the assistant to check the time.

```
What should I have for dinner?

[Current local time: 2026-10-24 Sat 18:32 (Asia/Taipei, UTC+8)]
```

The added line appears in the input box and in the conversation, so you can
always see exactly what was sent.

Currently supports **Claude** (claude.ai) and **Gemini** (gemini.google.com).

> Not affiliated with, endorsed by, or sponsored by Anthropic or Google.
> Claude and Gemini are trademarks of their respective owners.

## Install (from source)

1. Clone or download this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Open claude.ai or gemini.google.com and send a message.

Use the toolbar icon to switch the extension on or off.

## How it works

A content script listens for Enter and for clicks on the send button. Before
the message goes out, it cancels the send, inserts the time line into the
editor, waits one frame so the page's editor picks up the change, and then
clicks the send button again. The time comes from your computer's clock and
time zone; nothing is fetched from a server.

See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) for details.

## Project layout

```
extension/
  manifest.json
  content/core.js          shared logic
  content/sites/claude.js  selectors for claude.ai
  content/sites/gemini.js  selectors for gemini.google.com
  popup.*                  toolbar popup with the on/off switch
  icons/
scripts/
  build.sh                 packages extension/ into dist/*.zip
  make-icons.py            regenerates the icons
```

### Adding a site

1. Add `extension/content/sites/<site>.js` that sets
   `globalThis.chatTimeStampAdapter = {editorSelector, sendButtonSelector}`.
2. Add a `content_scripts` entry to `manifest.json` that loads the adapter
   file before `content/core.js`.

Selectors depend on each site's markup, so they may need updating when a site
changes its design. Each site's selectors live only in its adapter file.

## Build a release zip

```
scripts/build.sh
```

The zip is written to `dist/`.

## Privacy

The extension collects nothing and makes no network requests. See
[PRIVACY.md](PRIVACY.md).

## License

[MIT](LICENSE)
