import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const messageVariants = cva(
  "flex items-center gap-1.5 text-sm in-data-[density=compact]:text-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        error: "text-destructive",
        success: "text-success",
        info: "text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  }
)

function Message({
  className,
  variant = "error",
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof messageVariants>) {
  if (variant === "error") {
    return (
      <p
        data-slot="message"
        role="alert"
        aria-live="polite"
        className={cn(messageVariants({ variant, className }))}
        {...props}
      />
    )
  }

  return (
    <p
      data-slot="message"
      className={cn(messageVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Message, messageVariants }
