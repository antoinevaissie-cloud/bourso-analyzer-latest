import { Tx } from '@/types/transaction';
import { TxAnnotation } from '@/types/annotations';
import { generateTxKey } from '@/utils/parsers';

const STORAGE_KEY = 'txAnnotations_v1';

type AnnotationMap = Record<string, TxAnnotation>;

const readStorage = (): AnnotationMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnnotationMap) : {};
  } catch {
    return {};
  }
};

const writeStorage = (map: AnnotationMap): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

export const getAnnotations = (): AnnotationMap => readStorage();

export const getAnnotationKeyForTx = (tx: Tx): string => {
  return generateTxKey(tx.dateOp, tx.label, tx.amount, tx.accountNum);
};

export const getAnnotationForTx = (tx: Tx): TxAnnotation | undefined => {
  const map = readStorage();
  const key = getAnnotationKeyForTx(tx);
  return map[key];
};

export const upsertAnnotationForTx = (
  tx: Tx,
  partial: Partial<TxAnnotation>
): TxAnnotation => {
  const map = readStorage();
  const key = getAnnotationKeyForTx(tx);
  const existing: TxAnnotation = map[key] || { flagged: false, note: '' };
  const updated: TxAnnotation = { ...existing, ...partial };
  map[key] = updated;
  writeStorage(map);
  return updated;
};

export const isFlagged = (tx: Tx): boolean => {
  const ann = getAnnotationForTx(tx);
  return !!ann?.flagged;
};

export const getNote = (tx: Tx): string => {
  const ann = getAnnotationForTx(tx);
  return ann?.note || '';
};
