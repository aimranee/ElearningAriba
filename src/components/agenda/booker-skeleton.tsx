import { Card, CardContent, CardHeader } from "@/components/ui/card";

/*
 * why (D-06, D-29): a drawn skeleton, not a void. D-06's static shell with a
 * client-side availability read *creates* this loading instant, so it is
 * designed rather than tolerated — never a bare spinner, never an empty
 * box, and never a content jump when the data lands. Occupies the exact
 * calendar + slot-list panel geometry this component's siblings render
 * once loaded. No new animation curve: the codebase has exactly one
 * cubic-bezier (--ease-brand, declared in globals.css) and this file adds
 * no second — the pulse below is Tailwind's built-in animate-pulse.
 */
export function BookerSkeleton() {
  const jours = Array.from({ length: 35 }, (_, i) => i);
  const chips = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card variant="outline" className="gap-3" aria-hidden="true">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <div className="bg-muted h-7 w-24 animate-pulse rounded-lg" />
          <div className="bg-muted h-7 w-24 animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent className="grid grid-cols-7 gap-2">
          {jours.map((j) => (
            <div
              key={j}
              className="bg-muted h-11 min-w-11 animate-pulse rounded-lg"
            />
          ))}
        </CardContent>
      </Card>

      <Card variant="outline" className="gap-3" aria-hidden="true">
        <CardHeader>
          <div className="bg-muted h-5 w-40 animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="bg-muted h-4 w-16 animate-pulse rounded" />
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <div
                key={`matin-${c}`}
                className="bg-muted h-11 w-20 animate-pulse rounded-lg"
              />
            ))}
          </div>
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <div
                key={`am-${c}`}
                className="bg-muted h-11 w-20 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
