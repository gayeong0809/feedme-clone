"use server"

import { Defuddle } from "defuddle/node"
import { isValidHttpUrl, type ConvertResult } from "@/lib/convert"

const FETCH_TIMEOUT_MS = 10_000

export async function convertUrlToMarkdown(rawUrl: string): Promise<ConvertResult> {
  const url = rawUrl.trim()
  if (!isValidHttpUrl(url)) {
    return { ok: false, reason: "invalid-url" }
  }

  let html: string
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UrlToMarkdown/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) {
      return { ok: false, reason: "fetch-failed" }
    }
    html = await response.text()
  } catch {
    return { ok: false, reason: "fetch-failed" }
  }

  try {
    const result = await Defuddle(html, url, { markdown: true })
    const markdown = result.content?.trim() ?? ""
    if (!markdown) {
      return { ok: false, reason: "empty-content" }
    }
    return {
      ok: true,
      title: result.title?.trim() ?? "",
      author: result.author?.trim() ?? "",
      markdown,
    }
  } catch {
    return { ok: false, reason: "empty-content" }
  }
}
