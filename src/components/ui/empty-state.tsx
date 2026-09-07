"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Message } from "@/components/ui/message"

type EmptyStateTone = "neutral" | "waiting" | "error"

const EmptyStateContext = React.createContext<EmptyStateTone>("neutral")

const emptyStateVariants = cva(
  "flex flex-col items-center gap-3 text-center in-data-[density=compact]:gap-2",
  {
    variants: {
      tone: {
        neutral: "text-muted-foreground",
        waiting: "text-muted-foreground",
        error: "text-foreground",
      },
      size: {
        default: "px-6 py-10 in-data-[density=compact]:px-4 in-data-[density=compact]:py-6",
        sm: "px-4 py-6 in-data-[density=compact]:px-3 in-data-[density=compact]:py-4",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "default",
    },
  }
)

function EmptyState({
  className,
  tone = "neutral",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyStateVariants>) {
  return (
    <EmptyStateContext.Provider value={tone ?? "neutral"}>
      {/* why (D-32, D-19): the error/empty surface is one of the four
          permitted surface-state components and renders on public routes —
          a bordered shadow-none outline card would be the exact Lot 1
          failure AC-1 forbids ("zero bordered-flat cards on any public
          page"). The raised Card variant below makes this a floating card
          like every other surface, resolving the contradiction between
          D-32 (use this component, don't reinvent it) and AC-1 (no
          bordered-flat cards). */}
      <Card
        variant="raised"
        data-slot="empty-state"
        role={tone === "error" ? "alert" : undefined}
        className={cn(emptyStateVariants({ tone, size, className }))}
        {...props}
      />
    </EmptyStateContext.Provider>
  )
}

function EmptyStateIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      data-slot="empty-state-icon"
      className={cn("text-muted-foreground size-10 in-data-[density=compact]:size-8", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    />
  )
}

function EmptyStateTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state-title"
      className={cn(
        "text-foreground font-heading text-base font-semibold in-data-[density=compact]:text-sm",
        className
      )}
      {...props}
    />
  )
}

function EmptyStateDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const tone = React.useContext(EmptyStateContext)

  /* why: a failed payment handoff must be announced like any other server
     rejection (D-23, T-01-20) — the error tone renders the shared Message
     part instead of a silent paragraph; every other tone stays a plain
     description */
  if (tone === "error") {
    return (
      <Message
        data-slot="empty-state-description"
        variant="error"
        className={cn("in-data-[density=compact]:text-xs", className)}
        {...props}
      >
        {children}
      </Message>
    )
  }

  return (
    <p
      data-slot="empty-state-description"
      className={cn("text-sm in-data-[density=compact]:text-xs", className)}
      {...props}
    >
      {children}
    </p>
  )
}

function EmptyStateAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-action"
      className={cn("mt-1 in-data-[density=compact]:mt-0.5", className)}
      {...props}
    />
  )
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
  emptyStateVariants,
}
