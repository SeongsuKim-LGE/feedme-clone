import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDarkMode,
  getServerDarkMode,
  setDarkMode,
  subscribeDarkMode,
} from "./dark-mode";

beforeEach(() => {
  localStorage.clear();
});

describe("dark mode store", () => {
  it("defaults to false when nothing is stored", () => {
    expect(getDarkMode()).toBe(false);
  });

  it("always reports false for the server snapshot", () => {
    expect(getServerDarkMode()).toBe(false);
  });

  it("persists the value and reflects it in later reads", () => {
    setDarkMode(true);
    expect(getDarkMode()).toBe(true);

    setDarkMode(false);
    expect(getDarkMode()).toBe(false);
  });

  it("notifies subscribers when the value changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDarkMode(listener);

    setDarkMode(true);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setDarkMode(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
