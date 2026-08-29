"use client"
/* why: the first stateful leaf in the repository — every route stays a
   server component, only this interactive collapsible needs client state */

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const accordionVariants = cva(
  "group/accordion-trigger flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all outline-none in-data-[density=compact]:h-7 in-data-[density=compact]:px-3 in-data-[density=compact]:py-1.5 in-data-[density=compact]:text-[0.8rem] hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20" +
    /* why: no boolean `loading` prop — a `data-loading` attribute matches
       button.tsx's existing data-* idiom rather than a boolean prop that
       could leak into the DOM */
    " data-[loading=true]:pointer-events-none data-[loading=true]:opacity-70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg[data-slot=accordion-spinner]]:hidden data-[loading=true]:[&_svg[data-slot=accordion-spinner]]:block" +
    /* why: the chevron rotates on Base UI's own trigger-side open indicator
       (`data-panel-open`) — the single site curve, no second easing value */
    " [&_svg[data-slot=accordion-chevron]]:transition-transform [&_svg[data-slot=accordion-chevron]]:duration-[var(--duration-base)] [&_svg[data-slot=accordion-chevron]]:ease-[var(--ease-brand)] data-[panel-open]:[&_svg[data-slot=accordion-chevron]]:rotate-180",
  {
    variants: {
      size: {
        default: "",
        sm: "px-3 py-2 text-[0.8rem] in-data-[density=compact]:h-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex flex-col gap-2 in-data-[density=compact]:gap-1", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "border-border overflow-hidden rounded-lg border in-data-[density=compact]:rounded-md",
        className
      )}
      {...props}
    />
  )
}

function AccordionHeader({ className, ...props }: AccordionPrimitive.Header.Props) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      className={cn("flex", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  size = "default",
  children,
  ...props
}: AccordionPrimitive.Trigger.Props & VariantProps<typeof accordionVariants>) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(accordionVariants({ size, className }))}
      {...props}
    >
      {children}
      <svg
        data-slot="accordion-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
      <svg
        data-slot="accordion-spinner"
        className="animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </AccordionPrimitive.Trigger>
  )
}

function AccordionPanel({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      className={cn(
        /* why: the panel's own `--accordion-panel-height` css var (set by the
           primitive) drives a plain transition — no new keyframes, no second
           easing curve (D-17) */
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height,opacity] duration-[var(--duration-base)] ease-[var(--ease-brand)] data-[starting-style]:h-0 data-[starting-style]:opacity-0 data-[ending-style]:h-0 data-[ending-style]:opacity-0 in-data-[density=compact]:text-xs",
        className
      )}
      {...props}
    >
      <div className="px-4 pb-3 in-data-[density=compact]:px-3 in-data-[density=compact]:pb-2">
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
  accordionVariants,
}
