export const buildFileName = (userName?: string | null): string => {
  const name = userName?.trim();
  return name ? `Cover_Letter_${name.replace(/\s+/g, '_')}` : 'Cover_Letter';
};
