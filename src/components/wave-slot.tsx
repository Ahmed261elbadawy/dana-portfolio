// A designated first-child mount point inside a themed section, declared
// as real JSX so React owns and manages this node (unlike the previous
// version of this feature, which mutated the DOM directly with
// insertBefore — React had no idea that node existed, and any later
// re-render of the section could silently wipe it out or corrupt the
// section's children). ScrollWave finds these via [data-wave-slot] and
// portals into them; nothing else needs to change here.
export function WaveSlot() {
  return (
    <div
      data-wave-slot
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
