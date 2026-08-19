import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const ARTICLE_HTML = `<!doctype html>
<html>
<head>
  <title>다음 세대 자바스크립트 런타임이 온다</title>
  <meta name="author" content="이서연" />
</head>
<body>
  <nav><a href="/">홈</a><a href="/about">소개</a></nav>
  <article>
    <h1>다음 세대 자바스크립트 런타임이 온다</h1>
    <p>지난 10년간 자바스크립트 런타임은 꾸준히 빨라졌지만, 콜드 스타트와 번들링
    파이프라인은 여전히 개발자 경험의 병목으로 남아 있었다. 새 런타임은 이 지점을
    정면으로 겨냥한다.</p>
    <h2>핵심 변화 3가지</h2>
    <ul>
      <li>네이티브 TypeScript 실행 지원</li>
      <li>내장 테스트 러너와 번들러</li>
      <li>기존 Node API와의 높은 호환성</li>
    </ul>
    <p>물론 생태계 성숙도는 여전히 과제로 남아 있다. 주요 프레임워크의 공식 지원이
    뒤따라야 실제 프로덕션 채택이 늘어날 것으로 보인다. 이 문단은 defuddle이 광고나
    내비게이션이 아닌 본문으로 인식할 만큼 충분한 분량을 갖추기 위해 덧붙였다.</p>
  </article>
  <footer>Copyright 2026</footer>
</body>
</html>`;

function request(body: unknown) {
  return new Request("http://localhost/api/convert", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/convert", () => {
  it("rejects an invalid URL without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const res = await POST(request({ url: "not-a-url" }));

    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns title, author, and markdown for a reachable page", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(ARTICLE_HTML, { status: 200 })
    );

    const res = await POST(request({ url: "https://example.com/article" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toContain("다음 세대 자바스크립트 런타임이 온다");
    expect(data.author).toContain("이서연");
    expect(data.markdown).toContain("핵심 변화 3가지");
  });

  it("returns an error when the target page can't be fetched", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("not found", { status: 404 })
    );

    const res = await POST(request({ url: "https://example.com/missing" }));

    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("fetch_failed");
  });

  it("returns an error when the network request throws", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));

    const res = await POST(request({ url: "https://example.com/timeout" }));

    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("fetch_failed");
  });
});
