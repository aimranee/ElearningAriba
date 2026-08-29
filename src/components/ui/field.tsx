import { Field as FieldPrimitive } from "@base-ui/react/field"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { inputVariants } from "@/components/ui/input"
import { Message } from "@/components/ui/message"

const fieldVariants = cva("flex flex-col gap-1.5 in-data-[density=compact]:gap-1", {
  variants: {},
  defaultVariants: {},
})

function Field({
  className,
  rejected,
  ...props
}: FieldPrimitive.Root.Props & { rejected?: "server" }) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      {...(rejected === "server" ? { "data-rejected": "server" } : {})}
      className={cn(
        fieldVariants({ className }),
        /* why: a rejection only the server can know about — an email already
           taken, a slot taken while the learner hesitated — must look
           different in the journey from a format error the browser catches;
           this is a named state, not a Lot 2 improvisation */
        "in-data-[rejected=server]:[&_[data-slot=field-label]]:text-destructive in-data-[rejected=server]:[&_[data-slot=field-control]]:border-destructive in-data-[rejected=server]:[&_[data-slot=field-control]]:ring-3 in-data-[rejected=server]:[&_[data-slot=field-control]]:ring-destructive/20"
      )}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium in-data-[density=compact]:text-[0.8rem] data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldControl({
  className,
  size = "default",
  ...props
}: FieldPrimitive.Control.Props & VariantProps<typeof inputVariants>) {
  return (
    <FieldPrimitive.Control
      data-slot="field-control"
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm in-data-[density=compact]:text-xs",
        className
      )}
      {...props}
    />
  )
}

/* why: the field family renders states it is told about (D-41) — no
   validation logic lives here, so FieldError wraps the shared Message part
   directly instead of Base UI's Field.Error, whose text derives from native
   validity this Lot never wires */
function FieldError({ className, ...props }: React.ComponentProps<typeof Message>) {
  return (
    <Message
      data-slot="field-error"
      variant="error"
      className={cn("in-data-[density=compact]:text-xs", className)}
      {...props}
    />
  )
}

export { Field, FieldLabel, FieldControl, FieldDescription, FieldError, fieldVariants }
