// Named icon-size scale (px, for react-icons' `size` prop) — see the style
// tile's icon scale. Use these instead of an arbitrary integer so every
// icon in the app is drawn at one of five deliberate sizes.
export const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

export type IconSizeKey = keyof typeof ICON_SIZE;
