import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-lg border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap shadow-[var(--shadow-1)] transition-all outline-none in-data-[density=compact]:px-1.5 in-data-[density=compact]:py-px in-data-[density=compact]:text-[0.7rem] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[loading=true]:pointer-events-none data-[loading=true]:opacity-70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5" +
    /* why: a badge is often a static label, so hover/active only fire when the
       call site marks it interactive (e.g. a filter chip) — a decorative
       status badge must not look clickable */
    " data-[interactive=true]:hover:bg-primary/80 data-[interactive=true]:active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        success: "bg-success-muted text-success",
        outline: "border-border bg-background text-foreground",
        muted: "bg-muted text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive",
      },
      size: {
        default: "text-xs",
        sm: "px-1.5 py-px text-[0.7rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
