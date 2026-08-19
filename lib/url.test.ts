import { describe, expect, it } from "vitest";

import { isConvertibleUrl } from "./url";

describe("isConvertibleUrl", () => {
  it("accepts http(s) URLs with a hostname", () => {
    expect(isConvertibleUrl("https://example.com/article")).toBe(true);
    expect(isConvertibleUrl("http://example.com")).toBe(true);
  });

  it("rejects values without an http(s) scheme", () => {
    expect(isConvertibleUrl("example.com")).toBe(false);
    expect(isConvertibleUrl("ftp://example.com")).toBe(false);
    expect(isConvertibleUrl("")).toBe(false);
  });

  it("rejects malformed or hostname-less URLs", () => {
    expect(isConvertibleUrl("https://")).toBe(false);
    expect(isConvertibleUrl("https://localhost")).toBe(false);
  });
});
