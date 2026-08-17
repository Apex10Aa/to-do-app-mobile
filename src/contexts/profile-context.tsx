import { createContext, useContext } from 'react';

import { type UseProfileResult } from '@/hooks/use-profile';
import { type Transaction } from '@/hooks/use-transactions';

// ---------------------------------------------------------------------------
// Combined context — profile + transactions, both owned by (app)/_layout.tsx
// so a single refresh() call after payment updates every tab instantly.
// ---------------------------------------------------------------------------
export interface AppContextValue extends UseProfileResult {
  transactions:        Transaction[];
  transactionsLoading: boolean;
  refreshTransactions: () => Promise<void>;
}

export const ProfileContext = createContext<AppContextValue>({
  profile:             null,
  loading:             true,
  refresh:             async () => {},
  transactions:        [],
  transactionsLoading: true,
  refreshTransactions: async () => {},
});

export function useSharedProfile(): AppContextValue {
  return useContext(ProfileContext);
}
