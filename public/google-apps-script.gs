/**
 * 淡江大學領袖社｜探索你的領袖特質
 * 貼到 Google Apps Script 後部署為「網頁應用程式」：
 * - 執行身分：我
 * - 存取權：任何人
 * 再把部署網址貼回 leader-quiz.html 的 GOOGLE_SCRIPT_URL。
 *
 * 試算表欄位：
 * time | name | department | phone | email | score | title |
 * visionScore | empathyScore | decisionScore | crisisScore |
 * answersText | answersJson
 */
const SHEET_NAME = "leader-quiz";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const sheet = getSheet_();
    sheet.appendRow([
      data.time || "",
      data.name || "",
      data.department || "",
      data.phone || "",
      data.email || "",
      data.score || "",
      data.title || data.result || "",
      data.visionScore || 0,
      data.empathyScore || 0,
      data.decisionScore || 0,
      data.crisisScore || 0,
      data.answersText || "",
      data.answersJson || "",
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "time", "name", "department", "phone", "email", "score", "title",
      "visionScore", "empathyScore", "decisionScore", "crisisScore",
      "answersText", "answersJson",
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
