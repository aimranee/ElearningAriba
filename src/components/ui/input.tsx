import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "border-input bg-background flex h-8 w-full min-w-0 rounded-lg border px-3 py-1.5 text-sm shadow-[var(--shadow-1)] transition-all outline-none in-data-[density=compact]:h-7 in-data-[density=compact]:px-2.5 in-data-[density=compact]:text-[0.8rem] hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20" +
    /* why: no boolean `loading` prop — a `data-loading` attribute matches
       button.tsx's existing data-* idiom rather than a boolean prop that
       could leak into the DOM */
    " data-[loading=true]:pointer-events-none data-[loading=true]:opacity-70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        default: "",
        sm: "h-7 text-[0.8rem] in-data-[density=compact]:h-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Input({
  className,
  size = "default",
  ...props
}: /* why: `<input>` has a native numeric `size` attribute — omit it before
     intersecting with the string-valued `size` variant, or the prop type
     collapses to `never` */
Omit<InputPrimitive.Props, "size"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
