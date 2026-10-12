import { getSectionPathByLabel } from '../../../shared/constants/moduleNavigation';

/** The Big-O sections a card or button can open, by their sidebar labels. */
export type BigOSectionLabel =
  | 'Core Concepts'
  | 'Common Complexities'
  | 'Algorithm Analysis'
  | 'Advanced Concepts'
  | 'Practice Challenges'
  | 'Real-World Applications';

/**
 * Opens a Big-O section the way the module's sections do: a full navigation, so the section
 * starts at its top. The address comes from the navigation constants.
 */
export function openBigOSection(label: BigOSectionLabel): void {
  const path = getSectionPathByLabel('bigo', label);
  if (path) window.location.href = path;
}
