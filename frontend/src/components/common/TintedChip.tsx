import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

// Shared badge treatment for enum values (status, priority). The tint carries
// the value at a glance; the label is what actually names it. FR-26.4: the
// label text mixes the hue with the theme foreground — dark text on light
// surfaces, light text on dark — so the 4.5:1 minimum holds in both modes
// and under every accent, while the hue identity stays visible.
export function TintedChip({ label, hue }: { label: string; hue: string }) {
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        bgcolor: `color-mix(in srgb, ${hue} 14%, var(--card))`,
        color: `color-mix(in srgb, ${hue} 42%, var(--foreground))`,
        border: `1px solid ${alpha(hue, 0.35)}`,
      }}
    />
  );
}
