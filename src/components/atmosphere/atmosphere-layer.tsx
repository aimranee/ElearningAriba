/* why: single root mount point for the whole document's atmosphere (D-20,
   AC-3) — Lot 1 mounted this per section and reached only 2 of 8, so this
   file is the only place `.bg-fixed`/`.mesh-layer`/`.mesh`/`.grid-fade` may
   appear. */
export function AtmosphereLayer() {
  return (
    <>
      <div className="bg-fixed" aria-hidden="true">
        <div className="mesh-layer" data-slot="mesh-layer">
          <div
            className="mesh"
            style={{
              width: 560,
              height: 560,
              background: "#CFC9FF",
              top: "-8%",
              left: "-6%",
              animation: "m1 24s var(--ease-brand) infinite",
            }}
          />
          <div
            className="mesh"
            style={{
              width: 520,
              height: 520,
              background: "#C5E4FF",
              top: "12%",
              right: "-9%",
              animation: "m2 28s var(--ease-brand) infinite",
            }}
          />
          <div
            className="mesh"
            style={{
              width: 440,
              height: 440,
              background: "#CFF6E7",
              bottom: "-6%",
              left: "8%",
              animation: "m3 30s var(--ease-brand) infinite",
            }}
          />
          <div
            className="mesh"
            style={{
              width: 480,
              height: 480,
              background: "#E7DBFF",
              bottom: "4%",
              right: "2%",
              animation: "m4 32s var(--ease-brand) infinite",
            }}
          />
        </div>
      </div>
      <div className="grid-fade" aria-hidden="true" />
    </>
  );
}
