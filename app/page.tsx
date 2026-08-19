import { Converter } from "@/components/converter"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-background px-4 py-10 sm:px-6">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">URL → Markdown</h1>
            <p className="text-sm text-muted-foreground">
              웹 페이지를 Markdown으로 바꿔 LLM에 바로 넘기세요.
            </p>
          </div>
          <ThemeToggle />
        </header>
        <Converter />
      </main>
    </div>
  )
}
