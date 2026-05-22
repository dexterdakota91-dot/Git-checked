/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { X } from "lucide-react"

/**
 * Wraps `DialogPrimitive.Root`, attaching `data-slot="dialog"` and forwarding all received props.
 *
 * @param props - Props to pass through to `DialogPrimitive.Root`
 * @returns The rendered dialog root element
 */
function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * Creates a dialog trigger element that forwards all props to the underlying primitive and sets `data-slot="dialog-trigger"`.
 *
 * @param render - Optional React element to render inside the trigger
 * @returns The rendered DialogPrimitive.Trigger element
 */
function DialogTrigger({ render, ...props }: DialogPrimitive.Trigger.Props & { render?: React.ReactElement }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" render={render} {...props} />
}

/**
 * Renders a dialog portal element that attaches `data-slot="dialog-portal"` and forwards all props.
 *
 * @returns The portal element used to render dialog content into a React portal
 */
function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * Renders a button-styled dialog close control used to close the dialog.
 *
 * @returns The rendered dialog close element with `data-slot="dialog-close"`, `type="button"`, and any provided props applied.
 */
function DialogClose({ className, ...props }: DialogPrimitive.Close.Props & React.ComponentProps<"button">) {
  return <DialogPrimitive.Close data-slot="dialog-close" type="button" className={className} {...props} />
}

/**
 * Render the dialog backdrop with default dark, blurred overlay styling.
 *
 * @param className - Additional CSS classes to merge with the default overlay styles.
 * @param props - Additional backdrop props forwarded to the underlying primitive.
 * @returns The rendered backdrop element for the dialog overlay.
 */
function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-[100] bg-black/60 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Render the dialog's portal-backed popup surface including an overlay, built-in close button, and scrollable content area.
 *
 * @param className - Additional classes merged into the popup container's class list
 * @param children - Content rendered inside the dialog's scrollable region
 * @param props - Remaining props forwarded to the underlying popup primitive
 * @returns The dialog content element
 */
function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-[101] flex flex-col w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar max-h-[85vh] relative">
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground cursor-pointer z-[102] hover:bg-white/10">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          {children}
        </div>
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

/**
 * Layout wrapper for dialog header content.
 *
 * Applies default flex-column spacing and merges any provided `className`; forwards remaining div props to the container.
 *
 * @param className - Additional class names to merge with the default header classes
 * @returns The header container `div` element
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/**
 * Renders the dialog footer with layout for actions and an optional "Back" close button.
 *
 * @param showBackButton - If `true`, includes a left-aligned "Back" button that closes the dialog. Defaults to `false`.
 * @param className - Additional classes applied to the footer container.
 * @param children - Action elements (e.g., buttons) to display in the footer; order reverses on small screens.
 * @returns The rendered dialog footer element.
 */
function DialogFooter({ 
  className, 
  children, 
  showBackButton = false,
  ...props 
}: React.ComponentProps<"div"> & { showBackButton?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row justify-between",
        className
      )}
      {...props}
    >
      {showBackButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          type="button"
          className={cn(buttonVariants({ variant: 'ghost' }), "relative z-[105] cursor-pointer")}
        >
          Back
        </DialogPrimitive.Close>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        {children}
      </div>
    </div>
  )
}

/**
 * Render a dialog title element with the library's heading typography styles applied.
 *
 * @returns A React element representing the dialog title with heading typography classes merged with any provided `className`.
 */
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the dialog description element with muted text and link underline styling.
 *
 * @param className - Additional class names to merge with the component's default styles
 * @returns The dialog description element styled with muted foreground color and underline behavior for links
 */
function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
