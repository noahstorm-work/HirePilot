"use client"

interface ButtonSpinnerProps {
  className?: string
}

export function ButtonSpinner({ className = "h-4 w-4" }: ButtonSpinnerProps) {
  return (
    <div className={`${className} animate-spin rounded-full border-2 border-white border-t-transparent`} />
  )
}
