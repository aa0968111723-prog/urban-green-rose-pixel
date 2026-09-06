import { chromium } from "playwright";

const BASE = process.env.QA_URL || "http://127.0.0.1:8080";

async function flow(page, label) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(`${BASE}/?source=booth-a&utm_source=ig`, { waitUntil: "networkidle" });
  await page.getByLabel(/姓名/).fill("小華");
  await page.getByLabel(/系級/).fill("資工一A");
  await page.getByLabel(/手機/).fill("0912345678");
  await page.getByRole("button", { name: "開始探索" }).click();

  await page.getByText("1 / 10").waitFor();
  for (let i = 0; i < 4; i += 1) {
    await page.locator(".option").nth(i % 4).click();
    await page.waitForTimeout(400);
  }
  await page.getByRole("button", { name: "上一題" }).click();
  await page.locator(".option.selected").waitFor();
  await page.locator(".option").nth(1).click();
  await page.waitForTimeout(400);

  while (await page.locator(".option").count()) {
    const onResult = await page.locator(".result-title").count();
    if (onResult) break;
    await page.locator(".option").first().click();
    await page.waitForTimeout(400);
    const stillQuiz = await page.locator(".option").count();
    if (!stillQuiz) break;
  }

  await page.locator(".result-title").waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const title = await page.locator(".result-title").innerText();
  const submit = await page.locator(".submit-status").innerText();

  return { label, title, submit, overflow, errors, viewport: page.viewportSize() };
}

const browser = await chromium.launch({ headless: true });
const results = [];
for (const vp of [
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 1280, height: 800 },
]) {
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  results.push(await flow(page, `${vp.width}x${vp.height}`));
  await context.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
const bad = results.filter((r) => r.overflow || r.errors.length || !r.title);
process.exit(bad.length ? 1 : 0);
