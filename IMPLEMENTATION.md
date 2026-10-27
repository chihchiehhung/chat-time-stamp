# Claude Time Stamp — Implementation Doc

## 目標

在 claude.ai 網頁版按下送出時，自動把使用者當地時間附加在訊息結尾，讓 Claude 知道現在幾點。
附加的文字會**直接顯示在輸入框與對話紀錄中**，使用者能清楚看到多送了什麼。popup 提供總開關。

## 範圍

- In scope：claude.ai 網頁版、Chrome、Manifest V3、popup on/off 開關。
- Out of scope（v1）：手機 / 桌面 app、「只在第一則加」模式、自訂格式、其他 AI 網站。

## 檔案結構

```
manifest.json
content.js      # 攔截送出 + 注入時間
popup.html      # 開關 UI
popup.js        # 讀寫開關狀態
```

## manifest.json

- `manifest_version: 3`
- `permissions: ["storage"]`
- `content_scripts`: matches `https://claude.ai/*`，`js: ["content.js"]`，`run_at: "document_idle"`
- `action.default_popup: "popup.html"`

## 狀態儲存

`chrome.storage.sync`，單一 key：`enabled`（boolean，預設 `true`）。

- popup.js：開啟時讀取並設定 checkbox，變更時寫入。
- content.js：啟動時讀取，並監聽 `chrome.storage.onChanged` 即時更新記憶體中的 `enabled`，不需重新整理頁面。

## 時間字串格式

```
[Current local time: 2026-10-24 Sat 14:32 (Asia/Taipei, UTC+8)]
```

- 日期時間用 `Intl.DateTimeFormat`，locale 固定寫死 `"en-US"`（`hour12: false`），不跟隨瀏覽器語言，確保星期等文字永遠是英文。
- 時區名稱：`Intl.DateTimeFormat().resolvedOptions().timeZone`。
- UTC offset：由 `-new Date().getTimezoneOffset()` 換算成 `UTC+8` / `UTC-5:30`。
- 附加方式：在輸入框尾端先 `insertParagraph` 換段，再 `insertText` 插入字串（不直接塞 `\n\n`，ProseMirror 對文字中的換行處理不可靠）。
- 程式風格遵循 Google JS / HTML / CSS style guide；content script 無法用 ES module，故以 IIFE 包住。

## 核心流程（content.js）

### 1. 找元素
- 輸入框：`div[contenteditable="true"].ProseMirror`（claude.ai 使用 ProseMirror）。
- 送出按鈕：用 `aria-label` 比對（如 `Send`）。**實作第一步先用 DevTools 確認實際 selector**，並考慮多語系 label，必要時改以「輸入框所在 form 內的 submit 按鈕」定位。

### 2. 攔截送出（capture phase，掛在 `document`）
兩個進入點：

| 事件 | 條件 |
|---|---|
| `keydown` | `key === "Enter"`、`!shiftKey`、`!event.isComposing`、`keyCode !== 229`（避免中文輸入法選字時誤觸）、目標在輸入框內 |
| `click` | 目標是送出按鈕（`closest`） |

### 3. 處理邏輯
```
if (!enabled || internalSend) return         // 開關關閉，或這是我們自己觸發的送出
text = editor.innerText.trim()
if (!text) return                            // 空訊息放行（可能只有附件）
if (text.includes("[Current local time:")) return   // 已加過，避免重複
event.preventDefault(); event.stopPropagation()      // 先擋下原本的送出
insertAtEnd(editor, "\n\n" + stamp)
await nextFrame()                            // 等 ProseMirror 吃進變更
internalSend = true
sendButton.click()                           // 重新觸發送出
internalSend = false
```

### 4. 注入文字：`insertAtEnd`
直接改 `textContent` / `innerHTML` 會被 ProseMirror 還原或不同步。改用：
1. `editor.focus()`
2. 用 `Selection` / `Range` 把游標移到內容末端
3. `document.execCommand("insertText", false, text)`，這會產生瀏覽器原生的輸入事件，ProseMirror 能正確處理。

## 為什麼先擋再重送

ProseMirror 對 DOM 變更的同步是非同步的。若在原本的 keydown 流程中直接插入文字，網站的送出邏輯可能在讀取編輯器狀態時還沒包含新文字。因此：擋下 → 插入 → 等一個 frame → 程式化點擊送出按鈕，確保送出的內容包含時間字串。`internalSend` flag 防止我們自己的點擊再被攔截而無限迴圈。

## popup

- 一個 toggle：「Append local time on send」。
- 狀態文字顯示 ON / OFF。
- 無其他設定。

## 邊界情況

| 情況 | 處理 |
|---|---|
| 中文輸入法組字中按 Enter | `isComposing` / `keyCode 229` 跳過 |
| Shift+Enter 換行 | 不攔截 |
| 空輸入框 | 放行，不加時間 |
| 已含時間標記（重送、編輯後再送） | 不重複加 |
| 開關關閉 | 完全放行，行為與無 extension 相同 |
| 編輯舊訊息後送出 | v1 不處理（只認主輸入框），若實測有問題再評估 |
| 找不到送出按鈕 | 放行原事件，不加時間，`console.warn` |

## 已知風險

1. **claude.ai DOM 改版**會使 selector 失效。selector 集中放在檔案頂部常數，方便修。
2. 程式化 `click()` 是否被站方接受需實測；備案是重新 dispatch Enter 的 `KeyboardEvent`。
3. `execCommand` 已被標示 deprecated，但目前仍是對 contenteditable / ProseMirror 最可靠的做法；備案是 dispatch `beforeinput` 的 `insertText`。

## 實作順序

1. 建 manifest + 空的 content.js，載入 extension，確認在 claude.ai 有執行。
2. DevTools 確認輸入框與送出按鈕 selector。
3. 先做「手動測試」：在 console 呼叫 `insertAtEnd` 看 ProseMirror 是否接受。
4. 接上 Enter / 點擊攔截與重送。
5. 做 storage + popup 開關。
6. 跑完下方測試清單。

## 測試清單

- [ ] 一般文字 + Enter：送出內容結尾有時間
- [ ] 一般文字 + 點送出按鈕：同上
- [ ] Shift+Enter：只換行
- [ ] 注音 / 拼音選字按 Enter：不送出、不加時間
- [ ] 空輸入框：無反應
- [ ] 只有附件、無文字：行為同原版
- [ ] 開關 OFF：不加時間；切 ON 後不需重新整理即生效
- [ ] 連續送多則：每則各一個時間、不重複
- [ ] 新對話頁與既有對話頁皆可用
