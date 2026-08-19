export type ConvertSuccess = {
  ok: true
  title: string
  author: string
  markdown: string
}

export type ConvertFailureReason = "invalid-url" | "fetch-failed" | "empty-content"

export type ConvertFailure = {
  ok: false
  reason: ConvertFailureReason
}

export type ConvertResult = ConvertSuccess | ConvertFailure

export const CONVERT_ERROR_MESSAGES: Record<ConvertFailureReason, string> = {
  "invalid-url": "올바른 URL 형식이 아닙니다.",
  "fetch-failed":
    "페이지를 가져오지 못했습니다. 사이트가 요청을 차단했거나 응답 시간이 초과되었을 수 있습니다.",
  "empty-content":
    "본문을 추출하지 못했습니다. 로그인이 필요하거나 자바스크립트로 렌더링되는 페이지일 수 있습니다.",
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function slugifyTitle(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "untitled"
}
