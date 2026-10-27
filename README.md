# Chat Time Stamp

[English](#english) | [繁體中文](#繁體中文)

![Chat Time Stamp icon](docs/icon-preview.png)

---

## English

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

### Install (from source)

1. Clone or download this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Open claude.ai or gemini.google.com and send a message.

Use the toolbar icon to switch the extension on or off.

### How it works

A content script listens for Enter and for clicks on the send button. Before
the message goes out, it cancels the send, inserts the time line into the
editor, waits one frame so the page's editor picks up the change, and then
clicks the send button again. The time comes from your computer's clock and
time zone; nothing is fetched from a server.

See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) for details (written in
Traditional Chinese).

### Project layout

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

#### Adding a site

1. Add `extension/content/sites/<site>.js` that sets
   `globalThis.chatTimeStampAdapter = {editorSelector, sendButtonSelector}`.
2. Add a `content_scripts` entry to `manifest.json` that loads the adapter
   file before `content/core.js`.

Selectors depend on each site's markup, so they may need updating when a site
changes its design. Each site's selectors live only in its adapter file.

### Build a release zip

```
scripts/build.sh
```

The zip is written to `dist/`.

### Privacy

The extension collects nothing and makes no network requests. See
[PRIVACY.md](PRIVACY.md).

### License

[MIT](LICENSE)

---

## 繁體中文

AI 聊天助理不知道現在幾點。Chat Time Stamp 是一個 Chrome 擴充功能，會在你送出每則訊息時，
自動在結尾附上你的當地時間，不用每次再叫助理去查時間。

```
晚餐吃什麼好？

[Current local time: 2026-10-24 Sat 18:32 (Asia/Taipei, UTC+8)]
```

附加的那一行會直接顯示在輸入框和對話紀錄中，你隨時看得到實際送出了什麼。時間字串固定使用英文格式。

目前支援 **Claude**（claude.ai）和 **Gemini**（gemini.google.com）。

> 本專案與 Anthropic、Google 無任何關聯，亦未獲其背書或贊助。
> Claude、Gemini 為其各自所有者之商標。

### 安裝（從原始碼）

1. 下載或 clone 這個 repository。
2. 開啟 `chrome://extensions`，打開右上角的**開發人員模式**。
3. 按**載入未封裝項目**，選擇 `extension/` 資料夾。
4. 開啟 claude.ai 或 gemini.google.com 並送出一則訊息。

點工具列上的圖示可以開啟或關閉這個功能。

### 運作原理

Content script 會監聽 Enter 鍵和送出按鈕的點擊。訊息送出之前，它先取消這次送出，把時間那一行插入輸入框，
等一個 frame 讓網頁的編輯器吸收這個變更，再重新點擊送出按鈕。時間來自你電腦的系統時鐘與時區，
不會向任何伺服器取得。

詳細說明見 [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)。

### 專案結構

```
extension/
  manifest.json
  content/core.js          共用邏輯
  content/sites/claude.js  claude.ai 的 selector
  content/sites/gemini.js  gemini.google.com 的 selector
  popup.*                  工具列 popup（開關）
  icons/
scripts/
  build.sh                 把 extension/ 打包成 dist/*.zip
  make-icons.py            重新產生圖示
```

#### 新增支援的網站

1. 新增 `extension/content/sites/<site>.js`，設定
   `globalThis.chatTimeStampAdapter = {editorSelector, sendButtonSelector}`。
2. 在 `manifest.json` 新增一筆 `content_scripts`，並讓 adapter 檔在 `content/core.js` 之前載入。

Selector 取決於各網站的 HTML 結構，網站改版時可能需要更新。每個網站的 selector 只存在於它自己的 adapter 檔中。

### 打包發佈用的 zip

```
scripts/build.sh
```

zip 會輸出到 `dist/`。

### 隱私

這個擴充功能不蒐集任何資料，也不發出任何網路請求。見 [PRIVACY.md](PRIVACY.md)。

### 授權

[MIT](LICENSE)
