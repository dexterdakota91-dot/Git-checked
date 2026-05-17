"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

/**
 * Top-level Sheet component that renders the sheet root element.
 *
 * @param props - Props forwarded to the underlying `SheetPrimitive.Root`
 * @returns The rendered sheet root element with `data-slot="sheet"`
 */
function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

/**
 * Renders a Sheet trigger that forwards props to the underlying dialog primitive.
 *
 * @param render - Optional custom React element to use as the trigger's render output
 * @returns A trigger element that opens or toggles the Sheet
 */
function SheetTrigger({ render, ...props }: SheetPrimitive.Trigger.Props & { render?: React.ReactElement }) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" render={render} {...props} />
}

/**
 * Renders a sheet close control and forwards all provided props to the underlying close primitive.
 *
 * @param props - Props applied to the close control element.
 * @returns The close control element for use inside a Sheet.
 */
function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

/**
 * Provides a portal container for sheet contents using the underlying dialog primitive.
 *
 * @returns A portal element that mounts sheet content into the document using the dialog primitive.
 */
function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

/**
 * Renders the sheet backdrop with default overlay styling.
 *
 * @param className - Additional CSS classes to merge with the default overlay styles
 * @param props - Additional props forwarded to the underlying Backdrop primitive
 * @returns The backdrop element used as the sheet overlay
 */
function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

/**
 * Render the sheet's content panel inside a portal with an overlay and optional close control.
 *
 * @param side - The edge of the viewport from which the sheet appears: `"top"`, `"right"`, `"bottom"`, or `"left"`.
 * @param showCloseButton - Whether a close button is rendered inside the sheet (defaults to `true`).
 * @returns The sheet content element (wrapped in a portal) configured with side-based positioning, styles, and an optional close control.
 */
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

/**
 * Layout wrapper for sheet header content.
 *
 * Merges default header layout classes with any provided `className` and forwards other `div` props.
 *
 * @param className - Additional class names appended to the default `"flex flex-col gap-0.5 p-4"`
 * @returns A `div` element that wraps header content with header-specific layout classes
 */
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

/**
 * Layout wrapper for sheet footer content.
 *
 * Renders a div that serves as the sheet's footer container with default spacing and layout classes; any provided `className` is merged with the defaults.
 *
 * @returns The footer container element rendered as a `div`.
 */
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

/**
 * Renders the sheet's title element with default heading typography.
 *
 * @param className - Additional CSS classes to merge with the component's default heading styles
 * @returns A `SheetPrimitive.Title` element with heading typography and the provided `className` merged into its class list
 */
function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a sheet description element with small, muted text styling.
 *
 * @returns A `SheetPrimitive.Description` element with the default `"text-sm text-muted-foreground"` classes merged with any provided `className`.
 */
function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
