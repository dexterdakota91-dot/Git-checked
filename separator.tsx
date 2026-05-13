import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

/**
 * Renders a themed separator element with configurable orientation.
 *
 * @param className - Additional CSS classes to apply to the separator
 * @param orientation - Layout orientation of the separator, either `"horizontal"` or `"vertical"`; defaults to `"horizontal"`
 * @returns A React element representing the separator
 */
function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
