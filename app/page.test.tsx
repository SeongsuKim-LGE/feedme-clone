import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/page";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Home", () => {
  it("renders the URL input and action buttons", () => {
    render(<Home />);

    expect(screen.getByLabelText("웹 페이지 URL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지우기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "변환하기" })).toBeInTheDocument();
  });

  it("shows an inline error for an invalid URL without calling fetch", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    render(<Home />);

    fireEvent.change(screen.getByLabelText("웹 페이지 URL"), {
      target: { value: "그냥 아무 텍스트" },
    });
    fireEvent.click(screen.getByRole("button", { name: "변환하기" }));

    expect(
      screen.getByText(/올바른 URL 형식이 아니에요/)
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows the title, author, and markdown after a successful conversion", async () => {
    vi.spyOn(global, "fetch").mockReturnValue(
      jsonResponse({
        title: "다음 세대 자바스크립트 런타임이 온다",
        author: "이서연",
        markdown: "## 핵심 변화\n\n첫 번째 문단입니다.",
      })
    );
    render(<Home />);

    fireEvent.change(screen.getByLabelText("웹 페이지 URL"), {
      target: { value: "https://example.com/article" },
    });
    fireEvent.click(screen.getByRole("button", { name: "변환하기" }));

    expect(
      await screen.findByRole("heading", {
        name: "다음 세대 자바스크립트 런타임이 온다",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("이서연")).toBeInTheDocument();
    expect(screen.getByText("첫 번째 문단입니다.")).toBeInTheDocument();
  });

  it("shows a retryable error when the conversion fails", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockReturnValue(jsonResponse({ error: "fetch_failed" }, 502));
    render(<Home />);

    fireEvent.change(screen.getByLabelText("웹 페이지 URL"), {
      target: { value: "https://example.com/blocked" },
    });
    fireEvent.click(screen.getByRole("button", { name: "변환하기" }));

    const retryButton = await screen.findByRole("button", { name: "다시 시도" });
    expect(screen.getByText(/페이지를 가져오지 못했어요/)).toBeInTheDocument();

    fireEvent.click(retryButton);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  it("resets everything when clearing", async () => {
    vi.spyOn(global, "fetch").mockReturnValue(
      jsonResponse({ title: "제목", author: "저자", markdown: "본문" })
    );
    render(<Home />);

    const input = screen.getByLabelText("웹 페이지 URL") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "https://example.com/a" } });
    fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
    await screen.findByRole("heading", { name: "제목" });

    fireEvent.click(screen.getByRole("button", { name: "지우기" }));

    expect(input.value).toBe("");
    expect(
      screen.queryByRole("heading", { name: "제목" })
    ).not.toBeInTheDocument();
  });

  it("clears a stale result when a later submission is an invalid URL", async () => {
    vi.spyOn(global, "fetch").mockReturnValue(
      jsonResponse({ title: "제목", author: "저자", markdown: "본문" })
    );
    render(<Home />);

    const input = screen.getByLabelText("웹 페이지 URL") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "https://example.com/a" } });
    fireEvent.click(screen.getByRole("button", { name: "변환하기" }));
    await screen.findByRole("heading", { name: "제목" });

    fireEvent.change(input, { target: { value: "그냥 아무 텍스트" } });
    fireEvent.click(screen.getByRole("button", { name: "변환하기" }));

    expect(screen.getByText(/올바른 URL 형식이 아니에요/)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "제목" })
    ).not.toBeInTheDocument();
  });

  it("toggles and persists dark mode", () => {
    render(<Home />);

    const toggle = screen.getByLabelText("다크모드 전환");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("url-to-md-dark")).toBe("1");
  });
});
