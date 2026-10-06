export type Kind = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  kind: Kind;
  monthlyLimit: number | null;
};

export type Transaction = {
  id: string;
  kind: Kind;
  amount: number;
  categoryId: string;
  note: string;
  date: string;
};

export type NewTransaction = Omit<Transaction, 'id'>;
