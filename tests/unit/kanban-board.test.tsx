// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { KanbanBoard } from "@/components/applications/KanbanBoard"
import type { Application } from "@/types"

const mockApps: Application[] = [
  { id: "1", user_id: "u1", company: "Google", role_title: "Software Engineer", status: "Saved", job_url: null, job_description: null, salary_range: null, location: null, remote_type: null, application_source: null, match_score: null, cv_version_id: null, notes: null, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "2", user_id: "u1", company: "Meta", role_title: "Frontend Engineer", status: "Saved", job_url: null, job_description: null, salary_range: null, location: null, remote_type: null, application_source: null, match_score: null, cv_version_id: null, notes: null, created_at: "2024-01-02", updated_at: "2024-01-02" },
  { id: "3", user_id: "u1", company: "Apple", role_title: "iOS Developer", status: "Interview", job_url: null, job_description: null, salary_range: null, location: null, remote_type: null, application_source: null, match_score: 85, cv_version_id: null, notes: null, created_at: "2024-01-03", updated_at: "2024-01-03" },
  { id: "4", user_id: "u1", company: "Amazon", role_title: "Backend Engineer", status: "Offer", job_url: "https://amazon.com/jobs/4", job_description: null, salary_range: "$150k-$200k", location: "Seattle", remote_type: "hybrid", application_source: "LinkedIn", match_score: 92, cv_version_id: null, notes: null, created_at: "2024-01-04", updated_at: "2024-01-04" },
  { id: "5", user_id: "u1", company: "Netflix", role_title: "Senior Engineer", status: "Rejected", job_url: null, job_description: null, salary_range: null, location: null, remote_type: null, application_source: null, match_score: 60, cv_version_id: null, notes: null, created_at: "2024-01-05", updated_at: "2024-01-05" },
  { id: "6", user_id: "u1", company: "Stripe", role_title: "Full Stack", status: "Applied", job_url: null, job_description: null, salary_range: null, location: null, remote_type: null, application_source: "Direct", match_score: null, cv_version_id: null, notes: null, created_at: "2024-01-06", updated_at: "2024-01-06" },
]

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe("KanbanBoard", () => {
  const onStatusChange = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders all 5 status columns", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    expect(screen.getByText("Saved")).toBeInTheDocument()
    expect(screen.getByText("Applied")).toBeInTheDocument()
    expect(screen.getByText("Interview")).toBeInTheDocument()
    expect(screen.getByText("Offer")).toBeInTheDocument()
    expect(screen.getByText("Rejected")).toBeInTheDocument()
  })

  it("shows correct application count per column", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("renders company names on cards", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    expect(screen.getByText("Google")).toBeInTheDocument()
    expect(screen.getByText("Meta")).toBeInTheDocument()
    expect(screen.getByText("Apple")).toBeInTheDocument()
    expect(screen.getByText("Amazon")).toBeInTheDocument()
  })

  it("renders role titles on cards", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    expect(screen.getByText("Software Engineer")).toBeInTheDocument()
    expect(screen.getByText("iOS Developer")).toBeInTheDocument()
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument()
  })

  it("shows match score when present", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    expect(screen.getByText("85")).toBeInTheDocument()
    expect(screen.getByText("92")).toBeInTheDocument()
  })

  it("shows application source when present", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    expect(screen.getByText("Direct")).toBeInTheDocument()
    expect(screen.getByText("LinkedIn")).toBeInTheDocument()
  })

  it("renders delete buttons with aria labels", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    expect(screen.getByLabelText("Delete Software Engineer application")).toBeInTheDocument()
    expect(screen.getByLabelText("Delete iOS Developer application")).toBeInTheDocument()
  })

  it("calls onDelete when delete button clicked", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText("Delete Software Engineer application"))
    expect(onDelete).toHaveBeenCalledWith("1")
  })

  it("renders drop zone in empty column", () => {
    const appsWithOffers: Application[] = mockApps.filter((a) => a.status === "Offer")
    render(<KanbanBoard applications={appsWithOffers} onStatusChange={onStatusChange} onDelete={onDelete} />)
    const dropZones = screen.getAllByText("Drop here")
    expect(dropZones.length).toBeGreaterThanOrEqual(4)
  })

  it("renders external link for apps with job_url", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    const externalLinks = screen.getAllByRole("link")
    const amazonLink = externalLinks.find((l) => l.getAttribute("href") === "https://amazon.com/jobs/4")
    expect(amazonLink).toBeInTheDocument()
  })

  it("renders workspace link for each card", () => {
    render(<KanbanBoard applications={mockApps} onStatusChange={onStatusChange} onDelete={onDelete} />)
    const links = screen.getAllByRole("link")
    const appLinks = links.filter((l) => l.getAttribute("href")?.startsWith("/applications/"))
    expect(appLinks.length).toBeGreaterThanOrEqual(6)
  })
})
