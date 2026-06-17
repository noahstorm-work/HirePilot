"use client"

import { useState, useMemo } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { APPLICATION_STATUSES, STATUS_COLORS } from "@/lib/constants"
import { Send, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Application } from "@/types"
import type { ApplicationStatus } from "@/types"

interface KanbanBoardProps {
  applications: Application[]
  onStatusChange: (appId: string, newStatus: string) => void
  onDelete?: (appId: string) => void
}

interface KanbanColumnProps {
  id: string
  title: ApplicationStatus
  count: number
  items: Application[]
  onDelete?: (appId: string) => void
}

function SortableCard({ app, onDelete }: { app: Application; onDelete?: (appId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, data: { type: "card", app } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default cursor-grab active:cursor-grabbing group
        ${isDragging ? "opacity-50 scale-105 ring-2 ring-[var(--color-accent-violet)]" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium font-[family-name:var(--font-display)] truncate">{app.company}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">{app.role_title}</p>
        </div>
        {app.match_score != null && (
          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-violet)] shrink-0">{app.match_score}</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
        <span className="text-[9px] text-[var(--color-text-muted)]">{new Date(app.created_at).toLocaleDateString()}</span>
        <div className="flex items-center gap-1.5">
          {app.application_source && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
              {app.application_source}
            </span>
          )}
          {app.job_url && (
            <a
              href={app.job_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
          <Link
            href={`/applications/${app.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent-violet)] transition-colors sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Send className="h-2.5 w-2.5" />
          </Link>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(app.id) }}
              aria-label={`Delete ${app.role_title} application`}
              className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)] transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ title, count, items, onDelete }: KanbanColumnProps) {
  const colorConfig = STATUS_COLORS[title]

  return (
    <div className="flex flex-col min-w-[240px] max-w-[280px] w-full">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <span className={`h-1.5 w-1.5 rounded-full ${colorConfig.dot}`} />
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{title}</span>
        <span className="text-[10px] text-[var(--color-text-muted)]">{count}</span>
      </div>
      <div className="flex-1 p-2 rounded-xl bg-[var(--color-bg-elevated)]/50 border border-[var(--color-border-subtle)] min-h-[200px]">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((app) => (
              <SortableCard key={app.id} app={app} onDelete={onDelete} />
            ))}
          </div>
        </SortableContext>
        {items.length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-[var(--color-border-subtle)] text-center mt-2">
            <p className="text-[10px] text-[var(--color-text-muted)]">Drop here</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DragOverlayCard({ app }: { app: Application }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-accent-violet)] shadow-lg opacity-90 cursor-grabbing ring-2 ring-[var(--color-accent-violet)]/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium font-[family-name:var(--font-display)] truncate">{app.company}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">{app.role_title}</p>
        </div>
        {app.match_score != null && (
          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-violet)] shrink-0">{app.match_score}</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
        <span className="text-[9px] text-[var(--color-text-muted)]">{new Date(app.created_at).toLocaleDateString()}</span>
        {app.application_source && (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
            {app.application_source}
          </span>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ applications, onStatusChange, onDelete }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const activeApp = useMemo(() => {
    if (!activeId) return null
    return applications.find((a) => a.id === activeId) || null
  }, [activeId, applications])

  const columnApps = useMemo(() => {
    const grouped: Record<string, Application[]> = {}
    APPLICATION_STATUSES.forEach((status) => {
      grouped[status] = applications.filter((a) => a.status === status)
    })
    return grouped
  }, [applications])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeApp = applications.find((a) => a.id === active.id)
    if (!activeApp) return

    const overId = over.id as string

    let newStatus: string | null = null

    if (APPLICATION_STATUSES.includes(overId as ApplicationStatus)) {
      newStatus = overId
    } else {
      const overApp = applications.find((a) => a.id === overId)
      if (overApp) {
        newStatus = overApp.status
      }
    }

    if (newStatus && newStatus !== activeApp.status) {
      onStatusChange(activeApp.id, newStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={status}
            count={columnApps[status]?.length || 0}
            items={columnApps[status] || []}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeApp ? <DragOverlayCard app={activeApp} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
