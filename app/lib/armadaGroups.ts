// Deterministic armada group assignment without schema change.
// Uses armada id hash to distribute 9 armada across A/B/C/D as evenly as possible.
const GROUPS = ['A', 'B', 'C', 'D'] as const;
const GROUP_SIZES = [3, 2, 2, 2]; // total 9 armada

export type ArmadaGroup = (typeof GROUPS)[number];

export function getArmadaGroup(armadaId: string): ArmadaGroup {
  let hash = 0;
  for (let i = 0; i < armadaId.length; i++) {
    hash = (hash * 31 + armadaId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % GROUPS.length;
  return GROUPS[idx];
}

export function listGroups() {
  return GROUPS;
}
