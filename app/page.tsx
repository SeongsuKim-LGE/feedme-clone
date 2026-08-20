"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import {
  getDarkMode,
  getServerDarkMode,
  setDarkMode,
  subscribeDarkMode,
} from "@/lib/dark-mode";
import { isConvertibleUrl } from "@/lib/url";

type Status = "idle" | "loading" | "success" | "error";

type ConvertResult = { title: string; author: string; markdown: string };

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const requestIdRef = useRef(0);

  const dark = useSyncExternalStore(subscribeDarkMode, getDarkMode, getServerDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggleDark() {
    setDarkMode(!dark);
  }

  async function convert(targetUrl: string) {
    if (!isConvertibleUrl(targetUrl)) {
      requestIdRef.current++;
      setInvalid(true);
      setStatus("idle");
      setResult(null);
      return;
    }

    setInvalid(false);
    setStatus("loading");
    const requestId = ++requestIdRef.current;

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (requestId !== requestIdRef.current) return;

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const data = await res.json();
      setResult({
        title: data.title ?? "",
        author: data.author ?? "",
        markdown: data.markdown ?? "",
      });
      setStatus("success");
    } catch {
      if (requestId !== requestIdRef.current) return;
      setStatus("error");
    }
  }

  function handleSubmit() {
    convert(url.trim());
  }

  function handleClear() {
    requestIdRef.current++;
    setUrl("");
    setInvalid(false);
    setStatus("idle");
    setResult(null);
  }

  function handleRetry() {
    convert(url.trim());
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">
            URL <span className="font-normal text-muted-foreground">→</span> Markdown
          </h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label="다크모드 전환"
            onClick={toggleDark}
            type="button"
          >
            {dark ? "☀️" : "🌙"}
          </Button>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <div className="min-w-[220px] flex-1">
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              placeholder="https://example.com/article"
              aria-label="웹 페이지 URL"
              aria-invalid={invalid}
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setInvalid(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              뉴스, 블로그, 기술 문서 등 웹 페이지 URL을 붙여넣어보세요.
            </p>
            {invalid && (
              <p className="mt-1.5 text-xs text-destructive">
                올바른 URL 형식이 아니에요. http(s)://로 시작하는 주소를 입력해주세요.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={handleClear}>
              지우기
            </Button>
            <Button type="button" onClick={handleSubmit}>
              변환하기
            </Button>
          </div>
        </div>

        {status === "idle" && !result && (
          <div className="mt-2 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            <p>아직 변환한 페이지가 없어요. URL을 붙여넣고 &quot;변환하기&quot;를 눌러보세요.</p>
          </div>
        )}

        {status === "loading" && (
          <div
            className="mt-2 flex flex-col gap-3 rounded-lg border border-border p-6"
            aria-live="polite"
            aria-label="변환 중"
          >
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        )}

        {status === "error" && (
          <div className="mt-2 flex flex-col items-start gap-2 rounded-lg border border-border bg-destructive/5 p-5">
            <strong className="text-sm">⚠ 페이지를 가져오지 못했어요</strong>
            <p className="text-sm text-muted-foreground">
              로그인이 필요하거나, 접근이 차단됐거나, 페이지 구조를 해석할 수 없는
              경우일 수 있어요.
            </p>
            <Button variant="outline" size="sm" type="button" onClick={handleRetry}>
              다시 시도
            </Button>
          </div>
        )}

        {status === "success" && result && (
          <div className="mt-2 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold leading-snug tracking-tight">
                {result.title}
              </h2>
              {result.author && (
                <p className="mt-1 text-sm text-muted-foreground">{result.author}</p>
              )}
            </div>
            <div className="max-h-[480px] overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground">
              <div
                className="[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2:first-child]:mt-0 [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_li]:mb-1 [&_p]:mb-3 [&_p]:leading-relaxed [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 text-sm"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
