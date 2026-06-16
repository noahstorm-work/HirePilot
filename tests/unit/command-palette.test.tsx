// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { CommandPalette } from "@/components/CommandPalette"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockData: Record<string, unknown> = {
  applications: [
    { id: "app-1", company: "Google", role_title: "Software Engineer", status: "Applied" },
    { id: "app-2", company: "Meta", role_title: "Frontend Engineer", status: "Interview" },
  ],
  saved_jobs: [
    { id: "job-1", company: "Apple", role_title: "iOS Developer" },
  ],
  user_profiles: { skills: ["React", "TypeScript", "Python", "AWS"] },
}

function makeQueryBuilder(table: string) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn((_n: number) => Promise.resolve({ data: mockData[table] })),
    single: vi.fn(() => Promise.resolve({ data: mockData[table] })),
  }
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: "user-1" } },
        error: null,
      })),
    },
    from: vi.fn((table: string) => makeQueryBuilder(table)),
  }),
}))

function openPalette() {
  return act(() => void fireEvent.keyDown(window, { metaKey: true, key: "k" }))
}

describe("CommandPalette", () => {
  beforeEach(() => vi.clearAllMocks())

  it("does not render when closed", () => {
    const { container } = render(<CommandPalette />)
    expect(container.innerHTML).toBe("")
  })

  it("opens on Cmd+K keypress", async () => {
    render(<CommandPalette />)
    await openPalette()
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument()
  })

  it("opens on Ctrl+K keypress", async () => {
    render(<CommandPalette />)
    await act(() => void fireEvent.keyDown(window, { ctrlKey: true, key: "k" }))
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument()
  })

  it("shows the input and nav commands when open", async () => {
    render(<CommandPalette />)
    await openPalette()
    expect(screen.getByPlaceholderText(/search pages/i)).toBeInTheDocument()
    expect(screen.getByText("Pages")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })

  it("filters nav commands by query", async () => {
    render(<CommandPalette />)
    await openPalette()
    const input = screen.getByPlaceholderText(/search/i)
    await act(() => void fireEvent.change(input, { target: { value: "interview" } }))
    expect(screen.getByText("Interview Coach")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
  })

  it("shows application search results", async () => {
    render(<CommandPalette />)
    await openPalette()
    const input = screen.getByPlaceholderText(/search/i)
    await act(() => void fireEvent.change(input, { target: { value: "Google" } }))
    await waitFor(() => {
      expect(screen.getByText(/Software Engineer at Google/)).toBeInTheDocument()
    })
  })

  it("shows saved job search results", async () => {
    render(<CommandPalette />)
    await openPalette()
    const input = screen.getByPlaceholderText(/search/i)
    await act(() => void fireEvent.change(input, { target: { value: "Apple" } }))
    await waitFor(() => {
      expect(screen.getByText(/iOS Developer at Apple/)).toBeInTheDocument()
    })
  })

  it("shows skill search results", async () => {
    render(<CommandPalette />)
    await openPalette()
    const input = screen.getByPlaceholderText(/search/i)
    await act(() => void fireEvent.change(input, { target: { value: "TypeScript" } }))
    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument()
    })
  })

  it("shows no results when query matches nothing", async () => {
    render(<CommandPalette />)
    await openPalette()
    const input = screen.getByPlaceholderText(/search/i)
    await act(() => void fireEvent.change(input, { target: { value: "xyzzy_nonexistent" } }))
    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  })

  it("navigates on enter", async () => {
    render(<CommandPalette />)
    await openPalette()
    const input = screen.getByPlaceholderText(/search/i)
    await act(() => void fireEvent.keyDown(input, { key: "Enter" }))
    expect(mockPush).toHaveBeenCalled()
  })

  it("closes on Escape", async () => {
    render(<CommandPalette />)
    await openPalette()
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument()
    await act(() => void fireEvent.keyDown(window, { key: "Escape" }))
    expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument()
  })

  it("toggles between open and close on repeated Cmd+K", async () => {
    render(<CommandPalette />)
    await openPalette()
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument()
    await act(() => void fireEvent.keyDown(window, { metaKey: true, key: "k" }))
    expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument()
  })

  it("shows Applications section when apps match query", async () => {
    render(<CommandPalette />)
    await openPalette()
    const input = screen.getByPlaceholderText(/search/i)
    await act(() => void fireEvent.change(input, { target: { value: "Meta" } }))
    await waitFor(() => {
      expect(screen.getByText("Applications")).toBeInTheDocument()
    })
  })
})
