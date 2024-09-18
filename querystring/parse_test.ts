/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2022 Yagiz Nizipli
 */

import querystring from "node:querystring";
import {
  assertEquals,
  assertObjectMatch,
  assertStrictEquals,
} from "@std/assert";
import { querystring as qs } from "./mod.ts";
import { qsNoMungeTestCases, qsTestCases, qsWeirdObjects } from "./node.ts";

const { test } = Deno;

test("should succeed on node.js tests", () => {
  qsWeirdObjects.forEach((t) =>
    assertEquals(qs.parse(t[1] as string), t[2] as Record<string, unknown>)
  );
  qsNoMungeTestCases.forEach((t) => assertObjectMatch(qs.parse(t[0]), t[1]));
  qsTestCases.forEach((t) => assertEquals(qs.parse(t[0]), t[2]));
});

test("native querystring module should match the test suite result", () => {
  qsTestCases.forEach((t) => assertObjectMatch(querystring.parse(t[0]), t[2]));
  qsNoMungeTestCases.forEach((t) =>
    assertObjectMatch(querystring.parse(t[0]), t[1])
  );
});

test("handles & on first/last character", () => {
  assertEquals(qs.parse("&hello=world"), { hello: "world" });
  assertEquals(qs.parse("hello=world&"), { hello: "world" });
});

test("handles ? on first character", () => {
  // This aligns with `node:querystring` functionality
  assertEquals(qs.parse("?hello=world"), { "?hello": "world" });
});

test("handles + character", () => {
  assertEquals(qs.parse("author=Yagiz+Nizipli"), {
    author: "Yagiz Nizipli",
  });
});

test("should accept pairs with missing values", () => {
  assertEquals(qs.parse("foo=bar&hey"), { foo: "bar", hey: "" });
  assertEquals(qs.parse("hey"), { hey: "" });
});

test("should decode key", () => {
  assertEquals(qs.parse("invalid%key=hello"), { "invalid%key": "hello" });
  assertEquals(qs.parse("full%20name=Yagiz"), { "full name": "Yagiz" });
});

test("should handle really large object", () => {
  const query: { [key: number]: number } = {};

  for (let i = 0; i < 2000; i++) query[i] = i;

  const url = qs.stringify(query);

  assertStrictEquals(Object.keys(qs.parse(url)).length, 2000);
});

test("should parse large numbers", () => {
  assertStrictEquals(
    qs.parse("id=918854443121279438895193").id,
    "918854443121279438895193",
  );
});
