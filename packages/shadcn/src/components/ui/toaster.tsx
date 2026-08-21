"use client"

import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const TOAST_DURATION_MS = 3000

/**
 * When a right-side Sheet (FormDrawer) is open, shift the toast viewport left so
 * toasts sit in the dimmed main area next to the drawer seam — same vertical band
 * as the default (top), without covering the form.
 */
function useToastViewportWhenSheetOpen(): {
  rightPx: number
  widthPx: number
} | null {
  const [layout, setLayout] = React.useState<{
    rightPx: number
    widthPx: number
  } | null>(null)

  React.useLayoutEffect(() => {
    let gen = 0
    const measure = () => {
      const el = document.querySelector(
        '[data-slot="sheet-content"][data-state="open"]',
      ) as HTMLElement | null
      if (!el) {
        setLayout(null)
        return
      }
      const inset = el.getBoundingClientRect().left
      const horizontalMargin = 16
      const seamGap = 12
      const strip = inset - horizontalMargin * 2
      // Full-bleed / very narrow strip: keep default top-right placement.
      if (inset <= horizontalMargin || strip < 120) {
        setLayout(null)
        return
      }
      const widthPx = Math.min(350, strip)
      const rightPx = window.innerWidth - inset + seamGap
      setLayout({ rightPx, widthPx })
    }
    /** Sheet slide uses transform; re-measure over a few frames so the toast tracks the seam. */
    const schedule = () => {
      const g = ++gen
      const chain = (depth: number) => {
        if (g !== gen) return
        measure()
        if (depth > 0) requestAnimationFrame(() => chain(depth - 1))
      }
      requestAnimationFrame(() => chain(12))
    }

    schedule()
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state"],
    })
    const ro = new ResizeObserver(schedule)
    ro.observe(document.documentElement)
    window.addEventListener("resize", schedule)
    return () => {
      gen += 1
      mo.disconnect()
      ro.disconnect()
      window.removeEventListener("resize", schedule)
    }
  }, [])

  return layout
}

/** Wraps a single Toast and force-dismisses it after TOAST_DURATION_MS.
 *  The timer runs independently of mouse hover — Radix's built-in pause is
 *  bypassed by setting duration={Infinity} on the provider. */
function TimedToast({
  id,
  title,
  description,
  action,
  variant,
  onDismiss,
  ...props
}: {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  variant?: "default" | "destructive" | "success"
  onDismiss: (id: string) => void
  [key: string]: unknown
}) {
  const duration = props.duration as number | undefined

  React.useEffect(() => {
    if (duration === Infinity) return
    const timer = setTimeout(() => onDismiss(id), duration ?? TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [id, onDismiss, duration])

  const Icon =
    variant === "destructive"
      ? XCircle
      : variant === "success"
        ? CheckCircle2
        : Info

  return (
    <Toast  variant={variant} {...props}>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <div className="shrink-0 self-center">
          <div
            className={cn("flex h-7 w-7 items-center justify-center rounded-lg")}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                variant === "success"
                  ? "text-primary"
                  : variant === "destructive"
                    ? "text-destructive"
                    : "text-primary",
              )}
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 self-center text-left">
          {title && (
            <ToastTitle className="font-semibold">
              {title}
            </ToastTitle>
          )}
          {/* {description && (
            <ToastDescription className="leading-snug text-foreground/75">
              {description}
            </ToastDescription>
          )} */}
        </div>
      </div>
      {action}
      <ToastClose />
    </Toast>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const sheetToastLayout = useToastViewportWhenSheetOpen()

  const handleDismiss = React.useCallback(
    (id: string) => dismiss(id),
    [dismiss],
  )

  return (
    // duration={Infinity} disables Radix's internal timer; our TimedToast
    // handles dismissal so hover can never pause it.
    <ToastProvider duration={Infinity}>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <TimedToast
          key={id}
          id={id}
          title={title}
          description={description}
          action={action}
          variant={variant ?? undefined}
          onDismiss={handleDismiss}
          {...props}
        />
      ))}
      <ToastViewport
        className={cn(
          sheetToastLayout &&
            "transition-[right,width,max-width] duration-200 ease-out",
        )}
        style={
          sheetToastLayout
            ? {
                right: `${sheetToastLayout.rightPx}px`,
                width: `${sheetToastLayout.widthPx}px`,
                maxWidth: `${sheetToastLayout.widthPx}px`,
              }
            : undefined
        }
      />
    </ToastProvider>
  )
}
