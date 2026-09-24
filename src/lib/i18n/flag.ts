/*
 * why (#17, I18N-11): English stays off in production until Phases A and B
 * are both delivered; previews turn it on. Read at build time — Next inlines
 * NEXT_PUBLIC_* into every bundle — and only the exact string "true" turns
 * it on. When off, next.config.ts answers 404 on every /en route and no page
 * emits an English alternate.
 */
export const EN_ENABLED: boolean = process.env.NEXT_PUBLIC_EN_ENABLED === "true";
