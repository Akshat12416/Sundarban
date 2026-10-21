import { useMemo, createContext, useContext, type ReactNode } from "react";

import { useSession } from "../auth/AuthProvider";
import { accountSource } from "./account";
import { fakeSource } from "./fake";
import type { DataSource } from "./types";

const DataContext = createContext<DataSource>(fakeSource);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const source = useMemo(() => {
    if (!session || session.sample) {
      return fakeSource;
    }
    return accountSource(session.uid, session.email);
  }, [session]);
  return <DataContext.Provider value={source}>{children}</DataContext.Provider>;
}

export function useData(): DataSource {
  return useContext(DataContext);
}
