import { ESSENTIAL_CATEGORIES } from '@/data/categoryGroups';

const STORAGE_KEY = 'customEssentialCategories_v1';

const readCustom = (): Set<string> => {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set<string>();
  }
};

const writeCustom = (set: Set<string>): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

export const getCustomEssentialCategories = (): Set<string> => readCustom();

export const setCustomEssentialCategories = (categories: Set<string>): void => writeCustom(categories);

export const isEssential = (categoryParent: string): boolean => {
  const merged = new Set<string>(ESSENTIAL_CATEGORIES);
  for (const c of readCustom()) merged.add(c);
  return merged.has(categoryParent);
};

export const markCategoryEssential = (categoryParent: string, flag: boolean): void => {
  const current = readCustom();
  if (flag) current.add(categoryParent);
  else current.delete(categoryParent);
  writeCustom(current);
};
