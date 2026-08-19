export const PROMPT_PRESETS = [
  { id: "summarize", label: "요약해줘", text: "요약해줘" },
  { id: "translate-ko", label: "한국어로 번역해줘", text: "한국어로 번역해줘" },
  { id: "simplify", label: "쉽게 설명해줘", text: "쉽게 설명해줘" },
] as const

export type PromptPresetId = (typeof PROMPT_PRESETS)[number]["id"]
