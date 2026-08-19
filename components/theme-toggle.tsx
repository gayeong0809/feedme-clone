"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark")
}

function getServerSnapshot() {
  return false
}

function setDark(next: boolean) {
  document.documentElement.classList.toggle("dark", next)
  localStorage.setItem("theme", next ? "dark" : "light")
  listeners.forEach((listener) => listener())
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDark(!isDark)}
      aria-label="다크모드 전환"
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
