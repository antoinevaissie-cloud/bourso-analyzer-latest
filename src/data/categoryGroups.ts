export const ESSENTIAL_CATEGORIES: Set<string> = new Set<string>([
  'Alimentation',
  'Logement',
  'Santé',
  'Voyages & Transports',
  'Carburant',
  'Assurances',
  'Impôts',
  'Services publics',
]);

export const isEssential = (categoryParent: string): boolean => {
  return ESSENTIAL_CATEGORIES.has(categoryParent);
};
