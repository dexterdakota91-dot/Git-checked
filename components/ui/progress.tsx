import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

/**
 * Renders a progress root with default layout classes and an internal track and indicator.
 *
 * The component forwards `value` and other props to `ProgressPrimitive.Root`, merges `className`
 * with the default layout classes, places `children` before the progress bar, and always renders
 * a `ProgressTrack` containing a `ProgressIndicator`.
 *
 * @param className - Additional CSS class names to merge with the default layout
 * @param children - Optional content rendered before the track (for example, a label)
 * @param value - Progress percentage from 0 to 100 indicating completion
 * @returns The rendered `ProgressPrimitive.Root` element
 */
function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

/**
 * Renders the progress track element with default styling for use inside a Progress container.
 *
 * @returns The `ProgressPrimitive.Track` element styled as the track (background) of a progress bar.
 */
function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

/**
 * Renders the progress indicator with default styles and merges any additional classes.
 *
 * @param className - Additional CSS classes to apply to the indicator element
 * @returns The progress indicator element with merged classes and forwarded props
 */
function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all", className)}
      {...props}
    />
  )
}

/**
 * Renders a progress label with default small, medium-weight typography and forwarded props.
 *
 * @returns The progress label element.
 */
function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

/**
 * Renders a progress value element aligned to the end with default typography and spacing.
 *
 * @returns The rendered progress value element.
 */
function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
