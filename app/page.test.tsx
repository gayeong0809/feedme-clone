import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 서비스 제목과 URL 입력창을 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /URL → Markdown/i })
  ).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText("https://example.com/article")
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환하기" })).toBeInTheDocument();
});
