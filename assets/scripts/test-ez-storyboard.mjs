#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const cli = resolve("assets/scripts/validate-ez-storyboard.mjs");
const source = resolve("references/examples/ez-storyboard-vfd.json");
const run = file => spawnSync(process.execPath, [cli, file], { encoding: "utf8" });
const example = JSON.parse(readFileSync(source, "utf8"));
const good = run(source);
assert.equal(good.status, 0, good.stderr || good.stdout);
assert.match(good.stdout, /6 shots, 1 anchors, 900 frames, 30\.00s/);
const temp = mkdtempSync(join(tmpdir(), "ez-storyboard-"));
try {
  const bad = JSON.parse(JSON.stringify(example));
  bad.shots[1].anchor_ids = ["not-declared"];
  bad.shots[2].start_frame = 999;
  const file = join(temp, "bad.json");
  writeFileSync(file, JSON.stringify(bad));
  const result = run(file);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, /unknown anchor/);
  assert.match(result.stderr, /expected contiguous frame/);
  console.log("EZ storyboard contract: positive and negative tests passed");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
