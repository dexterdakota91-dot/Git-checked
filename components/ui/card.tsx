import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { size?: "default" | "sm" }>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        data-size={size}
        className={cn(
          "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

/**
 * Renders the card header container with the correct `data-slot` and layout/spacing classes.
 *
 * @param className - Additional CSS classes to merge with the component's default classes
 * @returns A `<div>` element that serves as the card header
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card title container with preset typography and accepts additional `className` and other div props.
 *
 * @returns A `div` element with `data-slot="card-title"` whose class list combines the component's typography styles and any supplied `className`
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a Card description container with small, muted text styling.
 *
 * @param className - Additional CSS class names to merge with the component's default styling
 * @returns A `<div>` element with `data-slot="card-description"` and small muted-foreground typography
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Card action area positioned in the card's top-right corner.
 *
 * @returns A `div` element with `data-slot="card-action"` positioned in the top-right of the card; merges the provided `className` with layout classes and forwards other `div` props.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card content container used to hold the main content of a card.
 *
 * @returns The content `div` element with `data-slot="card-content"`.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

/**
 * Renders a card footer container with footer-specific styling and data attributes.
 *
 * @param className - Additional CSS classes to merge with the default footer styles
 * @returns A `<div>` element configured as the card footer (`data-slot="card-footer"`) with default layout, border, and padding classes
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
