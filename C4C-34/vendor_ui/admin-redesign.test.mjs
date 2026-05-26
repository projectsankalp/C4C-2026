import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const rootPackage = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

test("admin console defaults to certification and removes community dashboard nav", () => {
  assert.match(html, /id="view-members" class="view active"/);
  assert.match(html, /data-view="members"[^>]*>[\s\S]*Member Approvals/);
  assert.doesNotMatch(html, /data-view="community"/);
  assert.doesNotMatch(html, /Community Head Dashboard/);
});

test("certificate table exposes certificate links through the public route", () => {
  assert.match(html, /id="certificate-list" class="certificate-table"/);
  assert.match(app, /WEB_URL = "http:\/\/localhost:3000"/);
  assert.match(app, /certificateUrl\(member\)/);
  assert.match(app, /View Certificate/);
});

test("dev:all starts the standalone admin console", () => {
  assert.match(rootPackage.scripts["dev:all"], /admin/);
  assert.match(rootPackage.scripts["dev:all"], /vite dev vendor_ui --port 3001/);
});
