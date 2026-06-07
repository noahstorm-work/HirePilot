"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  Bold, Italic, List, ListOrdered, Heading2, Undo, Redo
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  defaultHeight?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Paste your CV or resume text here...",
  className = "",
  defaultHeight = 300,
}: RichTextEditorProps) {
  const [height, setHeight] = useState(defaultHeight)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-invert max-w-none focus:outline-none px-4 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed",
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "")
    }
  }, [value, editor])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    startY.current = e.clientY
    startHeight.current = height
  }, [height])

  useEffect(() => {
    if (!dragging) return
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startY.current
      const newHeight = Math.min(Math.max(startHeight.current + delta, 150), window.innerHeight * 0.8)
      setHeight(newHeight)
    }
    const handleMouseUp = () => setDragging(false)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging])

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    isActive = false,
    "aria-label": ariaLabel,
    children,
  }: {
    onClick: () => void
    isActive?: boolean
    "aria-label"?: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`p-1.5 rounded-lg transition-colors ${
        isActive
          ? "bg-violet-500/20 text-violet-400"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className={`rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          aria-label="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          aria-label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          aria-label="Heading"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          aria-label="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor with scroll */}
      <div
        style={{ height: `${height}px` }}
        className="overflow-y-auto min-h-[150px]"
      >
        <EditorContent editor={editor} />
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`flex items-center justify-center h-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] cursor-ns-resize select-none hover:bg-[var(--color-bg-elevated)] transition-colors ${dragging ? "bg-[var(--color-bg-elevated)]" : ""}`}
      >
        <div className="flex gap-0.5">
          <div className="w-4 h-0.5 rounded-full bg-[var(--color-text-muted)]/40" />
        </div>
      </div>
    </div>
  )
}
