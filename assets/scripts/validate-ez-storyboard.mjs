#!/usr/bin/env node
// Dependency-free structural gate for EZ storyboard v0.1.
// This is NOT a visual, engineering, copyright, or fact verification.
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node assets/scripts/validate-ez-storyboard.mjs <storyboard.json>");
  process.exit(2);
}
let data;
try {
  data = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
} catch (error) {
  console.error("Cannot parse storyboard:", error.message);
  process.exit(2);
}
const errors = [];
const fail = (where, why) => errors.push(`${where}: ${why}`);
const str = (x) => typeof x === "string" && x.trim().length > 0;
const list = (x) => Array.isArray(x);
const nat = (x) => Number.isInteger(x) && x >= 0;
if (data?.schema_version !== "ez.storyboard.v0.1") fail("schema_version", "expected ez.storyboard.v0.1");
const p = data?.project ?? {};
for (const k of ["id", "title"]) if (!str(p[k])) fail(`project.${k}`, "required text");
for (const k of ["fps", "width", "height"]) if (!Number.isInteger(p[k]) || p[k] <= 0) fail(`project.${k}`, "must be a positive integer");
if (!list(data?.anchors)) fail("anchors", "must be array");
if (!list(data?.shots) || !data.shots.length) fail("shots", "must be non-empty array");
const anchors = new Set();
for (const [i, a] of (list(data?.anchors) ? data.anchors : []).entries()) {
  const at = `anchors[${i}]`;
  if (!str(a?.id)) fail(at + ".id", "required text");
  else if (anchors.has(a.id)) fail(at + ".id", "duplicate anchor id");
  else anchors.add(a.id);
  for (const k of ["kind", "label", "reference_asset"]) if (!str(a?.[k])) fail(at + "." + k, "required text");
  for (const k of ["must_keep", "allowed_variations", "evidence"]) if (!list(a?.[k]) || !a[k].every(str)) fail(at + "." + k, "must be array of text");
  if (!list(a?.must_keep) || !a.must_keep.length) fail(at + ".must_keep", "at least one invariant");
}
const ids = new Set();
let nextFrame = 0;
for (const [i, s] of (list(data?.shots) ? data.shots : []).entries()) {
  const at = `shots[${i}]`;
  if (!str(s?.id)) fail(at + ".id", "required text");
  else if (ids.has(s.id)) fail(at + ".id", "duplicate shot id");
  else ids.add(s.id);
  if (!nat(s?.start_frame) || s.start_frame !== nextFrame) fail(at + ".start_frame", `expected contiguous frame ${nextFrame}`);
  if (!Number.isInteger(s?.duration_frames) || s.duration_frames <= 0) fail(at + ".duration_frames", "must be positive integer");
  if (nat(s?.start_frame) && Number.isInteger(s?.duration_frames) && s.duration_frames > 0) nextFrame = s.start_frame + s.duration_frames;
  for (const k of ["intent", "shot_size", "camera_motion", "camera_reason", "visual_description", "transition"]) if (!str(s?.[k])) fail(at + "." + k, "required text");
  for (const k of ["anchor_ids", "source_assets", "sfx"]) if (!list(s?.[k]) || !s[k].every(str)) fail(at + "." + k, "must be array of text");
  if (list(s?.anchor_ids)) for (const id of s.anchor_ids) if (!anchors.has(id)) fail(at + ".anchor_ids", `unknown anchor ${id}`);
  if (!str(s?.shot_card) && s?.shot_card !== null) fail(at + ".shot_card", "must be text or null");
  if (typeof s?.caption !== "string") fail(at + ".caption", "must be text");
  if (typeof s?.review_required !== "boolean") fail(at + ".review_required", "must be boolean");
}
if (errors.length) {
  for (const e of errors) console.error("ERROR", e);
  console.error(`INVALID (${errors.length} error(s))`);
  process.exit(1);
}
console.log(`OK: ${data.shots.length} shots, ${anchors.size} anchors, ${nextFrame} frames, ${(nextFrame / p.fps).toFixed(2)}s @ ${p.fps} fps`);
