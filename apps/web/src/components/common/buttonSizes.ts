// One control height across the app. Touch screens keep the 40px touch
// target; mouse-driven screens (pointer: fine) use a denser 34px — 30% less
// space above and below a 20px text line (10px → 7px). Buttons, icon
// buttons, chips and selects all share it so they line up in a row.
// (The sidebar keeps 40px: the footer is matched to its toggle.)

/** Buttons that show text (min-height, so long labels can still wrap). */
export const TEXT_BUTTON_HEIGHT =
  'min-h-10 [@media(pointer:fine)]:min-h-[34px]';

/** Square icon-only buttons. */
export const ICON_BUTTON_SIZE =
  'min-h-10 min-w-10 [@media(pointer:fine)]:min-h-[34px] [@media(pointer:fine)]:min-w-[34px]';

/** Fixed-height controls such as selects. */
export const CONTROL_HEIGHT = 'h-10 [@media(pointer:fine)]:h-[34px]';
