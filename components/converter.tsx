"use client"

import { useState, useTransition } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { convertUrlToMarkdown } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  CONVERT_ERROR_MESSAGES,
  isValidHttpUrl,
  slugifyTitle,
  type ConvertResult,
} from "@/lib/convert"
import { PROMPT_PRESETS } from "@/lib/prompts"

type Stage = "input" | "loading" | "result" | "error"

const NO_PROMPT = "none"
const CUSTOM_PROMPT = "custom"

export function Converter() {
  const [url, setUrl] = useState("")
  const [stage, setStage] = useState<Stage>("input")
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [promptChoice, setPromptChoice] = useState<string>(NO_PROMPT)
  const [customPrompt, setCustomPrompt] = useState("")
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setUrl("")
    setStage("input")
    setResult(null)
    setInputError(null)
    setPromptChoice(NO_PROMPT)
    setCustomPrompt("")
    setExportStatus(null)
  }

  function handleConvert() {
    const trimmed = url.trim()
    if (!isValidHttpUrl(trimmed)) {
      setInputError("올바른 URL을 입력해주세요. (예: https://example.com/article)")
      return
    }
    setInputError(null)
    setExportStatus(null)
    setStage("loading")
    startTransition(async () => {
      const res = await convertUrlToMarkdown(trimmed)
      setResult(res)
      setStage(res.ok ? "result" : "error")
    })
  }

  const activePrompt =
    promptChoice === NO_PROMPT
      ? ""
      : promptChoice === CUSTOM_PROMPT
        ? customPrompt.trim()
        : (PROMPT_PRESETS.find((preset) => preset.id === promptChoice)?.text ?? "")

  function buildExportText(markdown: string) {
    return activePrompt ? `${activePrompt}\n\n${markdown}` : markdown
  }

  function handleCopy() {
    if (!result?.ok) return
    navigator.clipboard
      .writeText(result.markdown)
      .then(() => setExportStatus("클립보드에 복사했습니다."))
      .catch(() => setExportStatus("클립보드 복사에 실패했습니다. 직접 복사해주세요."))
  }

  function handleDownload() {
    if (!result?.ok) return
    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = `${slugifyTitle(result.title)}.md`
    link.click()
    URL.revokeObjectURL(href)
  }

  function handleOpenLlm(service: "chatgpt" | "claude") {
    if (!result?.ok) return
    // Both calls must stay synchronous in the click handler: start the
    // clipboard write while the document still has focus, then open the tab
    // before awaiting anything — an await in between drops the browser's
    // user-activation (blocks the popup) or the new tab steals focus first
    // (clipboard write is denied).
    const clipboardWrite = navigator.clipboard.writeText(buildExportText(result.markdown))
    const target = service === "chatgpt" ? "https://chatgpt.com/" : "https://claude.ai/new"
    window.open(target, "_blank", "noopener,noreferrer")
    clipboardWrite
      .then(() => setExportStatus("클립보드에 복사했습니다. 새 탭에 붙여넣기(⌘V / Ctrl+V) 해주세요."))
      .catch(() => setExportStatus("클립보드 복사에 실패했습니다. 직접 복사해주세요."))
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleConvert()
          }}
          placeholder="https://example.com/article"
          aria-invalid={!!inputError}
          disabled={isPending}
        />
        <div className="flex gap-2">
          <Button onClick={handleConvert} disabled={isPending}>
            {isPending ? "변환 중..." : "변환하기"}
          </Button>
          <Button variant="outline" onClick={reset} disabled={isPending}>
            지우기
          </Button>
        </div>
      </div>
      {inputError && <p className="text-sm text-destructive">{inputError}</p>}

      {stage === "loading" && (
        <p className="text-sm text-muted-foreground">본문을 추출하는 중입니다...</p>
      )}

      {stage === "error" && result && !result.ok && (
        <p className="text-sm text-destructive">{CONVERT_ERROR_MESSAGES[result.reason]}</p>
      )}

      {stage === "result" && result?.ok && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">{result.title || "제목 없음"}</h2>
            {result.author && (
              <p className="text-sm text-muted-foreground">{result.author}</p>
            )}
          </div>

          <article className="prose prose-sm dark:prose-invert max-h-[480px] max-w-none overflow-y-auto rounded-md border border-border p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.markdown}</ReactMarkdown>
          </article>

          <div className="flex flex-col gap-3 rounded-md border border-border p-4">
            <Label>프롬프트 (선택)</Label>
            <RadioGroup value={promptChoice} onValueChange={setPromptChoice}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value={NO_PROMPT} id="prompt-none" />
                <Label htmlFor="prompt-none">사용 안 함</Label>
              </div>
              {PROMPT_PRESETS.map((preset) => (
                <div key={preset.id} className="flex items-center gap-2">
                  <RadioGroupItem value={preset.id} id={`prompt-${preset.id}`} />
                  <Label htmlFor={`prompt-${preset.id}`}>{preset.label}</Label>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <RadioGroupItem value={CUSTOM_PROMPT} id="prompt-custom" />
                <Label htmlFor="prompt-custom">직접 입력</Label>
              </div>
            </RadioGroup>
            {promptChoice === CUSTOM_PROMPT && (
              <Textarea
                value={customPrompt}
                onChange={(event) => setCustomPrompt(event.target.value)}
                placeholder="이번 한 번만 사용할 프롬프트를 입력하세요"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCopy}>
              복사하기
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              .md 다운로드
            </Button>
            <Button onClick={() => handleOpenLlm("chatgpt")}>ChatGPT로 열기</Button>
            <Button onClick={() => handleOpenLlm("claude")}>Claude로 열기</Button>
          </div>
          {exportStatus && (
            <p className="text-sm text-muted-foreground">{exportStatus}</p>
          )}
        </section>
      )}
    </div>
  )
}
