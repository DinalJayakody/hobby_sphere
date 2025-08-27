import * as React from "react"
// import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl border bg-white p-4 shadow-md", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
function cn(arg0: string, className: string | undefined): string | undefined {
    throw new Error("Function not implemented.")
}

