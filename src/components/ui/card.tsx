import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col gap-4 rounded-xl border py-4 transition-all outline-none in-data-[density=compact]:gap-2 in-data-[density=compact]:py-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[loading=true]:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20" +
    /* why: a static card must never look clickable — hover/active lift only
       apply once the call site marks the card as an interactive control */
    " data-[interactive=true]:hover:shadow-[var(--shadow-2)] data-[interactive=true]:active:translate-y-px",
  {
    variants: {
      variant: {
        default: "border-border bg-background shadow-[var(--shadow-1)]",
        raised: "border-transparent bg-background shadow-[var(--shadow-3)]",
        outline: "border-border bg-background shadow-none",
        success: "border-transparent bg-success-muted shadow-[var(--shadow-1)]",
        muted: "border-transparent bg-muted shadow-none",
      },
      size: {
        default: "px-4",
        sm: "gap-2 px-3 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Card({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-4 in-data-[density=compact]:px-3", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-[var(--text-section)] leading-[var(--text-section--line-height)] font-heading font-semibold in-data-[density=compact]:text-[var(--text-lead)]",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 in-data-[density=compact]:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2 px-4 in-data-[density=compact]:px-3", className)}
      {...props}
    />
  )
}

function CardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-skeleton"
      className={cn(
        "hidden animate-pulse flex-col gap-2 in-data-[loading=true]:flex",
        className
      )}
      {...props}
    >
      <div className="bg-muted h-4 w-3/4 rounded-[var(--radius-sm)]" />
      <div className="bg-muted h-4 w-full rounded-[var(--radius-sm)]" />
      <div className="bg-muted h-4 w-1/2 rounded-[var(--radius-sm)]" />
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSkeleton,
  cardVariants,
}
