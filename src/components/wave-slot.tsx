// A designated first-child mount point inside a themed section, declared
// as real JSX so React owns and manages this node. ScrollWave finds these
// via [data-wave-slot] and portals a wave segment into each one — that's
// what lets the line paint above a section's own background but behind
// the section's real content (which comes after this in DOM order).
export function WaveSlot() {
  return (
    <div
      data-wave-slot
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
