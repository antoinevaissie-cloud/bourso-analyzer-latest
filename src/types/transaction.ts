export type Tx = {
  dateOp: string;
  dateVal: string;
  label: string;
  category: string;
  categoryParent: string;
  supplierFound: string | null;
  amount: number;
  comment: string;
  accountNum: string;
  accountLabel: "BoursoBank" | "BoursoBank (joint)";
  accountbalance?: number;
};