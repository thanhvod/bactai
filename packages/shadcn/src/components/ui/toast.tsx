import * as React from "react"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  type ToastProps,
} from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProviderPrimitive = ToastProvider
const ToastViewportPrimitive = ToastViewport
const ToastPrimitive = Toast

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center gap-1 overflow-hidden rounded-xl p-1 pr-10 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "bg-background text-foreground",
        success:
          "bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ToastViewportComponent = React.forwardRef<
  React.ElementRef<typeof ToastViewportPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastViewportPrimitive>
>(({ className, ...props }, ref) => (
  <ToastViewportPrimitive
    ref={ref}
    className={cn(
      "fixed top-1 left-1/2 z-[100] flex max-h-screen w-full w-auto min-w-[250px] max-w-[500px] -translate-x-1/2 flex-col p-1.5 sm:top-1 sm:left-1/2 sm:-translate-x-1/2 sm:flex-col",
      className
    )}
    {...props}
  />
))
ToastViewportComponent.displayName = ToastViewportPrimitive.displayName

const ToastComponent = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitive
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
ToastComponent.displayName = ToastPrimitive.displayName

const ToastActionComponent = React.forwardRef<
  React.ElementRef<typeof ToastAction>,
  React.ComponentPropsWithoutRef<typeof ToastAction>
>(({ className, ...props }, ref) => (
  <ToastAction
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastActionComponent.displayName = ToastAction.displayName

const ToastCloseComponent = React.forwardRef<
  React.ElementRef<typeof ToastClose>,
  React.ComponentPropsWithoutRef<typeof ToastClose>
>(({ className, ...props }, ref) => (
  <ToastClose
    ref={ref}
    className={cn(
      "absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md p-0 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastClose>
))
ToastCloseComponent.displayName = ToastClose.displayName

const ToastTitleComponent = React.forwardRef<
  React.ElementRef<typeof ToastTitle>,
  React.ComponentPropsWithoutRef<typeof ToastTitle>
>(({ className, ...props }, ref) => (
  <ToastTitle
    ref={ref}
    className={cn("text-xs font-semibold leading-snug", className)}
    {...props}
  />
))
ToastTitleComponent.displayName = ToastTitle.displayName

const ToastDescriptionComponent = React.forwardRef<
  React.ElementRef<typeof ToastDescription>,
  React.ComponentPropsWithoutRef<typeof ToastDescription>
>(({ className, ...props }, ref) => (
  <ToastDescription
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescriptionComponent.displayName = ToastDescription.displayName

type ToastPropsType = React.ComponentPropsWithoutRef<typeof ToastComponent>

type ToastActionElementProps = React.ReactElement<typeof ToastActionComponent>

export {
  type ToastPropsType as ToastProps,
  type ToastActionElementProps as ToastActionElement,
  ToastProviderPrimitive as ToastProvider,
  ToastViewportComponent as ToastViewport,
  ToastComponent as Toast,
  ToastTitleComponent as ToastTitle,
  ToastDescriptionComponent as ToastDescription,
  ToastCloseComponent as ToastClose,
  ToastActionComponent as ToastAction,
}
