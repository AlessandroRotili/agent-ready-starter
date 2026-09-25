import test from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../lib/auth/redirect";
import { sameOrigin } from "../lib/http/security";
import { documentPath, uploadInput } from "../lib/media/documents";

test("redirects stay inside authenticated application routes", () => {
  for (const input of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/account/../../evil",
    "/login",
    "/account\nfoo",
    null,
  ]) {
    assert.equal(safeNext(input), "/account");
  }
  assert.equal(
    safeNext("/account/password?from=mail"),
    "/account/password?from=mail",
  );
  assert.equal(safeNext("/admin"), "/admin");
});
test("browser writes require an exact configured origin", () => {
  const origin = "https://app.example";
  for (const value of [
    null,
    "null",
    "https://app.example.evil.test",
    "http://app.example",
  ]) {
    assert.equal(
      sameOrigin(
        new Request(origin, { headers: value ? { origin: value } : {} }),
        origin,
      ),
      false,
    );
  }
  assert.equal(
    sameOrigin(new Request(origin, { headers: { origin } }), origin),
    true,
  );
});
test("private uploads reject oversized or active content and build owned paths", () => {
  const valid = {
    action: "prepare",
    name: "Report.pdf",
    type: "application/pdf",
    size: 200,
  };
  assert.equal(uploadInput.safeParse(valid).success, true);
  for (const change of [
    { size: 8388609 },
    { size: 0 },
    { type: "text/html" },
    { type: "image/svg+xml" },
    { name: "\n" },
  ]) {
    assert.equal(uploadInput.safeParse({ ...valid, ...change }).success, false);
  }
  const owner = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  assert.equal(
    documentPath(owner, id, "application/pdf"),
    `${owner}/${id}.pdf`,
  );
  assert.throws(() => documentPath("../other-user", id, "application/pdf"));
});
