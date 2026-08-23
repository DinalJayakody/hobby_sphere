import * as React from "react"

const cn = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ")

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-soft-lg", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }

