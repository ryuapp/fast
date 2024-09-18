/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2022 Yagiz Nizipli
 */

import querystring from "node:querystring";
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { querystring as qs } from "./mod.ts";
import { qsNoMungeTestCases, qsTestCases, qsWeirdObjects } from "./node.ts";

const { test } = Deno;

test("should succeed on node.js tests", () => {
  qsWeirdObjects.forEach((t) =>
    assertEquals(
      qs.stringify(t[2] as Record<string, unknown> as never),
      t[1] as string,
    )
  );
  qsNoMungeTestCases.forEach((t) => assertEquals(qs.stringify(t[1]), t[0]));
  qsTestCases.forEach((t) => assertEquals(qs.stringify(t[2]), t[1]));
});

test("native querystring module should match the test suite result", () => {
  qsTestCases.forEach((t) => assertEquals(querystring.stringify(t[2]), t[1]));
  qsNoMungeTestCases.forEach((t) =>
    assertEquals(querystring.stringify(t[1]), t[0])
  );
});

test("should handle numbers", () => {
  assertEquals(
    qs.stringify({ age: 5, name: "John Doe" }),
    "age=5&name=John%20Doe",
  );
});

test("should handle mixed ascii and non-ascii", () => {
  assertEquals(qs.stringify({ name: "Jöhn Doe" }), "name=J%C3%B6hn%20Doe");
});

test("should handle BigInt", () => {
  assertEquals(
    qs.stringify({ age: BigInt(55), name: "John" }),
    "age=55&name=John",
  );
  assertStrictEquals(qs.stringify({ foo: 2n ** 1023n }), "foo=" + 2n ** 1023n);
  assertStrictEquals(qs.stringify([0n, 1n, 2n] as never), "0=0&1=1&2=2");
});

test("should handle boolean values", () => {
  assertEquals(qs.stringify({ valid: true }), "valid=true");
  assertEquals(qs.stringify({ valid: false }), "valid=false");
});

test("should handle numbers", () => {
  assertEquals(qs.stringify({ value: 1e22 }), "value=1e%2B22");
});

test("should omit objects", () => {
  // This aligns with querystring module
  assertEquals(qs.stringify({ user: {} } as never), "user=");
});

test("should omit non-object inputs", () => {
  assertEquals(qs.stringify("hello" as never), "");
});

test("should handle utf16 characters", () => {
  assertEquals(qs.stringify({ utf16: "ܩ" }), "utf16=%DC%A9");
  assertEquals(qs.stringify({ utf16: "睷" }), "utf16=%E7%9D%B7");
  assertEquals(qs.stringify({ utf16: "aܩ" }), "utf16=a%DC%A9");
  assertEquals(qs.stringify({ utf16: "a睷" }), "utf16=a%E7%9D%B7");
});

test("should handle multi-byte characters", () => {
  assertEquals(qs.stringify({ multiByte: "𝌆" }), "multiByte=%F0%9D%8C%86");
});

test("invalid surrogate pair should throw", () => {
  assertThrows(() => qs.stringify({ foo: "\udc00" }), "URI malformed");
});

test("should omit nested values", () => {
  const f = qs.stringify({
    a: "b",
    q: qs.stringify({
      x: "y",
      y: "z",
    }),
  });
  assertStrictEquals(f, "a=b&q=x%3Dy%26y%3Dz");
});

test("should coerce numbers to string", () => {
  assertStrictEquals(qs.stringify({ foo: 0 }), "foo=0");
  assertStrictEquals(qs.stringify({ foo: -0 }), "foo=0");
  assertStrictEquals(qs.stringify({ foo: 3 }), "foo=3");
  assertStrictEquals(qs.stringify({ foo: -72.42 }), "foo=-72.42");
  assertStrictEquals(qs.stringify({ foo: Number.NaN }), "foo=");
  assertStrictEquals(qs.stringify({ foo: 1e21 }), "foo=1e%2B21");
  assertStrictEquals(qs.stringify({ foo: Number.POSITIVE_INFINITY }), "foo=");
});

test("should return empty string on certain inputs", () => {
  assertStrictEquals(qs.stringify(undefined as never), "");
  assertStrictEquals(qs.stringify(0 as never), "");
  assertStrictEquals(qs.stringify([] as never), "");
  assertStrictEquals(qs.stringify(null as never), "");
  assertStrictEquals(qs.stringify(true as never), "");
});
