import type { ComponentProps, ComponentType } from "react";
import { cn } from "@/lib/utils";

/**
 * Domain pictograms only (CADR-04). Generic marks — chevron, calendar,
 * mail, check, arrow, user, download, alert, clock, shield, badge, refresh —
 * are lucide-react at the call site, never redrawn here.
 *
 * Contract: viewBox 24x24, no width/height (size-* utility governs it),
 * currentColor, consistent stroke weight across the set (D-21).
 */

const STROKE_WIDTH = 1.75;

function PictogramBase({
  className,
  children,
  ...props
}: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      {children}
    </svg>
  );
}

/** PUB-02 target profile — acheteur (buyer): briefcase with a handshake tick. */
function Acheteur(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="m9 13 2 2 4-4" />
    </PictogramBase>
  );
}

/** PUB-02 target profile — category manager: layered category tiles. */
function CategoryManager(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M3 3h7v7H3Z" />
      <path d="M14 3h7v7h-7Z" />
      <path d="M3 14h7v7H3Z" />
      <path d="M17.5 14v7M14 17.5h7" />
    </PictogramBase>
  );
}

/** PUB-02 target profile — supply chain and purchasing professionals. */
function SupplyChain(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M2 9h7v7H2Z" />
      <path d="M15 9h7v7h-7Z" />
      <path d="M8.5 2h7v7h-7Z" />
      <path d="M9 12.5h6M12 9V6.5" />
    </PictogramBase>
  );
}

/** PUB-02 target profile — SAP Ariba consultant, junior or reskilling. */
function Consultant(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <circle cx="12" cy="7.5" r="3" />
      <path d="M6 21v-1.5A5.5 5.5 0 0 1 11.5 14h1A5.5 5.5 0 0 1 18 19.5V21" />
      <path d="M9.5 8.5 12 6l2.5 2.5" />
    </PictogramBase>
  );
}

/** PUB-02 target profile — student or recent graduate. */
function Etudiant(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z" />
      <path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5" />
      <path d="M21 8.5v6" />
    </PictogramBase>
  );
}

/** PUB-03 acquired competency — the Ariba ecosystem as a whole. */
function EcosystemeAriba(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="17" r="2" />
      <circle cx="19" cy="17" r="2" />
      <path d="M12 7v4M12 11 6.5 15.5M12 11l5.5 4.5" />
    </PictogramBase>
  );
}

/** PUB-03 acquired competency — the Procure-to-Pay process. */
function ProcureToPay(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <circle cx="6" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H7" />
      <path d="m14 9 2 2 3-3" />
    </PictogramBase>
  );
}

/** PUB-03 acquired competency — the Source-to-Pay process. */
function SourceToPay(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <circle cx="10" cy="10" r="6" />
      <path d="m20 20-5.5-5.5" />
      <path d="M8 10h4" />
    </PictogramBase>
  );
}

/** PUB-03 acquired competency — RFQ and RFP calls for tender. */
function RfqRfp(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M6 2h9l4 4v16H6z" />
      <path d="M15 2v4h4" />
      <path d="M9 13h6M9 17h6" />
      <circle cx="10" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
    </PictogramBase>
  );
}

/** PUB-03 acquired competency — catalogue management. */
function GestionCatalogues(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2Z" />
      <path d="M4 18a2 2 0 0 1 2-2h13" />
      <path d="M8 8h7M8 11.5h7" />
    </PictogramBase>
  );
}

/** PUB-03 acquired competency — contracts and validation workflows. */
function ContratsWorkflows(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M3 4h7v6H3Z" />
      <path d="M14 14h7v6h-7Z" />
      <path d="M6.5 10v3a2 2 0 0 0 2 2H12" />
      <path d="m14.5 15.5 2.5-1.5-2.5-1.5" />
    </PictogramBase>
  );
}

/**
 * Registry keyed by the exact `picto` string used in
 * `src/locales/fr/landing.json`. A maquette resolves a name here rather than
 * through a switch statement; a missing key is a compile-time error via
 * `PictogramName`.
 */
export const pictograms = {
  "acheteur": Acheteur,
  "category-manager": CategoryManager,
  "supply-chain": SupplyChain,
  "consultant": Consultant,
  "etudiant": Etudiant,
  "ecosysteme-ariba": EcosystemeAriba,
  "procure-to-pay": ProcureToPay,
  "source-to-pay": SourceToPay,
  "rfq-rfp": RfqRfp,
  "gestion-catalogues": GestionCatalogues,
  "contrats-workflows": ContratsWorkflows,
} satisfies Record<string, ComponentType<ComponentProps<"svg">>>;

export type PictogramName = keyof typeof pictograms;

export {
  Acheteur,
  CategoryManager,
  SupplyChain,
  Consultant,
  Etudiant,
  EcosystemeAriba,
  ProcureToPay,
  SourceToPay,
  RfqRfp,
  GestionCatalogues,
  ContratsWorkflows,
};
