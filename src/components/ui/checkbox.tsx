"use client"
/* why: Checkbox.Root is stateful (checked/indeterminate), so this primitive
   needs client state, unlike input/field/button/badge/card/message */

import { Check } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer size-4 shrink-0 rounded-[0.25rem] border border-input bg-background shadow-[var(--shadow-1)] transition-all outline-none in-data-[density=compact]:size-3.5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20" +
    /* why: no boolean `loading` prop — a `data-loading` attribute matches
       button.tsx's existing data-* idiom rather than a boolean prop that
       could leak into the DOM */
    " data-[loading=true]:pointer-events-none data-[loading=true]:opacity-70 data-[checked]:border-primary data-[checked]:bg-primary",
  {
    variants: {},
    defaultVariants: {},
  }
)

function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.Root.Props & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-primary-foreground data-[unmounted]:hidden"
      >
        <Check aria-hidden="true" className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants }
