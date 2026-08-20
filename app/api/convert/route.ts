import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";
import { NextResponse } from "next/server";

import { isConvertibleUrl } from "@/lib/url";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";

  if (!isConvertibleUrl(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let html: string;
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; url-to-markdown/1.0)",
      },
    });
    if (!response.ok) {
      return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
    }
    html = await response.text();
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }

  try {
    const { document } = parseHTML(html);
    const result = await Defuddle(document, url, { markdown: true });
    if (!result.content) {
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }
    return NextResponse.json({
      title: result.title ?? "",
      author: result.author ?? "",
      markdown: result.content,
    });
  } catch {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }
}
