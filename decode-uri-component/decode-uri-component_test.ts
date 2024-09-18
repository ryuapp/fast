/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2018 Tomas Della Vedova
 * Copyright (c) 2017 Justin Ridgewell
 * Copyright (c) 2008-2009 Bjoern Hoehrmann <bjoern@hoehrmann.de>
 */

import { assertEquals } from "@std/assert";
import { decodeURIComponent as fastDecode } from "./mod.ts";

Deno.test("Basic", () => {
  // 'hello'
  assertEquals(fastDecode("hello"), decodeURIComponent("hello"));
  // 'Hello World'
  assertEquals(
    fastDecode("Hello%20World"),
    decodeURIComponent("Hello%20World"),
  );
  // 'a+b+c+d'
  assertEquals(fastDecode("a+b+c+d"), decodeURIComponent("a+b+c+d"));
  // %
  assertEquals(fastDecode("%25"), decodeURIComponent("%25"));
  // '/test/hel/lo'
  assertEquals(
    fastDecode("/test/hel%2Flo"),
    decodeURIComponent("/test/hel%2Flo"),
  );
  // undefined
  assertEquals(fastDecode(`/test/hel%"Flo`), undefined);
});
