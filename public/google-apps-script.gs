/**
 * 淡江大學領袖社｜探索你的領袖特質
 * 選用第二出口：把此腳本貼到 Google Apps Script，部署為網頁應用程式，
 * 再把網址設成伺服器環境變數 GOOGLE_SCRIPT_URL（不要放進前端）。
 *
 * 正式資料仍應由 /api/quiz/submit 驗證並寫入資料庫。
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
      data.submissionId || "",
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
      data.source || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.alreadyRegistered ? "yes" : "no",
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
      "time", "submissionId", "name", "department", "phone", "email", "score", "title",
      "visionScore", "empathyScore", "decisionScore", "crisisScore",
      "answersText", "answersJson", "source", "utm_source", "utm_medium", "utm_campaign",
      "alreadyRegistered",
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
